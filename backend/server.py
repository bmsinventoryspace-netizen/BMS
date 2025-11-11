from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import random
import string
from openpyxl import Workbook
from io import BytesIO
import base64
from PIL import Image
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise ValueError("MONGO_URL environment variable is not set")

client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'bms_inventory')]

# JWT configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'bms-inventory-secret-key-2025')
ALGORITHM = 'HS256'
security = HTTPBearer()

# WebSocket connections
active_connections: List[WebSocket] = []

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    username: str
    role: str  # 'admin' or 'employee'
    phone: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = 'employee'
    phone: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Article(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: int
    type: str  # 'piece' or 'liquide'
    photos: List[str] = []
    nom: str
    ref: Optional[str] = None
    sku: str
    description: Optional[str] = None
    etat: Optional[str] = None
    categorie: Optional[str] = None
    sous_categorie: Optional[str] = None
    lieu: Optional[str] = None
    date_obtention: Optional[str] = None
    posted_by: str
    date_post: str
    prix_neuf: Optional[float] = None
    prix_achat: Optional[float] = None
    prix_vente: Optional[float] = None
    quantite: int = 1
    public: bool = False
    # Liquide specific
    marque: Optional[str] = None
    litres: Optional[float] = None
    quantite_min: Optional[float] = None
    usage_hebdo: Optional[float] = None
    viscosite: Optional[str] = None
    norme: Optional[str] = None
    usage: Optional[str] = None

class ArticleCreate(BaseModel):
    type: str
    photos: List[str] = []
    nom: str
    ref: str  # Référence maintenant obligatoire
    description: Optional[str] = None
    etat: Optional[str] = None
    categorie: Optional[str] = None
    sous_categorie: Optional[str] = None
    lieu: Optional[str] = None
    date_obtention: Optional[str] = None
    prix_neuf: Optional[float] = None
    prix_achat: Optional[float] = None
    prix_vente: Optional[float] = None
    quantite: int = 1
    public: bool = False
    marque: Optional[str] = None
    litres: Optional[float] = None
    quantite_min: Optional[float] = None
    usage_hebdo: Optional[float] = None
    viscosite: Optional[str] = None
    norme: Optional[str] = None
    usage: Optional[str] = None

class PostIt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    objet: str
    message: str
    photo: Optional[str] = None
    posted_by: str
    date: str
    checks: List[str] = []

class PostItCreate(BaseModel):
    objet: str
    message: str
    photo: Optional[str] = None

class AgendaEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    titre: str
    date: str
    description: Optional[str] = None
    invites: List[str] = []
    created_by: str

class AgendaEventCreate(BaseModel):
    titre: str
    date: str
    description: Optional[str] = None
    invites: List[str] = []

class Pub(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    type: str  # 'pub' or 'offre'
    nom: str
    description: Optional[str] = None
    image: Optional[str] = None
    duree_debut: str
    duree_fin: str

class PubCreate(BaseModel):
    type: str
    nom: str
    description: Optional[str] = None
    image: Optional[str] = None
    duree_jours: int

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    tel_commande: Optional[str] = None
    tel_pub: Optional[str] = None
    logo: Optional[str] = None

class TodoItem(BaseModel):
    text: str
    done: bool = False

class MemoUpdate(BaseModel):
    content: str

# Helper functions
def create_token(username: str, role: str) -> str:
    payload = {
        'username': username,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(days=30)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')

def generate_sku() -> str:
    return 'BMS-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

async def broadcast_notification(message: dict):
    """Send notification to all connected WebSocket clients"""
    disconnected = []
    for connection in active_connections:
        try:
            await connection.send_json(message)
        except:
            disconnected.append(connection)
    
    for conn in disconnected:
        active_connections.remove(conn)

def compress_image(base64_str: str, max_size: tuple = (1200, 1200), quality: int = 85) -> str:
    """Compress base64 image"""
    try:
        if not base64_str or not base64_str.startswith('data:image'):
            return base64_str
        
        header, data = base64_str.split(',', 1)
        img_data = base64.b64decode(data)
        img = Image.open(BytesIO(img_data))
        
        # Convert RGBA to RGB if necessary
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        
        # Resize if needed
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Compress
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=quality, optimize=True)
        compressed_data = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/jpeg;base64,{compressed_data}"
    except:
        return base64_str

# Initialize admin user
@app.on_event("startup")
async def startup_event():
    # Create admin user if not exists
    admin = await db.users.find_one({'username': 'AdminLudo'})
    if not admin:
        hashed_pw = bcrypt.hashpw('AdminLudo'.encode('utf-8'), bcrypt.gensalt())
        await db.users.insert_one({
            'username': 'AdminLudo',
            'password': hashed_pw.decode('utf-8'),
            'role': 'admin',
            'phone': None,
            'created_at': datetime.now(timezone.utc).isoformat()
        })
    
    # Initialize settings if not exists
    settings = await db.settings.find_one({})
    if not settings:
        await db.settings.insert_one({
            'tel_commande': None,
            'tel_pub': None
        })

# WebSocket endpoint
@api_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(websocket)

# Auth routes
@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({'username': credentials.username})
    if not user:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    token = create_token(user['username'], user['role'])
    return {
        'token': token,
        'user': {
            'username': user['username'],
            'role': user['role'],
            'phone': user.get('phone')
        }
    }

@api_router.get("/auth/me")
async def get_current_user(user_data: dict = Depends(verify_token)):
    user = await db.users.find_one({'username': user_data['username']}, {'_id': 0, 'password': 0})
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    return user

# User management (admin only)
@api_router.get("/users", response_model=List[User])
async def get_users(user_data: dict = Depends(verify_token)):
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Admin only')
    users = await db.users.find({}, {'_id': 0, 'password': 0}).to_list(1000)
    return users

@api_router.post("/users")
async def create_user(user: UserCreate, user_data: dict = Depends(verify_token)):
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Admin only')
    
    existing = await db.users.find_one({'username': user.username})
    if existing:
        raise HTTPException(status_code=400, detail='User already exists')
    
    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    await db.users.insert_one({
        'username': user.username,
        'password': hashed_pw.decode('utf-8'),
        'role': user.role,
        'phone': user.phone,
        'created_at': datetime.now(timezone.utc).isoformat()
    })
    
    return {'message': 'User created successfully'}

@api_router.put("/users/{username}")
async def update_user(username: str, user: UserCreate, user_data: dict = Depends(verify_token)):
    if user_data['role'] != 'admin' and user_data['username'] != username:
        raise HTTPException(status_code=403, detail='Unauthorized')
    
    update_data = {'phone': user.phone}
    if user.password:
        hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
        update_data['password'] = hashed_pw.decode('utf-8')
    
    await db.users.update_one({'username': username}, {'$set': update_data})
    return {'message': 'User updated successfully'}

@api_router.delete("/users/{username}")
async def delete_user(username: str, user_data: dict = Depends(verify_token)):
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Admin only')
    
    if username == 'AdminLudo':
        raise HTTPException(status_code=400, detail='Cannot delete admin user')
    
    await db.users.delete_one({'username': username})
    return {'message': 'User deleted successfully'}

# Articles/Inventory
@api_router.get("/articles", response_model=List[Article])
async def get_articles(user_data: dict = Depends(verify_token)):
    articles = await db.articles.find({}, {'_id': 0}).sort('id', -1).to_list(10000)
    return articles

@api_router.get("/articles/public")
async def get_public_articles():
    articles = await db.articles.find({'public': True}, {'_id': 0}).sort('id', -1).to_list(1000)
    return articles

@api_router.post("/articles")
async def create_article(article: ArticleCreate, user_data: dict = Depends(verify_token)):
    # Get next ID
    last_article = await db.articles.find_one({}, {'_id': 0, 'id': 1}, sort=[('id', -1)])
    next_id = (last_article['id'] + 1) if last_article else 1
    
    # Check if SKU already exists, generate new one if needed
    sku = generate_sku()
    while await db.articles.find_one({'sku': sku}):
        sku = generate_sku()
    
    # Compress photos
    compressed_photos = [compress_image(photo) for photo in article.photos]
    
    article_data = article.model_dump()
    article_data['id'] = next_id
    article_data['sku'] = sku
    article_data['photos'] = compressed_photos
    article_data['posted_by'] = user_data['username']
    article_data['date_post'] = datetime.now(timezone.utc).isoformat()
    
    await db.articles.insert_one(article_data)
    
    # Broadcast notification
    await broadcast_notification({
        'type': 'article_created',
        'data': {'id': next_id, 'nom': article.nom, 'by': user_data['username']}
    })
    
    return {'id': next_id, 'sku': sku, 'message': 'Article created successfully'}

@api_router.put("/articles/{article_id}")
async def update_article(article_id: int, article: ArticleCreate, user_data: dict = Depends(verify_token)):
    existing = await db.articles.find_one({'id': article_id})
    if not existing:
        raise HTTPException(status_code=404, detail='Article not found')
    
    # Compress new photos
    compressed_photos = [compress_image(photo) for photo in article.photos]
    
    article_data = article.model_dump()
    article_data['photos'] = compressed_photos
    article_data['posted_by'] = existing['posted_by']
    article_data['date_post'] = existing['date_post']
    
    await db.articles.update_one({'id': article_id}, {'$set': article_data})
    
    await broadcast_notification({
        'type': 'article_updated',
        'data': {'id': article_id, 'nom': article.nom, 'by': user_data['username']}
    })
    
    return {'message': 'Article updated successfully'}

@api_router.delete("/articles/{article_id}")
async def delete_article(article_id: int, user_data: dict = Depends(verify_token)):
    await db.articles.delete_one({'id': article_id})
    return {'message': 'Article deleted successfully'}

@api_router.get("/articles/generate-sku")
async def get_new_sku(user_data: dict = Depends(verify_token)):
    sku = generate_sku()
    while await db.articles.find_one({'sku': sku}):
        sku = generate_sku()
    return {'sku': sku}

@api_router.post("/articles/export")
async def export_articles(user_data: dict = Depends(verify_token)):
    articles = await db.articles.find({}, {'_id': 0}).to_list(10000)
    
    wb = Workbook()
    ws = wb.active
    ws.title = "Inventaire"
    
    # Headers
    headers = ['ID', 'Type', 'Nom', 'Référence', 'SKU', 'Description', 'État', 'Catégorie', 
               'Sous-catégorie', 'Lieu', 'Date obtention', 'Posté par', 'Date post', 
               'Prix neuf', 'Prix achat', 'Prix vente', 'Quantité', 'Public',
               'Marque', 'Litres', 'Quantité min', 'Usage hebdo', 'Viscosité', 'Norme', 'Usage']
    ws.append(headers)
    
    # Data
    for article in articles:
        row = [
            article.get('id'),
            article.get('type'),
            article.get('nom'),
            article.get('ref'),
            article.get('sku'),
            article.get('description'),
            article.get('etat'),
            article.get('categorie'),
            article.get('sous_categorie'),
            article.get('lieu'),
            article.get('date_obtention'),
            article.get('posted_by'),
            article.get('date_post'),
            article.get('prix_neuf'),
            article.get('prix_achat'),
            article.get('prix_vente'),
            article.get('quantite'),
            'Oui' if article.get('public') else 'Non',
            article.get('marque'),
            article.get('litres'),
            article.get('quantite_min'),
            article.get('usage_hebdo'),
            article.get('viscosite'),
            article.get('norme'),
            article.get('usage')
        ]
        ws.append(row)
    
    # Save to BytesIO
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    # Save temporarily
    temp_path = f'/tmp/inventaire_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
    with open(temp_path, 'wb') as f:
        f.write(buffer.getvalue())
    
    return FileResponse(temp_path, filename='inventaire_bms.xlsx', media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

# Update liquid quantity
@api_router.post("/articles/{article_id}/quantity")
async def update_quantity(article_id: int, data: dict, user_data: dict = Depends(verify_token)):
    article = await db.articles.find_one({'id': article_id})
    if not article:
        raise HTTPException(status_code=404, detail='Article not found')
    
    new_litres = article.get('litres', 0) + data.get('change', 0)
    if new_litres < 0:
        new_litres = 0
    
    await db.articles.update_one({'id': article_id}, {'$set': {'litres': new_litres}})
    return {'message': 'Quantity updated', 'new_litres': new_litres}

# Post-its
@api_router.get("/postits", response_model=List[PostIt])
async def get_postits(user_data: dict = Depends(verify_token)):
    postits = await db.postits.find({}, {'_id': 0}).sort('date', -1).to_list(1000)
    return postits

@api_router.post("/postits")
async def create_postit(postit: PostItCreate, user_data: dict = Depends(verify_token)):
    # Compress photo if exists
    compressed_photo = compress_image(postit.photo) if postit.photo else None
    
    postit_data = {
        'id': str(uuid.uuid4()),
        'objet': postit.objet,
        'message': postit.message,
        'photo': compressed_photo,
        'posted_by': user_data['username'],
        'date': datetime.now(timezone.utc).isoformat(),
        'checks': []
    }
    
    await db.postits.insert_one(postit_data)
    
    await broadcast_notification({
        'type': 'postit_created',
        'data': {'objet': postit.objet, 'by': user_data['username']}
    })
    
    return postit_data

@api_router.post("/postits/{postit_id}/check")
async def check_postit(postit_id: str, user_data: dict = Depends(verify_token)):
    postit = await db.postits.find_one({'id': postit_id})
    if not postit:
        raise HTTPException(status_code=404, detail='Post-it not found')
    
    checks = postit.get('checks', [])
    if user_data['username'] not in checks:
        checks.append(user_data['username'])
        await db.postits.update_one({'id': postit_id}, {'$set': {'checks': checks}})
    
    await broadcast_notification({
        'type': 'postit_checked',
        'data': {'id': postit_id, 'by': user_data['username']}
    })
    
    return {'message': 'Check added'}

@api_router.delete("/postits/{postit_id}")
async def delete_postit(postit_id: str, user_data: dict = Depends(verify_token)):
    postit = await db.postits.find_one({'id': postit_id})
    if not postit:
        raise HTTPException(status_code=404, detail='Post-it not found')
    
    # Vérifier que l'utilisateur est soit admin, soit le créateur du post-it
    if user_data['role'] != 'admin' and postit['posted_by'] != user_data['username']:
        raise HTTPException(status_code=403, detail='Unauthorized')
    
    await db.postits.delete_one({'id': postit_id})
    
    await broadcast_notification({
        'type': 'postit_deleted',
        'data': {'id': postit_id, 'by': user_data['username']}
    })
    
    return {'message': 'Post-it deleted'}

# Agenda
@api_router.get("/agenda", response_model=List[AgendaEvent])
async def get_agenda_events(user_data: dict = Depends(verify_token)):
    events = await db.agenda.find({}, {'_id': 0}).to_list(1000)
    return events

@api_router.post("/agenda")
async def create_agenda_event(event: AgendaEventCreate, user_data: dict = Depends(verify_token)):
    event_data = {
        'id': str(uuid.uuid4()),
        'titre': event.titre,
        'date': event.date,
        'description': event.description,
        'invites': event.invites,
        'created_by': user_data['username']
    }
    
    await db.agenda.insert_one(event_data)
    
    await broadcast_notification({
        'type': 'agenda_created',
        'data': {'titre': event.titre, 'date': event.date}
    })
    
    return event_data

@api_router.delete("/agenda/{event_id}")
async def delete_agenda_event(event_id: str, user_data: dict = Depends(verify_token)):
    await db.agenda.delete_one({'id': event_id})
    return {'message': 'Event deleted'}

# Pubs/Offres (admin only)
@api_router.get("/pubs")
async def get_pubs():
    now = datetime.now(timezone.utc).isoformat()
    pubs = await db.pubs.find({'duree_fin': {'$gte': now}}, {'_id': 0}).to_list(1000)
    return pubs

@api_router.post("/pubs")
async def create_pub(pub: PubCreate, user_data: dict = Depends(verify_token)):
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Admin only')
    
    compressed_image = compress_image(pub.image) if pub.image else None
    
    now = datetime.now(timezone.utc)
    end_date = now + timedelta(days=pub.duree_jours)
    
    pub_data = {
        'id': str(uuid.uuid4()),
        'type': pub.type,
        'nom': pub.nom,
        'description': pub.description,
        'image': compressed_image,
        'duree_debut': now.isoformat(),
        'duree_fin': end_date.isoformat()
    }
    
    await db.pubs.insert_one(pub_data)
    return pub_data

@api_router.delete("/pubs/{pub_id}")
async def delete_pub(pub_id: str, user_data: dict = Depends(verify_token)):
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Admin only')
    
    await db.pubs.delete_one({'id': pub_id})
    return {'message': 'Pub deleted'}

# Settings (admin only)
@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({}, {'_id': 0})
    if not settings:
        return {'tel_commande': None, 'tel_pub': None}
    return settings

@api_router.put("/settings")
async def update_settings(settings: Settings, user_data: dict = Depends(verify_token)):
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Admin only')
    
    await db.settings.update_one({}, {'$set': settings.model_dump()}, upsert=True)
    return {'message': 'Settings updated'}

# Memo (user-specific)
@api_router.get("/memo")
async def get_memo(user_data: dict = Depends(verify_token)):
    memo = await db.memos.find_one({'username': user_data['username']}, {'_id': 0})
    return {'content': memo['content'] if memo else ''}

@api_router.put("/memo")
async def update_memo(data: MemoUpdate, user_data: dict = Depends(verify_token)):
    await db.memos.update_one(
        {'username': user_data['username']},
        {'$set': {'content': data.content}},
        upsert=True
    )
    return {'message': 'Memo updated'}

# Todos (user-specific)
@api_router.get("/todos")
async def get_todos(user_data: dict = Depends(verify_token)):
    todos = await db.todos.find_one({'username': user_data['username']}, {'_id': 0})
    return {'items': todos['items'] if todos else []}

@api_router.put("/todos")
async def update_todos(data: dict, user_data: dict = Depends(verify_token)):
    await db.todos.update_one(
        {'username': user_data['username']},
        {'$set': {'items': data['items']}},
        upsert=True
    )
    return {'message': 'Todos updated'}

# Categories
@api_router.get("/categories")
async def get_categories():
    articles = await db.articles.find({}, {'_id': 0, 'categorie': 1, 'sous_categorie': 1}).to_list(10000)
    
    categories = set()
    sous_categories = set()
    
    for article in articles:
        if article.get('categorie'):
            categories.add(article['categorie'])
        if article.get('sous_categorie'):
            sous_categories.add(article['sous_categorie'])
    
    return {
        'categories': sorted(list(categories)),
        'sous_categories': sorted(list(sous_categories))
    }

# Stats tracking
@api_router.post("/articles/{article_id}/view")
async def track_article_view(article_id: int):
    """Track when an article is viewed in the public catalogue"""
    await db.article_stats.update_one(
        {'article_id': article_id},
        {
            '$inc': {'views': 1},
            '$set': {'last_viewed': datetime.now(timezone.utc).isoformat()}
        },
        upsert=True
    )
    return {'message': 'View tracked'}

@api_router.get("/stats/articles")
async def get_article_stats(user_data: dict = Depends(verify_token)):
    """Get view statistics for all articles"""
    stats = await db.article_stats.find({}, {'_id': 0}).to_list(10000)
    articles = await db.articles.find({}, {'_id': 0, 'id': 1, 'nom': 1, 'ref': 1, 'photos': 1}).to_list(10000)
    
    # Create a map of article details
    article_map = {a['id']: a for a in articles}
    
    # Combine stats with article details
    result = []
    for stat in stats:
        article_id = stat.get('article_id')
        if article_id in article_map:
            result.append({
                'article_id': article_id,
                'nom': article_map[article_id].get('nom'),
                'ref': article_map[article_id].get('ref'),
                'photo': article_map[article_id].get('photos', [None])[0],
                'views': stat.get('views', 0),
                'last_viewed': stat.get('last_viewed')
            })
    
    # Sort by views descending
    result.sort(key=lambda x: x['views'], reverse=True)
    return result

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse, Response
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
from PIL import Image, ImageOps
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
    theme_color: Optional[str] = 'blue'  # blue, green, red, purple, orange, teal, pink, indigo
    deal_email: Optional[str] = None  # email destinataire pour nouveaux deals

class Deal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    nom: str
    description: Optional[str] = None
    image: Optional[str] = None
    lien: Optional[str] = None
    prix: float
    prix_ref: Optional[float] = None
    disponible: bool = True
    posted_by: str
    date: str

class DealCreate(BaseModel):
    nom: str
    description: Optional[str] = None
    image: Optional[str] = None
    lien: Optional[str] = None
    prix: float
    prix_ref: Optional[float] = None
    disponible: Optional[bool] = True

class TodoItem(BaseModel):
    text: str
    done: bool = False

class MemoUpdate(BaseModel):
    content: str

class CommandeItem(BaseModel):
    article_id: int
    nom: str
    ref: Optional[str] = None
    prix_vente: float
    quantite: int

class CommandeCreate(BaseModel):
    items: List[CommandeItem]
    total: float

class Commande(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    numero: str
    items: List[CommandeItem]
    total: float
    date: str
    statut: str = "en_attente"  # en_attente, validee, annulee

class CommandeStatutUpdate(BaseModel):
    statut: str

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

def compress_image(base64_str: str, max_size: tuple = (750, 750), quality: int = 75) -> str:
    """Compress base64 image and fix EXIF orientation"""
    try:
        if not base64_str or not isinstance(base64_str, str):
            return base64_str
        
        # Check if it's a data URL
        if not base64_str.startswith('data:image'):
            # Might already be processed or invalid, return as-is
            return base64_str
        
        # Split header and data
        if ',' not in base64_str:
            return base64_str
        
        header, data = base64_str.split(',', 1)
        if not data:
            return base64_str
        
        # Decode base64
        try:
            img_data = base64.b64decode(data)
        except Exception as e:
            print(f"Error decoding base64: {e}")
            return base64_str
        
        if not img_data:
            return base64_str
        
        # Open image
        try:
            img = Image.open(BytesIO(img_data))
        except Exception as e:
            print(f"Error opening image: {e}")
            return base64_str
        
        # Fix EXIF orientation (rotates image based on EXIF data)
        # This will automatically rotate the image to the correct orientation
        try:
            img = ImageOps.exif_transpose(img)
        except Exception as exif_err:
            # If exif_transpose fails, try to get orientation from EXIF manually
            try:
                exif = img.getexif()
                if exif is not None:
                    orientation = exif.get(274)  # Orientation tag
                    if orientation == 3:
                        img = img.rotate(180, expand=True)
                    elif orientation == 6:
                        img = img.rotate(270, expand=True)
                    elif orientation == 8:
                        img = img.rotate(90, expand=True)
            except Exception:
                pass  # If all fails, use image as-is
        
        # Convert RGBA to RGB if necessary
        if img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize if needed
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Compress and save without EXIF to avoid orientation issues
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=quality, optimize=True)
        compressed_data = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/jpeg;base64,{compressed_data}"
    except Exception as e:
        print(f"Error compressing image: {e}")
        import traceback
        traceback.print_exc()
        return base64_str

# Initialize admin user
@app.on_event("startup")
async def startup_event():
    # Create indexes for better query performance
    try:
        # Index on articles.id for sorting
        await db.articles.create_index([('id', -1)], background=True)
        # Index on articles.public for filtering
        await db.articles.create_index([('public', 1)], background=True)
        # Compound index for public articles sorted by id
        await db.articles.create_index([('public', 1), ('id', -1)], background=True)
        
        # Index on postits.date for sorting
        await db.postits.create_index([('date', -1)], background=True)
        
        # Index on deals.date for sorting
        await db.deals.create_index([('date', -1)], background=True)
        # Index on deals.posted_by for filtering
        await db.deals.create_index([('posted_by', 1)], background=True)
        
        # Index on commandes.date for sorting
        await db.commandes.create_index([('date', -1)], background=True)
        # Index on commandes.numero for sorting
        await db.commandes.create_index([('numero', -1)], background=True)
    except Exception as e:
        print(f"Warning: Could not create indexes (they may already exist): {e}")
    
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
            'tel_pub': None,
            'theme_color': 'blue',
            'deal_email': None
        })
    else:
        # ensure new fields exist
        updates = {}
        if 'deal_email' not in settings:
            updates['deal_email'] = None
        if updates:
            await db.settings.update_one({}, {'$set': updates})

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
@api_router.get("/articles/liquides")
async def get_liquides(user_data: dict = Depends(verify_token)):
    """Get all liquides - optimized for Huiles page"""
    projection = {
        '_id': 0,
        'id': 1,
        'nom': 1,
        'ref': 1,
        'sku': 1,
        'categorie': 1,
        'type': 1,
        'litres': 1,
        'quantite_min': 1,
        'usage_hebdo': 1,
        'viscosite': 1,
        'marque': 1,
        'norme': 1,
        'usage': 1
    }
    
    liquides = await db.articles.find(
        {'type': 'liquide'}, 
        projection
    ).sort('id', -1).allow_disk_use(True).to_list(10000)
    
    # Add has_photo flag
    article_ids = [a['id'] for a in liquides]
    photos_check = await db.articles.find(
        {'id': {'$in': article_ids}, 'photos.0': {'$exists': True}},
        {'_id': 0, 'id': 1}
    ).to_list(10000)
    articles_with_photos = {doc['id'] for doc in photos_check}
    
    for liquide in liquides:
        liquide['has_photo'] = liquide['id'] in articles_with_photos
        liquide['photos'] = []
    
    return liquides

@api_router.get("/articles")
async def get_articles(
    page: int = 1,
    limit: int = 30,
    search: str = None,
    category: str = None,
    sous_category: str = None,
    etat: str = None,
    type: str = None,
    user_data: dict = Depends(verify_token)
):
    """Get articles with pagination and filters - only essential fields for list view"""
    skip = (page - 1) * limit
    
    # Build query filter
    query = {}
    
    # Search in multiple fields
    if search:
        query['$or'] = [
            {'nom': {'$regex': search, '$options': 'i'}},
            {'ref': {'$regex': search, '$options': 'i'}},
            {'sku': {'$regex': search, '$options': 'i'}},
            {'id': {'$regex': search, '$options': 'i'}}
        ]
    
    # Category filter
    if category and category != 'all':
        query['categorie'] = category
    
    # Sous-category filter
    if sous_category and sous_category != 'all':
        query['sous_categorie'] = {'$regex': sous_category, '$options': 'i'}
    
    # État filter
    if etat and etat != 'all':
        query['etat'] = etat
    
    # Type filter
    if type and type != 'all':
        query['type'] = type
    
    # Get total count with filters
    total = await db.articles.count_documents(query)
    
    # Projection: only load essential fields for list display (NO PHOTOS to reduce payload)
    projection = {
        '_id': 0,
        'id': 1,
        'nom': 1,
        'ref': 1,
        'sku': 1,
        'categorie': 1,
        'sous_categorie': 1,
        'etat': 1,
        'type': 1,
        'public': 1,
        'quantite': 1,
        'litres': 1,
        'prix_vente': 1,
        'marque': 1,
        'photos': {'$slice': 0}
    }
    
    # Get paginated and filtered articles
    cursor = db.articles.find(query, projection).sort('id', -1).skip(skip).limit(limit)
    articles = await cursor.to_list(limit)
    
    # Add has_photo flag
    article_ids = [a['id'] for a in articles]
    photos_check = await db.articles.find(
        {'id': {'$in': article_ids}, 'photos.0': {'$exists': True}},
        {'_id': 0, 'id': 1}
    ).to_list(100)
    articles_with_photos = {doc['id'] for doc in photos_check}
    
    for article in articles:
        article['has_photo'] = article['id'] in articles_with_photos
        article['photos'] = []
    
    return {
        'articles': articles,
        'total': total,
        'page': page,
        'limit': limit,
        'total_pages': (total + limit - 1) // limit
    }

# PUBLIC ROUTES MUST COME BEFORE PARAMETERIZED ROUTES
@api_router.get("/articles/public")
async def get_public_articles():
    """Get public articles - with first photo for display (NO AUTH REQUIRED)"""
    try:
        print("=== PUBLIC ARTICLES ENDPOINT CALLED ===")
        
        # Récupérer tous les articles publics avec la première photo
        all_articles = await db.articles.find(
            {'public': True}, 
            {'_id': 0}  # Load all fields including photos
        ).sort('id', -1).to_list(1000)
        
        print(f"Found {len(all_articles)} public articles")
        
        # Filtrer ceux qui ont du stock (quantite > 0 pour pièces, litres > 0 pour liquides)
        articles = [
            a for a in all_articles 
            if (a.get('type') == 'piece' and a.get('quantite', 0) > 0) or 
               (a.get('type') == 'liquide' and a.get('litres', 0) > 0)
        ]
        
        print(f"Filtered to {len(articles)} articles with stock")
        
        # Keep only first photo to reduce payload
        for article in articles:
            if article.get('photos') and len(article['photos']) > 0:
                article['photos'] = [article['photos'][0]]  # Keep only first photo
            else:
                article['photos'] = []
        
        print(f"Returning {len(articles)} articles")
        return articles
    except Exception as e:
        print(f"!!! ERROR in public articles: {e}")
        logger.error(f"Error fetching public articles: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/articles/public/{article_id}")
async def get_public_article(article_id: int):
    """Get full public article details including photos"""
    article = await db.articles.find_one({'id': article_id, 'public': True}, {'_id': 0})
    if not article:
        raise HTTPException(status_code=404, detail='Article not found')
    return article

# PROTECTED ROUTES (require authentication)
@api_router.get("/articles/{article_id}")
async def get_article(article_id: int, user_data: dict = Depends(verify_token)):
    """Get full article details by ID (authenticated)"""
    article = await db.articles.find_one({'id': article_id}, {'_id': 0})
    if not article:
        raise HTTPException(status_code=404, detail='Article not found')
    return article

@api_router.post("/articles")
async def create_article(article: ArticleCreate, user_data: dict = Depends(verify_token)):
    # Get next ID (index on id should handle this efficiently)
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
    
    article_data = article.model_dump()
    
    # Preserve existing photos if no new photos provided
    if article.photos and len(article.photos) > 0:
        # Compress new photos
        compressed_photos = [compress_image(photo) for photo in article.photos]
        article_data['photos'] = compressed_photos
    else:
        # Keep existing photos if no new ones provided
        article_data['photos'] = existing.get('photos', [])
    
    # Preserve metadata that shouldn't change
    article_data['posted_by'] = existing.get('posted_by')
    article_data['date_post'] = existing.get('date_post')
    
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
    # Index on date should handle sorting efficiently
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
        return {'tel_commande': None, 'tel_pub': None, 'theme_color': 'blue', 'deal_email': None}
    if 'theme_color' not in settings:
        settings['theme_color'] = 'blue'
    if 'deal_email' not in settings:
        settings['deal_email'] = None
    return settings

@api_router.put("/settings")
async def update_settings(settings: Settings, user_data: dict = Depends(verify_token)):
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Admin only')
    
    await db.settings.update_one({}, {'$set': settings.model_dump()}, upsert=True)
    return {'message': 'Settings updated'}

# Deals (DealBurner role creates; admin/employee read)
def _send_deal_email_if_configured(deal: Dict[str, Any]):
    """Optional: send email when a new deal is created, if SMTP env is configured and settings.deal_email present"""
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.utils import formataddr
    except Exception:
        return
    try:
        smtp_host = os.environ.get('SMTP_HOST')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_user = os.environ.get('SMTP_USER')
        smtp_pass = os.environ.get('SMTP_PASS')
        smtp_from = os.environ.get('SMTP_FROM') or smtp_user
        if not smtp_host or not smtp_user or not smtp_pass or not smtp_from:
            return
        # fetch deal_email sync via motor's underlying sync client not available; we skip and rely on deal['notify_to']
        to_email = deal.get('notify_to')
        if not to_email:
            return
        subject = f"Nouveau Deal: {deal.get('nom')}"
        lines = [
            f"Nom: {deal.get('nom')}",
            f"Prix: {deal.get('prix')}",
            f"Prix de ref: {deal.get('prix_ref') or 'N/A'}",
            f"Lien: {deal.get('lien') or 'N/A'}",
            f"Posté par: {deal.get('posted_by')}",
            f"Date: {deal.get('date')}",
        ]
        body = "\n".join(lines)
        msg = MIMEText(body, _charset='utf-8')
        msg['Subject'] = subject
        msg['From'] = formataddr(('BMS Inventory', smtp_from))
        msg['To'] = to_email
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
        try:
            server.starttls()
        except Exception:
            pass
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_from, [to_email], msg.as_string())
        server.quit()
    except Exception as e:
        logger.warning(f"SMTP deal email failed: {e}")

@api_router.post("/deals")
async def create_deal(deal: DealCreate, user_data: dict = Depends(verify_token)):
    # Only role 'dealburner' can create
    if user_data['role'] != 'dealburner':
        raise HTTPException(status_code=403, detail='DealBurner only')
    compressed_image = compress_image(deal.image) if deal.image else None
    deal_id = str(uuid.uuid4())
    deal_data = {
        'id': deal_id,
        'nom': deal.nom,
        'description': deal.description,
        'image': compressed_image,
        'lien': deal.lien,
        'prix': deal.prix,
        'prix_ref': deal.prix_ref,
        'disponible': True if deal.disponible is None else deal.disponible,
        'posted_by': user_data['username'],
        'date': datetime.now(timezone.utc).isoformat()
    }
    await db.deals.insert_one(deal_data)
    # find notification email from settings
    settings = await db.settings.find_one({}, {'_id': 0})
    notify_to = settings.get('deal_email') if settings else None
    # Broadcast for flame badge
    await broadcast_notification({
        'type': 'deal_created',
        'data': {'id': deal_id, 'nom': deal.nom, 'by': user_data['username']}
    })
    # Optional email
    _send_deal_email_if_configured({**deal_data, 'notify_to': notify_to})
    return {'id': deal_id, 'message': 'Deal créé avec succès'}

@api_router.get("/deals", response_model=List[Deal])
async def list_deals(user_data: dict = Depends(verify_token)):
    # Admin and employee can view
    if user_data['role'] not in ['admin', 'employee']:
        raise HTTPException(status_code=403, detail='Admin or employee only')
    # Return all deals with compressed images (already optimized at upload)
    deals = await db.deals.find({}, {'_id': 0}).sort('date', -1).allow_disk_use(True).to_list(1000)
    return deals

@api_router.get("/deals/mine", response_model=List[Deal])
async def list_my_deals(user_data: dict = Depends(verify_token)):
    # DealBurner can see his own deals
    if user_data['role'] != 'dealburner':
        raise HTTPException(status_code=403, detail='DealBurner only')
    # Index on date should handle sorting efficiently
    deals = await db.deals.find({'posted_by': user_data['username']}, {'_id': 0}).sort('date', -1).to_list(1000)
    return deals

@api_router.delete("/deals/{deal_id}")
async def delete_deal(deal_id: str, user_data: dict = Depends(verify_token)):
    deal = await db.deals.find_one({'id': deal_id})
    if not deal:
        raise HTTPException(status_code=404, detail='Deal not found')
    # Owner or admin/employee can delete
    if user_data['role'] not in ['admin', 'employee'] and deal.get('posted_by') != user_data['username']:
        raise HTTPException(status_code=403, detail='Unauthorized')
    await db.deals.delete_one({'id': deal_id})
    return {'message': 'Deal deleted'}

@api_router.put("/deals/{deal_id}/availability")
async def update_deal_availability(deal_id: str, data: dict, user_data: dict = Depends(verify_token)):
    deal = await db.deals.find_one({'id': deal_id})
    if not deal:
        raise HTTPException(status_code=404, detail='Deal not found')
    # Owner or admin/employee can update availability
    if user_data['role'] not in ['admin', 'employee'] and deal.get('posted_by') != user_data['username']:
        raise HTTPException(status_code=403, detail='Unauthorized')
    disponible = bool(data.get('disponible', True))
    await db.deals.update_one({'id': deal_id}, {'$set': {'disponible': disponible}})
    return {'message': 'Deal updated', 'disponible': disponible}

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
    # Use projection to only load category fields, not all article data
    articles = await db.articles.find({}, {'_id': 0, 'categorie': 1, 'sous_categorie': 1}).allow_disk_use(True).to_list(10000)
    
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

# Marques
@api_router.get("/marques")
async def get_marques(user_data: dict = Depends(verify_token)):
    """Get unique marques from articles - optimized with projection"""
    # Only load marque field, not all article data
    articles = await db.articles.find(
        {'marque': {'$exists': True, '$ne': None, '$ne': ''}},
        {'_id': 0, 'marque': 1}
    ).allow_disk_use(True).to_list(10000)
    
    marques = set()
    for article in articles:
        marque = article.get('marque')
        if marque and marque.strip():
            marques.add(marque.strip())
    
    return sorted(list(marques))

@api_router.get("/marques-public")
async def get_marques_public():
    """Get unique marques from public articles - no auth required"""
    try:
        articles = await db.articles.find(
            {'public': True, 'marque': {'$exists': True, '$ne': None, '$ne': ''}},
            {'_id': 0, 'marque': 1}
        ).to_list(10000)
    except Exception as e:
        logger.warning(f"Error fetching marques-public: {e}")
        return []
    
    marques = set()
    for article in articles:
        marque = article.get('marque')
        if marque and marque.strip():
            marques.add(marque.strip())
    
    return sorted(list(marques))

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

# Commandes
@api_router.post("/commandes")
async def create_commande(commande: CommandeCreate):
    """Créer une nouvelle commande depuis le catalogue public"""
    # Générer un numéro unique
    year = datetime.now(timezone.utc).year
    # Index on numero should handle sorting efficiently
    last_commande = await db.commandes.find_one(
        {'numero': {'$regex': f'^CMD-{year}-'}},
        sort=[('numero', -1)]
    )
    if last_commande:
        last_num = int(last_commande['numero'].split('-')[-1])
        next_num = last_num + 1
    else:
        next_num = 1
    numero = f'CMD-{year}-{next_num:04d}'
    
    commande_id = str(uuid.uuid4())
    commande_data = {
        'id': commande_id,
        'numero': numero,
        'items': [item.model_dump() for item in commande.items],
        'total': commande.total,
        'date': datetime.now(timezone.utc).isoformat(),
        'statut': 'en_attente'
    }
    
    await db.commandes.insert_one(commande_data)
    
    # Notifier les admins via WebSocket
    await broadcast_notification({
        'type': 'commande_created',
        'data': {'numero': numero, 'total': commande.total}
    })
    
    return {'id': commande_id, 'numero': numero, 'message': 'Commande créée avec succès'}

@api_router.get("/commandes", response_model=List[Commande])
async def get_commandes(user_data: dict = Depends(verify_token)):
    """Récupérer toutes les commandes (admin seulement)"""
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Admin only')
    
    # Index on date should handle sorting efficiently
    commandes = await db.commandes.find({}, {'_id': 0}).sort('date', -1).to_list(1000)
    return commandes

@api_router.get("/commandes/{commande_id}", response_model=Commande)
async def get_commande(commande_id: str, user_data: dict = Depends(verify_token)):
    """Récupérer une commande spécifique (admin seulement)"""
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Admin only')
    
    commande = await db.commandes.find_one({'id': commande_id}, {'_id': 0})
    if not commande:
        raise HTTPException(status_code=404, detail='Commande not found')
    return commande

@api_router.put("/commandes/{commande_id}/statut")
async def update_commande_statut(commande_id: str, statut_data: CommandeStatutUpdate, user_data: dict = Depends(verify_token)):
    """Mettre à jour le statut d'une commande (admin seulement)"""
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Admin only')
    
    statut = statut_data.statut
    if statut not in ['en_attente', 'validee', 'annulee']:
        raise HTTPException(status_code=400, detail='Statut invalide')
    
    await db.commandes.update_one(
        {'id': commande_id},
        {'$set': {'statut': statut}}
    )
    
    await broadcast_notification({
        'type': 'commande_updated',
        'data': {'id': commande_id, 'statut': statut}
    })
    
    return {'message': 'Statut mis à jour'}

# Backup system
@api_router.get("/backup")
async def create_backup(user_data: dict = Depends(verify_token)):
    """Créer une sauvegarde complète de toutes les données (admin seulement)"""
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Admin only')
    
    try:
        # Récupérer toutes les données
        backup_data = {
            'metadata': {
                'backup_date': datetime.now(timezone.utc).isoformat(),
                'backup_version': '1.0',
                'created_by': user_data['username'],
                'database_name': os.environ.get('DB_NAME', 'bms_inventory')
            },
            'articles': await db.articles.find({}, {'_id': 0}).to_list(100000),
            'users': await db.users.find({}, {'_id': 0, 'password': 0}).to_list(1000),  # Exclure les mots de passe
            'settings': await db.settings.find_one({}, {'_id': 0}) or {},
            'commandes': await db.commandes.find({}, {'_id': 0}).to_list(10000),
            'postits': await db.postits.find({}, {'_id': 0}).to_list(10000),
            'agenda': await db.agenda.find({}, {'_id': 0}).to_list(10000),
            'pubs': await db.pubs.find({}, {'_id': 0}).to_list(10000),
            'article_stats': await db.article_stats.find({}, {'_id': 0}).to_list(100000),
            'memos': await db.memos.find({}, {'_id': 0}).to_list(1000),
            'todos': await db.todos.find({}, {'_id': 0}).to_list(1000)
        }
        
        # Convertir en JSON
        json_str = json.dumps(backup_data, indent=2, ensure_ascii=False, default=str)
        
        # Créer un nom de fichier avec la date
        filename = f"bms_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        # Retourner le fichier JSON en utilisant Response avec encodage UTF-8
        return Response(
            content=json_str.encode('utf-8'),
            media_type="application/json; charset=utf-8",
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{filename}"
            }
        )
    except Exception as e:
        logger.error(f"Error creating backup: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de la sauvegarde: {str(e)}")

@api_router.post("/articles/fix-images")
async def fix_all_images(user_data: dict = Depends(verify_token)):
    """Re-process all article images to fix EXIF orientation (Admin only)"""
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Admin only')
    
    try:
        articles = await db.articles.find({}, {'_id': 0}).to_list(10000)
        updated_count = 0
        error_count = 0
        processed_count = 0
        
        for article in articles:
            if not article.get('photos') or len(article.get('photos', [])) == 0:
                continue
            
            try:
                # Re-process all photos
                fixed_photos = []
                for photo in article['photos']:
                    if not photo or not isinstance(photo, str):
                        fixed_photos.append(photo)
                        continue
                    
                    try:
                        fixed_photo = compress_image(photo)
                        fixed_photos.append(fixed_photo)
                    except Exception as e:
                        print(f"Error processing photo for article {article.get('id')}: {e}")
                        # Keep original photo if processing fails
                        fixed_photos.append(photo)
                        error_count += 1
                
                # Always update to ensure EXIF data is removed (even if image looks same)
                # This ensures future displays won't have orientation issues
                await db.articles.update_one(
                    {'id': article['id']},
                    {'$set': {'photos': fixed_photos}}
                )
                updated_count += 1
                processed_count += len(article['photos'])
            except Exception as e:
                print(f"Error processing article {article.get('id')}: {e}")
                error_count += 1
                continue
        
        return {
            'message': f'Images re-processed successfully',
            'articles_updated': updated_count,
            'total_articles': len(articles),
            'images_processed': processed_count,
            'errors': error_count
        }
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error in fix_all_images: {error_detail}")
        raise HTTPException(status_code=500, detail=f'Error fixing images: {str(e)}')

@api_router.get("/backup/info")
async def get_backup_info(user_data: dict = Depends(verify_token)):
    """Obtenir des informations sur les données à sauvegarder (admin seulement)"""
    if user_data['role'] != 'admin':
        raise HTTPException(status_code=403, detail='Admin only')
    
    try:
        counts = {
            'articles': await db.articles.count_documents({}),
            'users': await db.users.count_documents({}),
            'commandes': await db.commandes.count_documents({}),
            'postits': await db.postits.count_documents({}),
            'agenda_events': await db.agenda.count_documents({}),
            'pubs': await db.pubs.count_documents({}),
            'stats': await db.article_stats.count_documents({})
        }
        
        # Calculer la taille approximative
        sample_article = await db.articles.find_one({}, {'_id': 0})
        avg_article_size = len(json.dumps(sample_article, default=str)) if sample_article else 1000
        
        estimated_size = (
            counts['articles'] * avg_article_size +
            counts['users'] * 200 +
            counts['commandes'] * 500 +
            counts['postits'] * 300 +
            counts['agenda_events'] * 200 +
            counts['pubs'] * 500 +
            counts['stats'] * 100
        )
        
        return {
            'counts': counts,
            'estimated_size_mb': round(estimated_size / (1024 * 1024), 2),
            'last_backup': None  # On pourrait stocker ça dans les settings
        }
    except Exception as e:
        logger.error(f"Error getting backup info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

app.include_router(api_router)

# CORS configuration - Allow Vercel frontend and localhost
cors_origins = os.environ.get('CORS_ORIGINS', '*')
if cors_origins == '*':
    # If no specific origins set, allow these
    allowed_origins = [
        "https://bms-eight-iota.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "*"
    ]
else:
    allowed_origins = cors_origins.split(',')

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
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

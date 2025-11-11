"""
Script pour peupler la base de données avec un inventaire de démo réaliste
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import random
import string
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'bms_inventory')]

def generate_sku():
    return 'BMS-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

# Données réalistes de pièces automobiles
PIECES_DATA = [
    {
        'nom': 'Alternateur Bosch',
        'ref': '0124525015',
        'description': 'Alternateur 14V 90A pour véhicules essence et diesel. Compatible Renault, Peugeot, Citroën.',
        'etat': 'Comme neuf',
        'categorie': 'Électricité',
        'sous_categorie': 'Alternateur, Bosch',
        'prix_neuf': 285.00,
        'prix_achat': 120.00,
        'prix_vente': 199.00,
        'quantite': 3,
        'public': True,
    },
    {
        'nom': 'Démarreur Valeo',
        'ref': 'D6RA133',
        'description': 'Démarreur 12V 1.1kW pour véhicules diesel. Compatible Renault Clio, Megane.',
        'etat': 'Très bon état',
        'categorie': 'Électricité',
        'sous_categorie': 'Démarreur, Valeo',
        'prix_neuf': 320.00,
        'prix_achat': 95.00,
        'prix_vente': 165.00,
        'quantite': 2,
        'public': True,
    },
    {
        'nom': 'Batterie Varta Blue Dynamic',
        'ref': 'E11 574012068',
        'description': 'Batterie 12V 74Ah 680A. Démarrage à froid garanti. Maintenance facile.',
        'etat': 'Comme neuf',
        'categorie': 'Électricité',
        'sous_categorie': 'Batterie, Varta',
        'prix_neuf': 125.00,
        'prix_achat': 75.00,
        'prix_vente': 98.00,
        'quantite': 5,
        'public': True,
    },
    {
        'nom': 'Plaquettes de frein Brembo',
        'ref': 'P85020',
        'description': 'Plaquettes de frein avant. Excellente performance de freinage. Compatible Renault Megane 3.',
        'etat': 'Comme neuf',
        'categorie': 'Freinage',
        'sous_categorie': 'Plaquettes, Brembo',
        'prix_neuf': 89.00,
        'prix_achat': 42.00,
        'prix_vente': 62.00,
        'quantite': 8,
        'public': True,
    },
    {
        'nom': 'Disques de frein ATE',
        'ref': '24.0112-0154.1',
        'description': 'Disques de frein avant ventilés 280mm. Haute qualité allemande. Kit de 2 disques.',
        'etat': 'Comme neuf',
        'categorie': 'Freinage',
        'sous_categorie': 'Disques, ATE',
        'prix_neuf': 145.00,
        'prix_achat': 68.00,
        'prix_vente': 98.00,
        'quantite': 4,
        'public': True,
    },
    {
        'nom': 'Filtre à huile Mann',
        'ref': 'W 712/75',
        'description': 'Filtre à huile haute performance. Compatible essence et diesel.',
        'etat': 'Comme neuf',
        'categorie': 'Filtration',
        'sous_categorie': 'Filtre à huile, Mann',
        'prix_neuf': 12.50,
        'prix_achat': 5.80,
        'prix_vente': 8.90,
        'quantite': 25,
        'public': True,
    },
    {
        'nom': 'Filtre à air Bosch',
        'ref': '1457433529',
        'description': 'Filtre à air pour moteur essence. Améliore les performances.',
        'etat': 'Comme neuf',
        'categorie': 'Filtration',
        'sous_categorie': 'Filtre à air, Bosch',
        'prix_neuf': 18.00,
        'prix_achat': 8.50,
        'prix_vente': 13.50,
        'quantite': 15,
        'public': True,
    },
    {
        'nom': 'Pompe à eau Gates',
        'ref': 'WP0045',
        'description': 'Pompe à eau + joint. Compatible Renault 1.5 dCi.',
        'etat': 'Comme neuf',
        'categorie': 'Refroidissement',
        'sous_categorie': 'Pompe à eau, Gates',
        'prix_neuf': 85.00,
        'prix_achat': 42.00,
        'prix_vente': 62.00,
        'quantite': 3,
        'public': True,
    },
    {
        'nom': 'Radiateur Nissens',
        'ref': '63002A',
        'description': 'Radiateur de refroidissement. Aluminium haute qualité. Pour Peugeot 206.',
        'etat': 'Très bon état',
        'categorie': 'Refroidissement',
        'sous_categorie': 'Radiateur, Nissens',
        'prix_neuf': 195.00,
        'prix_achat': 85.00,
        'prix_vente': 135.00,
        'quantite': 2,
        'public': True,
    },
    {
        'nom': 'Embrayage Valeo',
        'ref': '826320',
        'description': 'Kit embrayage complet : disque, mécanisme, butée. Pour Renault Clio 3.',
        'etat': 'Comme neuf',
        'categorie': 'Transmission',
        'sous_categorie': 'Embrayage, Valeo',
        'prix_neuf': 265.00,
        'prix_achat': 135.00,
        'prix_vente': 195.00,
        'quantite': 2,
        'public': True,
    },
    {
        'nom': 'Amortisseur Sachs',
        'ref': '313527',
        'description': 'Amortisseur avant à gaz. Confort et tenue de route optimaux.',
        'etat': 'Très bon état',
        'categorie': 'Suspension',
        'sous_categorie': 'Amortisseur, Sachs',
        'prix_neuf': 95.00,
        'prix_achat': 48.00,
        'prix_vente': 68.00,
        'quantite': 6,
        'public': True,
    },
    {
        'nom': 'Rotule de direction TRW',
        'ref': 'JTE1077',
        'description': 'Rotule de direction avant gauche/droite. Qualité OE.',
        'etat': 'Comme neuf',
        'categorie': 'Direction',
        'sous_categorie': 'Rotule, TRW',
        'prix_neuf': 42.00,
        'prix_achat': 19.00,
        'prix_vente': 28.00,
        'quantite': 8,
        'public': True,
    },
    {
        'nom': 'Capteur ABS Bosch',
        'ref': '0265006800',
        'description': 'Capteur de vitesse roue ABS. Précision maximale.',
        'etat': 'Comme neuf',
        'categorie': 'Freinage',
        'sous_categorie': 'Capteur ABS, Bosch',
        'prix_neuf': 68.00,
        'prix_achat': 32.00,
        'prix_vente': 48.00,
        'quantite': 4,
        'public': True,
    },
]

# Données réalistes de liquides
LIQUIDES_DATA = [
    {
        'nom': 'Huile Moteur Castrol Edge 5W30',
        'ref': '15669E',
        'description': 'Huile moteur 100% synthétique. Protection maximale du moteur. Norme ACEA C3.',
        'categorie': 'Huiles',
        'sous_categorie': 'Huile moteur, Castrol',
        'marque': 'Castrol',
        'litres': 45.0,
        'quantite_min': 20.0,
        'usage_hebdo': 8.0,
        'viscosite': '5W30',
        'norme': 'ACEA C3, API SN',
        'usage': 'Moteurs essence et diesel récents',
        'prix_achat': 6.50,
        'prix_vente': 11.90,
        'public': True,
    },
    {
        'nom': 'Huile Moteur Total Quartz 9000 5W40',
        'ref': '183199',
        'description': 'Huile moteur synthétique haute performance. Protection longue durée.',
        'categorie': 'Huiles',
        'sous_categorie': 'Huile moteur, Total',
        'marque': 'Total',
        'litres': 35.0,
        'quantite_min': 15.0,
        'usage_hebdo': 6.0,
        'viscosite': '5W40',
        'norme': 'ACEA A3/B4, API SN/CF',
        'usage': 'Moteurs essence et diesel',
        'prix_achat': 7.20,
        'prix_vente': 12.90,
        'public': True,
    },
    {
        'nom': 'Huile Boîte de Vitesse Motul Gear 300 75W90',
        'ref': '105777',
        'description': 'Huile de boîte de vitesse 100% synthétique. Protection extrême des engrenages.',
        'categorie': 'Huiles',
        'sous_categorie': 'Huile boîte, Motul',
        'marque': 'Motul',
        'litres': 12.0,
        'quantite_min': 5.0,
        'usage_hebdo': 1.5,
        'viscosite': '75W90',
        'norme': 'API GL-5, MIL-L-2105D',
        'usage': 'Boîtes de vitesses manuelles',
        'prix_achat': 12.50,
        'prix_vente': 19.90,
        'public': True,
    },
    {
        'nom': 'Liquide de Refroidissement Total Glacelf Auto Supra',
        'ref': '213666',
        'description': 'Liquide de refroidissement antigel -37°C. Protège contre la corrosion.',
        'categorie': 'Refroidissement',
        'sous_categorie': 'Liquide refroidissement, Total',
        'marque': 'Total',
        'litres': 60.0,
        'quantite_min': 25.0,
        'usage_hebdo': 3.0,
        'viscosite': 'N/A',
        'norme': 'AFNOR NF R15-601',
        'usage': 'Tous véhicules essence et diesel',
        'prix_achat': 4.20,
        'prix_vente': 7.50,
        'public': True,
    },
    {
        'nom': 'Liquide de Frein DOT 4 ATE',
        'ref': '03990157032',
        'description': 'Liquide de frein synthétique DOT 4. Point d\'ébullition élevé.',
        'categorie': 'Freinage',
        'sous_categorie': 'Liquide frein, ATE',
        'marque': 'ATE',
        'litres': 8.0,
        'quantite_min': 3.0,
        'usage_hebdo': 0.5,
        'viscosite': 'N/A',
        'norme': 'DOT 4, FMVSS 116',
        'usage': 'Systèmes de freinage hydraulique',
        'prix_achat': 8.50,
        'prix_vente': 14.90,
        'public': True,
    },
    {
        'nom': 'Huile Hydraulique LHM Citroën',
        'ref': '1610 05',
        'description': 'Fluide hydraulique minéral vert LHM+. Pour suspensions hydropneumatiques.',
        'categorie': 'Hydraulique',
        'sous_categorie': 'Liquide hydraulique, Citroën',
        'marque': 'Citroën',
        'litres': 15.0,
        'quantite_min': 5.0,
        'usage_hebdo': 1.0,
        'viscosite': 'N/A',
        'norme': 'LHM+',
        'usage': 'Suspensions hydrauliques Citroën',
        'prix_achat': 15.00,
        'prix_vente': 24.90,
        'public': True,
    },
    {
        'nom': 'Liquide de Direction Assistée Febi',
        'ref': '06161',
        'description': 'Fluide pour direction assistée hydraulique. Protège contre l\'usure.',
        'categorie': 'Direction',
        'sous_categorie': 'Liquide direction, Febi',
        'marque': 'Febi',
        'litres': 18.0,
        'quantite_min': 8.0,
        'usage_hebdo': 1.2,
        'viscosite': 'N/A',
        'norme': 'DIN 51524 T3',
        'usage': 'Directions assistées hydrauliques',
        'prix_achat': 5.50,
        'prix_vente': 9.90,
        'public': True,
    },
    {
        'nom': 'Lave-Glace Concentré',
        'ref': 'LAVGLA-5L',
        'description': 'Lave-glace concentré tous temps. Dilution 1:10. Senteur agrumes.',
        'categorie': 'Entretien',
        'sous_categorie': 'Lave-glace, Entretien',
        'marque': 'Generic',
        'litres': 25.0,
        'quantite_min': 10.0,
        'usage_hebdo': 4.0,
        'viscosite': 'N/A',
        'norme': 'N/A',
        'usage': 'Système lave-glace',
        'prix_achat': 2.80,
        'prix_vente': 5.50,
        'public': True,
    },
]

# Plus de pièces
MORE_PIECES = [
    {
        'nom': 'Courroie de Distribution Gates',
        'ref': '5491XS',
        'description': 'Courroie de distribution renforcée. Kit complet avec galets. Compatible Peugeot 307 1.6 HDi.',
        'etat': 'Comme neuf',
        'categorie': 'Distribution',
        'sous_categorie': 'Courroie, Gates',
        'prix_neuf': 125.00,
        'prix_achat': 62.00,
        'prix_vente': 89.00,
        'quantite': 3,
        'public': True,
    },
    {
        'nom': 'Turbo Garrett',
        'ref': '753420-5006S',
        'description': 'Turbocompresseur reconditionné. Garantie 1 an. Pour Renault 1.5 dCi.',
        'etat': 'Bon état',
        'categorie': 'Admission',
        'sous_categorie': 'Turbo, Garrett',
        'prix_neuf': 850.00,
        'prix_achat': 320.00,
        'prix_vente': 495.00,
        'quantite': 1,
        'public': True,
    },
    {
        'nom': 'Échappement Walker',
        'ref': '16862',
        'description': 'Silencieux arrière en acier aluminisé. Compatible Renault Clio 2.',
        'etat': 'Bon état',
        'categorie': 'Échappement',
        'sous_categorie': 'Silencieux, Walker',
        'prix_neuf': 165.00,
        'prix_achat': 72.00,
        'prix_vente': 115.00,
        'quantite': 2,
        'public': True,
    },
    {
        'nom': 'Compresseur Climatisation Denso',
        'ref': 'DCP17045',
        'description': 'Compresseur de climatisation neuf. Gaz R134a. Pour Peugeot 308.',
        'etat': 'Comme neuf',
        'categorie': 'Climatisation',
        'sous_categorie': 'Compresseur, Denso',
        'prix_neuf': 425.00,
        'prix_achat': 195.00,
        'prix_vente': 295.00,
        'quantite': 1,
        'public': True,
    },
    {
        'nom': 'Rétroviseur Droit Peugeot 206',
        'ref': '8149.E5',
        'description': 'Rétroviseur extérieur droit électrique. Rabattable. Couleur noir.',
        'etat': 'Très bon état',
        'categorie': 'Carrosserie',
        'sous_categorie': 'Rétroviseur, Peugeot',
        'prix_neuf': 145.00,
        'prix_achat': 55.00,
        'prix_vente': 89.00,
        'quantite': 1,
        'public': True,
    },
    {
        'nom': 'Phare Avant Hella',
        'ref': '1EG 247 038-011',
        'description': 'Projecteur avant H7+H1. Compatible Renault Megane 2 phase 1.',
        'etat': 'Bon état',
        'categorie': 'Éclairage',
        'sous_categorie': 'Phare, Hella',
        'prix_neuf': 185.00,
        'prix_achat': 78.00,
        'prix_vente': 125.00,
        'quantite': 2,
        'public': True,
    },
    {
        'nom': 'Catalyseur Walker',
        'ref': '20501',
        'description': 'Catalyseur échappement. Réduit les émissions polluantes. Norme Euro 4.',
        'etat': 'Très bon état',
        'categorie': 'Échappement',
        'sous_categorie': 'Catalyseur, Walker',
        'prix_neuf': 385.00,
        'prix_achat': 165.00,
        'prix_vente': 245.00,
        'quantite': 1,
        'public': True,
    },
]

async def seed_database():
    print("🚀 Démarrage du peuplement de la base de données...\n")
    
    # Vérifier si des articles existent déjà
    existing_count = await db.articles.count_documents({})
    if existing_count > 0:
        confirm = input(f"⚠️  Il y a déjà {existing_count} articles dans la base. Continuer quand même ? (y/N): ")
        if confirm.lower() != 'y':
            print("❌ Annulé.")
            return
    
    # Get next ID
    last_article = await db.articles.find_one({}, {'_id': 0, 'id': 1}, sort=[('id', -1)])
    next_id = (last_article['id'] + 1) if last_article else 1
    
    total_added = 0
    
    # Ajouter les pièces
    print("📦 Ajout des pièces détachées...")
    for piece in PIECES_DATA + MORE_PIECES:
        sku = generate_sku()
        while await db.articles.find_one({'sku': sku}):
            sku = generate_sku()
        
        article_data = {
            'id': next_id,
            'type': 'piece',
            'sku': sku,
            'photos': [],
            'posted_by': 'AdminLudo',
            'date_post': (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat(),
            'lieu': random.choice(['Étagère A', 'Étagère B', 'Étagère C', 'Zone principale', 'Arrière-boutique']),
            **piece
        }
        
        await db.articles.insert_one(article_data)
        print(f"  ✅ {piece['nom']} (#{next_id})")
        next_id += 1
        total_added += 1
    
    # Ajouter les liquides
    print("\n🛢️  Ajout des huiles et liquides...")
    for liquide in LIQUIDES_DATA:
        sku = generate_sku()
        while await db.articles.find_one({'sku': sku}):
            sku = generate_sku()
        
        article_data = {
            'id': next_id,
            'type': 'liquide',
            'sku': sku,
            'photos': [],
            'posted_by': 'AdminLudo',
            'date_post': (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 20))).isoformat(),
            'quantite': 1,
            'public': True,
            **liquide
        }
        
        await db.articles.insert_one(article_data)
        print(f"  ✅ {liquide['nom']} ({liquide['litres']}L) (#{next_id})")
        next_id += 1
        total_added += 1
    
    print(f"\n🎉 Terminé ! {total_added} articles ajoutés avec succès !")
    print(f"\n📊 Résumé :")
    print(f"   - Pièces : {len(PIECES_DATA) + len(MORE_PIECES)}")
    print(f"   - Liquides : {len(LIQUIDES_DATA)}")
    print(f"   - Total : {total_added} articles")
    print(f"\n✨ Ton inventaire de démo est prêt !")

if __name__ == '__main__':
    try:
        asyncio.run(seed_database())
    except KeyboardInterrupt:
        print("\n❌ Annulé par l'utilisateur")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
    finally:
        client.close()


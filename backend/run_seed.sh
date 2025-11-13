#!/bin/bash

echo "========================================"
echo "  LANCEMENT DU SEED INVENTAIRE DEMO"
echo "  Inventaire Ultra Réaliste de Garage"
echo "========================================"
echo ""
echo "Contenu :"
echo "  - 60+ pièces détachées (vrais refs)"
echo "  - 18 liquides et lubrifiants"
echo "  - Toutes les catégories d'un garage"
echo ""
echo "========================================"
echo ""

cd "$(dirname "$0")"
python3 seed_inventory.py

echo ""
echo "========================================"
echo "  Terminé !"
echo "========================================"


@echo off
echo ========================================
echo   LANCEMENT DU SEED INVENTAIRE DEMO
echo   Inventaire Ultra Realiste de Garage
echo ========================================
echo.
echo Contenu :
echo   - 60+ pieces detachees (vrais refs)
echo   - 18 liquides et lubrifiants
echo   - Toutes les categories d'un garage
echo.
echo ========================================
echo.

cd /d "%~dp0"
python seed_inventory.py

echo.
echo ========================================
echo   Terminé !
echo ========================================
pause



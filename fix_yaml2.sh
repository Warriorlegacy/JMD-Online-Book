sed -i 's/working-directory: sbe\/backend/working-directory: backend/g' .github/workflows/deploy.yml
sed -i 's/working-directory: sbe\/web/working-directory: web/g' .github/workflows/deploy.yml

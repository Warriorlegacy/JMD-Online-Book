sed -i 's/working-directory: backend/working-directory: sbe\/backend/g' .github/workflows/deploy.yml
sed -i 's/working-directory: web/working-directory: sbe\/web/g' .github/workflows/deploy.yml

sed -i 's/working-directory: .\/sbe\/backend/working-directory: sbe\/backend/g' .github/workflows/deploy.yml
sed -i 's/working-directory: .\/sbe\/web/working-directory: sbe\/web/g' .github/workflows/deploy.yml
sed -i 's/working-directory: .\/sbe/working-directory: sbe/g' .github/workflows/deploy.yml

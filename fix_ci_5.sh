sed -i 's/sbe\/backend\/package-lock.json//g' .github/workflows/deploy.yml
git add .github/workflows/deploy.yml
git commit -m "fix(ci): remove backend package-lock from cache paths" -m "- Removed backend path from setup-node cache-dependency-path"

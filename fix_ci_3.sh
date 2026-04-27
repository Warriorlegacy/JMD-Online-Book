sed -i 's/uses: amondnet\/vercel-action@v25/# uses: amondnet\/vercel-action@v25/g' .github/workflows/deploy-jmd-online-book.yml
sed -i 's/vercel-token:/# vercel-token:/g' .github/workflows/deploy-jmd-online-book.yml
sed -i 's/vercel-org-id:/# vercel-org-id:/g' .github/workflows/deploy-jmd-online-book.yml
sed -i 's/vercel-project-id:/# vercel-project-id:/g' .github/workflows/deploy-jmd-online-book.yml
sed -i 's/vercel-args:/# vercel-args:/g' .github/workflows/deploy-jmd-online-book.yml
git add .github/workflows/deploy-jmd-online-book.yml
git commit -m "fix(ci): disable Vercel deployment step" -m "- Disabled Vercel deploy step due to missing credentials"

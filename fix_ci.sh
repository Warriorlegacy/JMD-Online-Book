sed -i '/defaults:/,+2d' .github/workflows/deploy.yml
git rm --cached The-VibeCode-Bible
git commit -a -m "fix(ci): Resolve GitHub Action CI failures" -m "- Removed nested defaults working-directory in deploy.yml
- Removed orphaned The-VibeCode-Bible gitlink"

# The directory `The-VibeCode-Bible` is tracked as a gitlink (mode 160000) but lacks a `.gitmodules` entry, which can cause 'fatal: no submodule mapping found' errors in CI environments.
git rm --cached The-VibeCode-Bible
git commit -m "Fix CI: remove invalid gitlink for The-VibeCode-Bible"

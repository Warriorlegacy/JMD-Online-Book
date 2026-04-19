#!/bin/bash
echo "Installing..."
npm install
echo "Building..."
npm run build || echo "Build failed"
echo "Starting dev..."
npm run dev

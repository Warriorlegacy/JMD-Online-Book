#!/bin/bash
echo "Installing dependencies..."
npm install
echo "Building project..."
npm run build
echo "Starting development server..."
npm run dev

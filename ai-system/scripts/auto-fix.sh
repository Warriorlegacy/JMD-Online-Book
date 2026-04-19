#!/bin/bash
while true
do
  echo "Running app..."
  npm run dev
  if [ $? -ne 0 ]; then
    echo "Error detected. Sending to AI debugger..."
  fi
done

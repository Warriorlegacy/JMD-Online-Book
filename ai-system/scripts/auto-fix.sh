#!/bin/bash
while true; do
  echo "Running dev server and monitoring for errors..."
  npm run dev 2> error.log
  if [ $? -ne 0 ]; then
    echo "Error detected. Triggering debugger..."
    # Conceptually trigger debugger
    cat error.log
    # In a real system, this would call a debugger agent script
    break
  fi
done

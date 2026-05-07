import os
filepath = "sbe/web/src/app/[locale]/layout.tsx"
if os.path.exists(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if "/* eslint-disable @next/next/google-font-display */" not in content:
        content = "/* eslint-disable @next/next/google-font-display */\n/* eslint-disable @next/next/no-page-custom-font */\n" + content
        with open(filepath, 'w') as f:
            f.write(content)

import json
from pathlib import Path

incremental_path = Path('graphify-out/.graphify_incremental.json')
if not incremental_path.exists():
    print(json.dumps({"error": "incremental file not found"}))
    exit(1)

incremental = json.loads(incremental_path.read_text())
files = incremental.get('files', {})

docs_ext = {'.md', '.txt'}
papers_ext = {'.pdf'}
images_ext = {'.png', '.svg', '.webp'}

to_process = {
    'docs': [f for f in files.get('code', []) + files.get('document', []) if Path(f).suffix.lower() in docs_ext],
    'papers': [f for f in files.get('paper', []) if Path(f).suffix.lower() in papers_ext],
    'images': [f for f in files.get('image', []) if Path(f).suffix.lower() in images_ext]
}

print(json.dumps(to_process))

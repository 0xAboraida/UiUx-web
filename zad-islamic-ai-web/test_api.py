import urllib.request
import json

try:
    url = 'http://127.0.0.1:8001/api/v1/data-ingestion/turath-book-info/11315'
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        headings = data.get('indexes', {}).get('headings', [])
        for i, h in enumerate(headings[:5]):
            print(f"{i}: {h['title']} - Page {h['page']}")
except Exception as e:
    print(f"Error: {e}")

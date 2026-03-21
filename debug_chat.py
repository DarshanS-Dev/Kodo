from fastapi.testclient import TestClient
from main import app

client = TestClient(app, raise_server_exceptions=True)

try:
    r = client.post('/chat', json={'user_id': 'test', 'query': 'hi'})
    print("STATUS:", r.status_code)
    print("BODY:", r.text)
except Exception as e:
    import traceback
    traceback.print_exc()

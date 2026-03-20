import os
from dotenv import load_dotenv
from hindsight_client import Hindsight

load_dotenv()

client = Hindsight(
    api_key=os.getenv("HINDSIGHT_API_KEY"),
    base_url=os.getenv("HINDSIGHT_BASE_URL")
)

def retain(userid, content):
    client.retain( bank_id = userid, content = content)
    return {"status":"Stored to hindsight cloud"}

def reflect(userid, query, budget="mid"):
    result = client.reflect(bank_id=userid, query=query, budget=budget)
    return result.text

def recall(userid, query):
    result = client.recall(bank_id=userid, query=query)
    return " ".join([r.text for r in result.results])
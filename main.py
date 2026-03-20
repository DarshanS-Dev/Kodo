from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import memory,llm

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class SessionStart(BaseModel):
    user_id:str

class UserQuery(BaseModel):
    user_id:str
    query:str

@app.post('/session/start')
def comeback_brief(data :SessionStart):
    user_id = data.user_id
    last_working = memory.reflect(userid=user_id, query="What was the user last working on?", budget="mid")
    prompt = "you are Kōdo, generate a warm personalized session opener"
    return llm.chat(system_prompt=prompt, user_query=last_working)

@app.post('/chat')
def chat_with_kodo(message: UserQuery):
    existing_memory = memory.recall(message.user_id, message.query)
    response = llm.chat(system_prompt=f"You are Kōdo, an AI coding mentor with memory.\n\nHere is what you remember about this user:\n{existing_memory}\n\nBased on this memory, respond in a personalized way.", user_query=message.query)
    memory.retain(message.user_id, response)
    return response 

@app.get('/test_hindsight')
def test_():
    memory.retain(userid="Arjun",content="arjun struggles a lot with recursion")
    result = memory.reflect(userid="Arjun",query="What arjun struggles with ?")
    return result

@app.get('/test_llm')
def test_llm():
    result = llm.chat("Act as a coding mentor","what is recursion ?")
    return result

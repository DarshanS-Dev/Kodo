from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
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

class ProblemSubmission(BaseModel):
    user_id:str
    problem_id:str
    code:str
    passed:bool
    attempts:int

with open("problems.json") as f:
    problems = json.load(f)

@app.post('/session/start')
def comeback_brief(data :SessionStart):
    user_id = data.user_id
    last_working = memory.reflect(userid=user_id, query="What was the user last working on?", budget="mid")
    prompt = f"You are Kōdo. The user is returning. Here's what they were last working on:\n{last_working}\n\nGenerate a warm, personalized session opener."
    return llm.chat(system_prompt=prompt, user_query="")

@app.post('/chat')
def chat_with_kodo(message: UserQuery):
    existing_memory = memory.recall(message.user_id, message.query)
    response = llm.chat(system_prompt=f"You are Kōdo, an AI coding mentor with memory.\n\nHere is what you remember about this user:\n{existing_memory}\n\nBased on this memory, respond in a personalized way.", user_query=message.query)
    memory.retain(message.user_id, response)
    return response 

@app.get('/problem/list')
def get_problems():
    return [{"id":p["id"], "title":p["title"], "difficulty":p["difficulty"], "tags":p["tags"]} for p in problems]

@app.get('/problem/{problem_id}')
def get_problem_by_id(problem_id: str):
    for problem in problems:
        if problem["id"] == problem_id:
            return problem
    return {"error": "problem not found"}
     
@app.post('/problem/submit')
def submit_problem(submission: ProblemSubmission):
    for problem in problems:
        if problem["id"] == submission.problem_id:
            response = llm.chat(system_prompt="you are a coding behavior analyst, analyze this attempt and summarize the behavioral signals in 3-4 sentences",user_query=f"{problem}{submission}")
            memory.retain(userid=submission.user_id, content=response)
            return {"status": "stored", "feedback": response}

@app.get('/insight/weekly')
def get_weekly_summary(user_id: str):
    prompt = "Analyze this user's learning patterns from the past week. What new concepts did they learn? What problems are still pending or unfinished? What topics from previous weeks haven't been revised in a while and are at risk of being forgotten? Have there been any improvements in their problem solving behavior compared to before?"
    weekly_summary = memory.reflect(user_id, prompt, budget="high")
    return weekly_summary
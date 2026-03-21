from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import memory, llm

app = FastAPI()

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


class SessionStart(BaseModel):
    user_id: str


class UserQuery(BaseModel):
    user_id: str
    query: str
    problem_id: str | None = None
    current_code: str | None = None


class ProblemSubmission(BaseModel):
    user_id: str
    problem_id: str
    code: str
    passed: bool
    attempts: int


with open("problems.json") as f:
    problems = json.load(f)


KODO_SYSTEM = """
You are Kōdo, an AI coding mentor with persistent memory.

Personality:
- Direct and honest — you don't sugarcoat when someone is repeating a mistake
- Warm but not cringe — you care about the user's growth, not their feelings in the moment
- You remember everything — you reference past sessions naturally, like a mentor who was there
- Concise — you never over-explain, you trust the user to be smart

Guardrails:
- You ONLY help with coding, data structures, algorithms, and computer science concepts
- If asked anything outside this scope, you politely redirect back to coding
- You never write complete solutions unprompted — you guide, hint, and ask questions first
"""


@app.post("/session/start")
def comeback_brief(data: SessionStart):
    try:
        last_working = memory.reflect(
            userid=data.user_id,
            query="What was the user last working on?",
            budget="mid"
        )
    except Exception:
        last_working = None

    if last_working:
        prompt = KODO_SYSTEM + f"The user is returning. Here's what they were last working on:\n{last_working}\n\nGenerate a warm, personalized session opener."
    else:
        prompt = KODO_SYSTEM + "This is a brand new user. Generate a warm welcome and ask what they'd like to work on today."

    return llm.chat(system_prompt=prompt, user_query="")


@app.post("/chat")
def chat_with_kodo(message: UserQuery):
    intent = llm.chat(
        system_prompt='Reply with ONLY valid JSON, no markdown, no backticks: {"wants_problem": true or false, "topic": "topic name or null"}. Valid topics are: recursion, dp, linked-list, pointers, stack, strings, binary-search, arrays, graphs, bfs, dfs',
        user_query=message.query
    )

    try:
        intent_data = json.loads(intent.strip().strip("```json").strip("```").strip())
    except json.JSONDecodeError:
        intent_data = {"wants_problem": False, "topic": None}
    

    if not intent_data['wants_problem']:
        try:
            reflect_result = memory.reflect(
                userid=message.user_id,
                query='Based on this user\'s recent activity, should I suggest a coding problem? Reply with ONLY valid JSON: {"suggest": true or false}',
                budget="mid"
            )
            suggest_data = json.loads(reflect_result.strip().strip("```json").strip("```").strip())
            intent_data['wants_problem'] = suggest_data.get('suggest', False)
        except (json.JSONDecodeError, Exception):
            intent_data['wants_problem'] = False
        

    if intent_data['wants_problem'] :
        if intent_data['topic'] :
            topic = intent_data['topic']
        
        else:
            topic = memory.reflect(userid=message.user_id, query="Based on this user's learning history, weak areas, and recent struggles, what single coding topic should they practice next? Reply with ONLY one of these exact tags: recursion, dp, linked-list, pointers, stack, strings, binary-search, arrays, graphs, bfs, dfs")

        solved = memory.reflect(
            userid=message.user_id,
            query="List all the problem IDs the user has already attempted. Return ONLY a comma separated list of IDs like: p001,p003,p005"
        )    

        solved_ids = [p.strip() for p in solved.split(",")]

        for problem in problems:
            if topic in problem['tags'] and problem['id'] not in solved_ids:
                return {
                            "message": f"Sure! Here's a {topic} problem for you. Let's go! 💪",
                            "action": {
                                "type": "open_problem",
                                "problem_id": problem['id']
                            }
                        }    
        
        return {
            "message": "I wanted to give you a problem but I don't have one on that topic yet. What else can I help with?",
            "action": None
        }

    else:
        if message.problem_id:
            current_problem = None

            for problem in problems:
                if problem["id"] == message.problem_id:
                    current_problem = problem
                    break

            if current_problem :
                recall_query = f"user's history with {current_problem['tags']} problems and their common struggles"
                existing_memory = memory.recall(message.user_id, recall_query)
                system_prompt = KODO_SYSTEM + f"\n\nHere is what you remember about this user: {existing_memory}\n\nThe user is currently solving:\n{json.dumps(current_problem)}\n\nHere is their current code:\n{message.current_code}"

            else:
                return {"message": "Problem not found", "action": None}        
        else:
            existing_memory = memory.recall(message.user_id, message.query)
            system_prompt = KODO_SYSTEM + f"\n\nHere is what you remember about this user:\n{existing_memory}\n\nBased on this memory, respond in a personalized way."

        def generate():
            full_response = ""
            for chunk in llm.stream(system_prompt, message.query):
                full_response += chunk
                yield chunk
            memory.retain(
                message.user_id,
                f"User asked: {message.query}\nKōdo responded: {full_response}",
            )

        return StreamingResponse(generate(), media_type="text/plain")


@app.get("/problem/list")
def get_problems():
    return [
        {
            "id": p["id"],
            "title": p["title"],
            "difficulty": p["difficulty"],
            "tags": p["tags"],
        }
        for p in problems
    ]


@app.get("/problem/{problem_id}")
def get_problem_by_id(problem_id: str):
    for problem in problems:
        if problem["id"] == problem_id:
            return problem
    return {"error": "problem not found"}


@app.post("/problem/submit")
def submit_problem(submission: ProblemSubmission):
    for problem in problems:
        if problem["id"] == submission.problem_id:
            response = llm.chat(
                system_prompt="you are a coding behavior analyst, analyze this attempt and summarize the behavioral signals in 3-4 sentences",
                user_query=f"{problem}{submission}",
            )
            memory.retain(userid=submission.user_id, content= f"User attempted problem ID {submission.problem_id} titled '{problem['title']}'. Result: {'passed' if submission.passed else 'failed'}." + response)
            return {"status": "stored", "feedback": response}


@app.get("/insight/weekly")
def get_weekly_summary(user_id: str):
    prompt = "Analyze this user's learning patterns from the past week. What new concepts did they learn? What problems are still pending or unfinished? What topics from previous weeks haven't been revised in a while and are at risk of being forgotten? Have there been any improvements in their problem solving behavior compared to before?"
    weekly_summary = memory.reflect(user_id, prompt, budget="high")
    return weekly_summary

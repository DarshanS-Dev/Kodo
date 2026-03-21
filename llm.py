from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

llm = Groq(api_key=os.getenv("GROQ_API_KEY"))


def chat(system_prompt, user_query):
    response = llm.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_query},
        ],
    )
    return response.choices[0].message.content

import os
from fastapi import APIRouter
from pydantic import BaseModel
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

router = APIRouter()

SYSTEM = """You are ACQAR's AI assistant — an expert on Dubai real estate.
You help users with property prices, rental yields, area comparisons, 
investment analysis, and market trends in Dubai and UAE.
Be concise, factual, and helpful.
Never invent specific transaction prices or data you don't know."""

class ChatRequest(BaseModel):
    message: str

@router.post("/ai/chat")
async def ai_chat(req: ChatRequest):
    try:
        response = model.generate_content(
            f"{SYSTEM}\n\nUser: {req.message}"
        )
        return {"reply": response.text}
    except Exception as e:
        return {"reply": "Sorry, I could not process that. Please try again."}

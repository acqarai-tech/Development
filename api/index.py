from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import your existing FastAPI app
from app.app import app as main_app

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount your existing app
app.mount("/", main_app)

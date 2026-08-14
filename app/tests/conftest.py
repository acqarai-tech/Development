import os
import sys
from pathlib import Path

# Make `app/chat.py` importable as `chat` when running `pytest` from
# the app/ directory.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault(
    "SUPABASE_URL_CHAT", "https://example.supabase.co"
)
os.environ.setdefault(
    "SUPABASE_SERVICE_ROLE_KEY_CHAT",
    "eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9."
    "eyJyb2xlIjogInNlcnZpY2Vfcm9sZSIsICJpc3MiOiAic3VwYWJhc2UtZGVtbyJ9."
    "fakesignature",
)

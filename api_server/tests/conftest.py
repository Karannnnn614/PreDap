"""Pytest configuration: make api_server/ importable and provide a dummy
GEMINI_API_KEY so importing logic.py does not require a real key/network."""
import os
import sys

# Ensure logic.py / server.py import cleanly without a real key.
os.environ.setdefault("GEMINI_API_KEY", "test-key-not-real")

# api_server/ is the parent of this tests/ dir; add it to sys.path so
# `import server` / `import logic` work regardless of where pytest is invoked.
_API_SERVER_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _API_SERVER_DIR not in sys.path:
    sys.path.insert(0, _API_SERVER_DIR)

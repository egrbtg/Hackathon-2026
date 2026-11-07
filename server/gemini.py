"""Thin wrapper around the Gemini API (google-genai SDK).

Set GEMINI_API_KEY in the environment (or server/.env) before calling.

    from gemini import ask_gemini
    print(ask_gemini("Say hi"))
"""

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import errors, types

load_dotenv(Path(__file__).resolve().parent / ".env")

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
# Tried in order when the main model is overloaded, times out or is unavailable.
FALLBACK_MODELS = [
    m.strip()
    for m in os.getenv(
        "GEMINI_FALLBACK_MODELS", "gemini-3.1-flash-lite"
    ).split(",")
    if m.strip()
]
TIMEOUT_SECONDS = float(os.getenv("GEMINI_TIMEOUT", "30"))


@lru_cache(maxsize=1)
def _client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    return genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(timeout=int(TIMEOUT_SECONDS * 1000)),
    )


def ask_gemini(
    prompt: str,
    *,
    system: str | None = None,
    model: str = DEFAULT_MODEL,
    temperature: float | None = None,
    json_output: bool = False,
) -> str:
    """Send a prompt to Gemini and return the response text.

    system:      optional system instruction.
    json_output: ask the model to reply with JSON (parse the result with json.loads).
    """
    config = types.GenerateContentConfig(
        system_instruction=system,
        temperature=temperature,
        response_mime_type="application/json" if json_output else None,
    )
    last_error: Exception | None = None
    for candidate in [model, *(m for m in FALLBACK_MODELS if m != model)]:
        try:
            response = _client().models.generate_content(
                model=candidate, contents=prompt, config=config
            )
            return response.text or ""
        except errors.ClientError as e:
            # Bad key / bad request won't be fixed by another model; 404 and 429 might.
            if e.code not in (404, 429):
                raise
            last_error = e
        except Exception as e:  # 5xx overload, timeouts, network errors
            last_error = e
        print(f"[gemini] {candidate} failed ({type(last_error).__name__}), trying next model")
    raise RuntimeError("All Gemini models failed") from last_error


if __name__ == "__main__":
    print(ask_gemini("Reply with one short sentence confirming you work."))

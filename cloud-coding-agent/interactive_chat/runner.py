"""Interactive REPL: Vertex AI + function calling + repo tools."""
from __future__ import annotations

import json
import sys
from typing import Any

import vertexai
from vertexai.generative_models import (
    Content,
    FunctionDeclaration,
    GenerationConfig,
    GenerativeModel,
    Part,
    Tool,
)

from .config import REPO_ROOT, get_settings
from .tools import dispatch

SYSTEM_TEXT = """You are an expert Python engineer working on the compliance-audit monorepo (FastAPI backend, Azure/GCP/AWS evidence collectors).

You can use tools to read files, search the codebase, and write files. Prefer reading existing collectors under backend/app/azure_evidence/collectors/ before suggesting changes.

Rules:
- Use relative paths from the repository root (e.g. backend/app/azure_evidence/collectors/foo_collector.py).
- Match existing patterns: COLLECTOR_NAME, EVIDENCE_TYPE, SOURCE_SYSTEM, CONTROL_MAPPINGS, collect(subscription_id, credential).
- Keep changes minimal and consistent with neighboring files.
- After tools run, summarize what you did for the user.

Repository root: """ + str(
    REPO_ROOT
)

MAX_TOOL_ROUNDS = 12

_TOOL_DECLARATIONS = [
    FunctionDeclaration(
        name="read_file",
        description="Read a UTF-8 text file under the repository root.",
        parameters={
            "type": "object",
            "properties": {
                "relative_path": {
                    "type": "string",
                    "description": "Path relative to repo root, e.g. backend/app/azure_evidence/collectors/x.py",
                },
            },
            "required": ["relative_path"],
        },
    ),
    FunctionDeclaration(
        name="search_repo",
        description="Search for a literal substring in .py files under a subpath (default backend/app).",
        parameters={
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "subpath": {
                    "type": "string",
                    "description": "Optional path under repo root to search (default: backend/app).",
                },
            },
            "required": ["query"],
        },
    ),
    FunctionDeclaration(
        name="write_file",
        description=(
            "Create or overwrite a file under backend/ or cloud-coding-agent/output/. "
            "Writes under backend/ require the user to confirm in the terminal."
        ),
        parameters={
            "type": "object",
            "properties": {
                "relative_path": {"type": "string"},
                "content": {"type": "string"},
            },
            "required": ["relative_path", "content"],
        },
    ),
]


def _fc_args_to_dict(args: Any) -> dict[str, Any]:
    if args is None:
        return {}
    if isinstance(args, dict):
        return dict(args)
    try:
        return dict(args)  # protobuf MapComposite often dict-like
    except Exception:
        return {}


def _response_text(response: Any) -> str:
    t = getattr(response, "text", None)
    if t:
        return t
    try:
        parts = response.candidates[0].content.parts
        chunks: list[str] = []
        for p in parts:
            if getattr(p, "text", None):
                chunks.append(p.text)
        return "\n".join(chunks)
    except Exception:
        return ""


def _run_one_user_turn(model: GenerativeModel, history: list[Content], user_text: str) -> tuple[list[Content], str]:
    """Append user message, loop on function calls until model returns text."""
    contents: list[Content] = list(history)
    contents.append(Content(role="user", parts=[Part.from_text(user_text)]))

    tools = [Tool(function_declarations=_TOOL_DECLARATIONS)]
    gen_cfg = GenerationConfig(temperature=0.15, max_output_tokens=8192)

    assistant_text_parts: list[str] = []
    rounds = 0

    while rounds < MAX_TOOL_ROUNDS:
        rounds += 1
        response = model.generate_content(
            contents,
            tools=tools,
            generation_config=gen_cfg,
        )

        if not response.candidates:
            return contents, "Model returned no candidates (blocked or empty)."

        cand = response.candidates[0]
        finish = getattr(cand, "finish_reason", None)
        if finish and str(finish) not in ("STOP", "FinishReason.STOP", "1"):
            # still try to extract text
            pass

        parts = list(cand.content.parts)
        function_calls = [p for p in parts if getattr(p, "function_call", None)]

        if not function_calls:
            txt = _response_text(response)
            contents.append(cand.content)
            assistant_text_parts.append(txt)
            return contents, "\n\n".join(assistant_text_parts).strip()

        contents.append(cand.content)

        resp_parts: list[Part] = []
        for p in parts:
            fc = getattr(p, "function_call", None)
            if not fc:
                continue
            name = fc.name
            args = _fc_args_to_dict(getattr(fc, "args", None))
            result = dispatch(name, args)
            resp_parts.append(Part.from_function_response(name, result))

        if resp_parts:
            contents.append(Content(role="user", parts=resp_parts))

    return contents, "Stopped: too many tool rounds (safety limit)."


def run_repl() -> None:
    s = get_settings()
    if not s["project"]:
        print(
            "ERROR: GOOGLE_CLOUD_PROJECT is not set. Set it in backend/.env or the environment.",
            file=sys.stderr,
        )
        sys.exit(1)

    vertexai.init(project=s["project"], location=s["location"])
    model = GenerativeModel(s["model"], system_instruction=SYSTEM_TEXT)

    history: list[Content] = []

    print("Interactive coding agent (Vertex AI). Type 'exit' or Ctrl+C to quit.")
    print(f"Repo: {REPO_ROOT}")
    print(f"Model: {s['model']} @ {s['location']}\n")

    while True:
        try:
            user_text = input("You> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye.")
            break
        if not user_text:
            continue
        if user_text.lower() in ("exit", "quit", ":q"):
            print("Bye.")
            break

        try:
            history, reply = _run_one_user_turn(model, history, user_text)
        except Exception as e:
            print(f"\nAgent error: {e}\n")
            continue

        print(f"\nAgent> {reply}\n")

#!/usr/bin/env python3
from pathlib import Path
import sys


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: count-tokens.py <file>", file=sys.stderr)
        return 1

    path = Path(sys.argv[1])

    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        text = path.read_text(errors="ignore")

    try:
        import tiktoken
        enc = tiktoken.get_encoding("cl100k_base")
        print(len(enc.encode(text)))
    except Exception:
        # Fallback: rough approximation if tiktoken is unavailable
        print(len(text.split()))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
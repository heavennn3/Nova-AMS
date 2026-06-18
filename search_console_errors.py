import json

path = "/Users/cyk4/.gemini/antigravity-ide/brain/2df257f9-0e80-4401-8957-580dd5c2be56/.system_generated/logs/transcript.jsonl"

with open(path, 'r') as f:
    for i, line in enumerate(f):
        if "console" in line.lower() or "error" in line.lower() or "pageerror" in line.lower():
            obj = json.loads(line)
            content = obj.get("content", "")
            if isinstance(content, str) and ("[error]" in content or "[console]" in content or "TypeError" in content or "uncaught" in content.lower()):
                print(f"--- MATCH AT LINE {i+1} ---")
                print(content[:1500])
                print("-" * 50)

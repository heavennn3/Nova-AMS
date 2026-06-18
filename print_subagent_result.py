import json

path = "/Users/cyk4/.gemini/antigravity-ide/brain/2df257f9-0e80-4401-8957-580dd5c2be56/.system_generated/logs/transcript.jsonl"

with open(path, 'r') as f:
    for line in f:
        obj = json.loads(line)
        if obj.get("type") == "BROWSER_SUBAGENT" and "check_all_licenses_pages" in obj.get("content", ""):
            print("--- check_all_licenses_pages RESULT ---")
            print(obj.get("content"))
            print("=" * 60)

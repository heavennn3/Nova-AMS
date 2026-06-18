import json

path = "/Users/cyk4/.gemini/antigravity-ide/brain/2df257f9-0e80-4401-8957-580dd5c2be56/.system_generated/logs/transcript.jsonl"

with open(path, 'r') as f:
    for line in f:
        obj = json.loads(line)
        # Look for steps after 300
        step_index = obj.get("step_index", 0)
        if step_index > 300:
            print(f"Step {step_index} (Type: {obj.get('type')}, Status: {obj.get('status')})")
            if "tool_calls" in obj:
                print("  tool_calls:", [tc.get("name") for tc in obj["tool_calls"]])
            content = obj.get("content", "")
            if content and isinstance(content, str):
                # Search if there is something about logs or console
                if "console" in content.lower() or "error" in content.lower():
                    print("  content preview:", content[:500])

import json

path = "/Users/cyk4/.gemini/antigravity-ide/brain/2df257f9-0e80-4401-8957-580dd5c2be56/.system_generated/logs/transcript.jsonl"

with open(path, 'r') as f:
    for i, line in enumerate(f):
        if "capture_browser_console_logs" in line:
            obj = json.loads(line)
            print(f"Line {i+1} has capture_browser_console_logs. Type: {obj.get('type')}")
            # If the next line contains the output, let's print the next line
            # So let's store lines and print them.
            
# Let's read the lines into memory and look around matches
with open(path, 'r') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "capture_browser_console_logs" in line:
        print(f"\n--- MATCH AT LINE {idx+1} ---")
        # Print the match and 2 lines after it
        for j in range(max(0, idx - 1), min(len(lines), idx + 3)):
            obj = json.loads(lines[j])
            print(f"Line {j+1} [Type: {obj.get('type')}, Status: {obj.get('status')}]:")
            # print preview of content
            content = obj.get("content", "")
            if isinstance(content, str):
                print("  Content:", content[:300])
            else:
                print("  Content is object:", type(content))
            if "tool_calls" in obj:
                print("  Tool Calls:", obj["tool_calls"])

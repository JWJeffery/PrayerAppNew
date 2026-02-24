import os
import re
import json

def universal_repair(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Extract ID and Title (these are usually stable)
    id_match = re.search(r'"id":\s*"([^"]+)"', content)
    title_match = re.search(r'"title":\s*"([^"]+)"', content)
    
    if not id_match or not title_match:
        return # Skip index files or malformed non-data files

    id_val = id_match.group(1)
    title_val = title_match.group(1)

    # 2. Extract all 'Long' strings (Paragraphs)
    # We find all quoted text longer than 50 chars to avoid keys
    all_text = re.findall(r'"([^"]{50,})"', content)
    
    # 3. Clean and Unify
    paragraphs = []
    for text in all_text:
        # Remove 'primary_saint' header drift
        text = text.replace("primary_saint\\n\\n", "").replace("primary_saint\n\n", "")
        # Normalize all versions of newlines to single \n
        text = text.replace("\\\\n", "\n").replace("\\n", "\n")
        # Ensure it's not the title being caught
        if text.strip() != title_val.strip():
            paragraphs.append(text.strip())

    # 4. Final Narrative Construction
    # Join with exactly two newlines for HTML pre-wrap compatibility
    final_narrative = "\n\n".join(paragraphs)

    new_data = {
        "id": id_val,
        "title": title_val,
        "narrative": final_narrative
    }

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, indent=2, ensure_ascii=False)

# Targeted Directory Walk
root_dir = "./data/synaxarium/ethiopian"
for subdir, _, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".json") and "index" not in file:
            universal_repair(os.path.join(subdir, file))

print("Systematic Repair Complete. Check Git Diff.")
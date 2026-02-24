import os
import re
import json

def repair_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Force-extract ID and Title using Regex (avoiding parser crash)
        id_m = re.search(r'\"id\":\s*\"([^\"]+)\"', content)
        title_m = re.search(r'\"title\":\s*\"([^\"]+)\"', content)
        if not id_m or not title_m:
            return False

        # 2. Extract every quoted block longer than 50 characters (the paragraphs)
        # This vacuums up the 'orphaned' text segments separated by commas
        paras = re.findall(r'\"([^\"].{50,})\"', content)
        
        clean_paras = []
        for p in paras:
            # Strip metadata/header drift
            p = re.sub(r'^(Tiqimt|Ginbot|Yekatit|Tahsas|primary_saint)\s+', '', p, flags=re.I)
            # Fix double-backslash bug (\\\\n -> \n)
            p = p.replace('\\\\\\\\n', '\n').replace('\\\\n', '\n').replace('\\n', '\n')
            
            if p.strip() != title_m.group(1).strip():
                clean_paras.append(p.strip())
        
        # 3. Rebuild as a unified, valid JSON object
        new_data = {
            'id': id_m.group(1).strip(),
            'title': title_m.group(1).strip(),
            'narrative': '\n\n'.join(clean_paras)
        }
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

# Targeted path from your manifest
root_path = "./data/synaxarium/ethiopian"

if not os.path.exists(root_path):
    print(f"Error: Cannot find folder at {root_path}")
else:
    count = 0
    for root, _, files in os.walk(root_path):
        for f in files:
            if f.endswith('.json') and 'index' not in f:
                if repair_file(os.path.join(root, f)):
                    count += 1
    print(f"Normalization complete. Repaired {count} files.")
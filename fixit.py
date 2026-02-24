import os
import re
import json

def repair_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Force-extract ID and Title
        id_m = re.search(r'\"id\":\s*\"([^\"]+)\"', content)
        title_m = re.search(r'\"title\":\s*\"([^\"]+)\"', content)
        if not id_m or not title_m: return

        # 2. Extract every long string (paragraphs)
        # This fixes the 'broken comma' bug by vacuuming up the orphaned text
        paras = re.findall(r'\"([^\"].{50,})\"', content)
        
        clean_paras = []
        for p in paras:
            # Strip metadata/header drift
            p = re.sub(r'^(Tiqimt|Ginbot|Yekatit|Tahsas|primary_saint)\s+', '', p, flags=re.I)
            # Fix double-backslash bug
            p = p.replace('\\\\\\\\n', '\n').replace('\\\\n', '\n').replace('\\n', '\n')
            if p.strip() != title_m.group(1).strip():
                clean_paras.append(p.strip())
        
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

# This path matches the 'root' structure of the project you uploaded
root_data_path = "./data/synaxarium/ethiopian"

if not os.path.exists(root_data_path):
    print(f"Error: Cannot find folder at {root_data_path}")
else:
    count = 0
    for root, _, files in os.walk(root_data_path):
        for f in files:
            if f.endswith('.json') and 'index' not in f:
                if repair_file(os.path.join(root, f)):
                    count += 1
    print(f"Repaired {count} files. Check git diff now.")
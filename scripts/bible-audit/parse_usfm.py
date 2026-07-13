import re, json

def strip_usfm(text):
    text = re.sub(r'\\f\s*\+?.*?\\f\*', '', text, flags=re.DOTALL)
    text = re.sub(r'\\x\s*\+?.*?\\x\*', '', text, flags=re.DOTALL)
    text = text.replace('\\sc*', '')
    text = re.sub(r'\\sc\s*', '', text)
    text = text.replace('\\add*', '')
    text = re.sub(r'\\add\s*', '', text)
    text = re.sub(r'</?alt>', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_usfm_file(path):
    with open(path, encoding='utf-8') as f:
        content = f.read()
    chapters = {}
    cur_chap = None
    cur_verse = None
    buf = []
    def flush():
        nonlocal cur_verse, buf
        if cur_chap is not None and cur_verse is not None:
            txt = strip_usfm(' '.join(buf))
            chapters.setdefault(cur_chap, {})[cur_verse] = txt
        buf = []
    lines = content.split('\n')
    for line in lines:
        line = line.rstrip()
        cm = re.match(r'\\c\s+(\d+)', line)
        if cm:
            flush()
            cur_chap = int(cm.group(1))
            cur_verse = None
            continue
        vm = re.match(r'\\v\s+(\S+)\s*(.*)', line)
        if vm:
            flush()
            vnum = vm.group(1)
            cur_verse = vnum
            buf = [vm.group(2)]
            continue
        if line.startswith('\\'):
            mm = re.match(r'\\[a-zA-Z0-9]+\*?\s*(.*)', line)
            if mm and cur_verse is not None:
                buf.append(mm.group(1))
            continue
        else:
            if cur_verse is not None:
                buf.append(line)
    flush()
    return chapters

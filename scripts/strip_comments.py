#!/usr/bin/env python3
import re
import sys
from pathlib import Path

def strip_html_comments(text):
    return re.sub(r'<!--([\s\S]*?)-->', '', text)

def strip_css_comments(text):
    return re.sub(r'/\*([\s\S]*?)\*/', '', text)

def strip_js_comments(text):
    out = []
    i = 0
    n = len(text)
    in_s = None
    escape = False
    while i < n:
        ch = text[i]
        nxt = text[i+1] if i+1 < n else ''
        if in_s:
            out.append(ch)
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == in_s:
                in_s = None
            i += 1
            continue
        if ch == '"' or ch == "'" or ch == '`':
            in_s = ch
            out.append(ch)
            i += 1
            continue
        if ch == '/' and nxt == '/':
            # single-line comment: skip until newline
            i += 2
            while i < n and text[i] != '\n':
                i += 1
            continue
        if ch == '/' and nxt == '*':
            # multi-line comment
            i += 2
            while i < n-1 and not (text[i] == '*' and text[i+1] == '/'):
                i += 1
            i += 2
            continue
        out.append(ch)
        i += 1
    return ''.join(out)

def process_file(path: Path):
    text = path.read_text(encoding='utf-8')
    ext = path.suffix.lower()
    if ext == '.html' or ext == '.htm':
        new = strip_html_comments(text)
    elif ext == '.css':
        new = strip_css_comments(text)
    elif ext == '.js':
        new = strip_js_comments(text)
    else:
        return False
    if new != text:
        path.write_text(new, encoding='utf-8')
        return True
    return False

def main():
    repo_root = Path('.').resolve()
    changed = []
    # use git ls-files to limit to tracked files
    import subprocess
    p = subprocess.run(['git', 'ls-files'], capture_output=True, text=True)
    for line in p.stdout.splitlines():
        f = repo_root / line
        if f.exists() and f.suffix.lower() in ('.html', '.htm', '.css', '.js'):
            if process_file(f):
                changed.append(str(f))
    if changed:
        print('Modified files:')
        for c in changed:
            print(c)
    else:
        print('No comment changes made')

if __name__ == '__main__':
    main()

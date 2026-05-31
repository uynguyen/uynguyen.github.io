#!/usr/bin/env python3
"""Regenerate the Signal Hub website's "Nodes reference" section from the app.

- Existing nodes keep their on-page English text VERBATIM (so the i18n.js
  dictionary keys still match and translations don't break).
- The 15 newer nodes are built from the app's `WorkflowStepDocs`.
- Every node gets a read-only "Common flow" diagram (prior -> node -> after,
  with branches for If/Switch/Parallel/Try-Catch/Retry), mirroring the in-app
  Node Guide. Flow data is parsed from WorkflowNodeGuide.swift.
- Nodes are regrouped under the app's CURRENT categories.

New-node text is English; i18n.js falls back to English for unknown keys, so
non-English visitors see English for the new nodes until translations land.
"""
import re, html as _html

APP = "/Users/nguyenuy/Documents/blekit/SignalHubMac/SignalHubMac"
SITE = "index.html"
MODELS = open(f"{APP}/Features/Workflow/WorkflowModels.swift").read()
DOCS   = open(f"{APP}/Features/Workflow/WorkflowStepDocs.swift").read()
GUIDE  = open(f"{APP}/Features/Workflow/WorkflowNodeGuide.swift").read()

# ---- enum order ------------------------------------------------------------
enum_block = re.search(r'enum WorkflowStepKind[^{]*\{(.*?)var ', MODELS, re.S).group(1)
KIND_ORDER = re.findall(r'^\s*case `?(\w+)`?\b', enum_block, re.M)
# de-dup preserve order
seen=set(); KIND_ORDER=[k for k in KIND_ORDER if not (k in seen or seen.add(k))]

# ---- titles ----------------------------------------------------------------
title_block = re.search(r'var title: String \{(.*?)\n    \}', MODELS, re.S).group(1)
TITLE = dict(re.findall(r'case \.(\w+): return "([^"]+)"', title_block))

# ---- categories ------------------------------------------------------------
cat_block = re.search(r'var category: WorkflowStepCategory \{(.*?)\n    \}', MODELS, re.S).group(1)
CATEGORY = {}
for m in re.finditer(r'case\s+([^:]+?):\s*return\s+\.(\w+)', cat_block, re.S):
    cats = re.findall(r'\.(\w+)', m.group(1))
    for k in cats:
        CATEGORY[k] = m.group(2)

# ---- premium ---------------------------------------------------------------
prem_block = re.search(r'var isPremium: Bool \{(.*?)\n    \}', MODELS, re.S).group(1)
false_part = re.search(r'(.*?)return false', prem_block, re.S).group(1)
FALSE_KINDS = set(re.findall(r'\.(\w+)', false_part))
def is_premium(k): return k not in FALSE_KINDS

# ---- category display names + order ---------------------------------------
CAT_NAME = {"control":"Control","trigger":"Triggers","flow":"Flow","logic":"Logic",
            "scan":"Scan","connection":"Connection","discovery":"Discovery",
            "io":"Read / Write","notify":"Notify","link":"Link","data":"Data",
            "egress":"External"}
CAT_ORDER = ["control","trigger","connection","io","flow","logic","data","egress"]

# ---- guideFlow / guideBranches --------------------------------------------
gf_block = re.search(r'var guideFlow: \[WorkflowStepKind\] \{(.*?)\n    \}', GUIDE, re.S).group(1)
GUIDEFLOW = {}
for m in re.finditer(r'case (\.[\w, .`\n]+?):\s*return \[([^\]]*)\]', gf_block, re.S):
    kinds_lhs = re.findall(r'\.(\w+)', m.group(1))
    flow = re.findall(r'\.(\w+)', m.group(2))
    for k in kinds_lhs:
        GUIDEFLOW[k] = flow

gb_block = re.search(r'var guideBranches: \[GuideBranch\]\? \{(.*?)\n    \}', GUIDE, re.S).group(1)
GUIDEBRANCHES = {}
for case_m in re.finditer(r'case \.(\w+):\s*\n(.*?)(?=\n\s*case |\n\s*default:)', gb_block, re.S):
    k = case_m.group(1)
    branches = []
    for bm in re.finditer(r'GuideBranch\(label:\s*(nil|"([^"]*)"),\s*steps:\s*\[([^\]]*)\]\)', case_m.group(2)):
        label = None if bm.group(1) == "nil" else bm.group(2)
        steps = re.findall(r'\.(\w+)', bm.group(3))
        branches.append((label, steps))
    GUIDEBRANCHES[k] = branches

# ---- docs (only needed for NEW kinds) -------------------------------------
def swift_decode(s):
    return s.replace('\\"', '"').replace('\\n', ' ').replace('\\\\', '\\')

def to_html(text):
    out = _html.escape(swift_decode(text), quote=False)
    out = re.sub(r'`([^`]+)`', r'<code>\1</code>', out)
    return out

docs_ext = re.search(r'extension WorkflowStepKind \{\s*var docs.*', DOCS, re.S).group(0)
DOC_BLOCKS = {}
for m in re.finditer(r'case \.(\w+):\s*\n\s*return \.init\((.*?)\n            \)', docs_ext, re.S):
    DOC_BLOCKS[m.group(1)] = m.group(2)

def parse_docs(k):
    blk = DOC_BLOCKS[k]
    summary = re.search(r'summary:\s*"((?:[^"\\]|\\.)*)"', blk).group(1)
    attrs = re.findall(r'\.init\(name:\s*"((?:[^"\\]|\\.)*)",\s*detail:\s*"((?:[^"\\]|\\.)*)"\)', blk, re.S)
    exs = re.findall(r'\.init\(title:\s*"((?:[^"\\]|\\.)*)",\s*body:\s*"((?:[^"\\]|\\.)*)"\)', blk, re.S)
    return summary, attrs, exs

# ---- existing website nodes (verbatim) ------------------------------------
site = open(SITE).read()
coll_start = site.index('<div class="nodes-collection"')
coll_end = site.index('<div class="nodes-request">')
section = site[coll_start:coll_end]
EXISTING = {}   # name -> (badge, tagline, body_inner_html)
for it in re.finditer(r'<details class="node-item">(.*?)</details>', section, re.S):
    blk = it.group(1)
    name = re.search(r'<span class="node-name">(.*?)</span>', blk, re.S).group(1).strip()
    badge = re.search(r'<span class="node-badge">(.*?)</span>', blk, re.S).group(1).strip()
    tagm = re.search(r'<span class="node-tagline">(.*?)</span>', blk, re.S)
    tag = tagm.group(1).strip() if tagm else ""
    body = re.search(r'<div class="node-body">(.*)</div>\s*$', blk, re.S).group(1).strip()
    EXISTING[name] = (badge, tag, body)

TITLE_TO_KIND = {v: k for k, v in TITLE.items()}

# Badges for the new nodes (existing ones reuse their on-page badge).
NEW_BADGES = {
    "log":"≣","expression":"ƒ","counter":"#","switchCase":"⎇","stopwatch":"⏲",
    "macNotification":"✦","crc":"⊕","jsonExtract":"{}","random":"⚂",
    "captureAdvertisement":"⦿","base64":"⠿","debounce":"⏸","bitMask":"⊞",
    "throttle":"⏬","foreach":"∀",
}

def first_sentence(s):
    s = swift_decode(s)
    i = s.find(". ")
    return (s[:i+1] if i != -1 else s)

# ---- flow diagram html -----------------------------------------------------
def chip(kind, current=False):
    cls = "nf-chip nf-current" if current else "nf-chip"
    return f'<span class="{cls}">{_html.escape(TITLE.get(kind, kind))}</span>'

ARROW = '<span class="nf-arrow">→</span>'

def chain(kinds, current_kind):
    parts = []
    for i, k in enumerate(kinds):
        if i > 0: parts.append(ARROW)
        parts.append(chip(k, current=(k == current_kind)))
    return "".join(parts)

def flow_html(kind):
    flow = GUIDEFLOW.get(kind, ["start", kind, "end"])
    idx = flow.index(kind) if kind in flow else 0
    before = flow[:idx]
    after = flow[idx+1:]
    branches = GUIDEBRANCHES.get(kind)
    out = ['<div class="node-block-head">Common flow</div>', '<div class="node-flow">']
    if before:
        out.append(chain(before, kind)); out.append(ARROW)
    out.append(chip(kind, current=True))
    if branches:
        rows = []
        for label, steps in branches:
            row = [ARROW]
            if label is not None:
                row.append(f'<span class="nf-label">{_html.escape(label)}</span>')
                if steps: row.append(ARROW)
            if steps:
                row.append(chain(steps, kind))
            rows.append(f'<span class="nf-branch">{"".join(row)}</span>')
        out.append(f'<span class="nf-branches">{"".join(rows)}</span>')
    elif after:
        out.append(ARROW); out.append(chain(after, kind))
    out.append('</div>')
    return "\n        ".join(out)

# ---- build a node-item -----------------------------------------------------
def build_body_new(kind):
    summary, attrs, exs = parse_docs(kind)
    parts = [f'<p class="node-summary">{to_html(summary)}</p>']
    parts.append(flow_html(kind))
    if attrs:
        parts.append('<div class="node-block-head">Attributes</div>')
        for n, d in attrs:
            parts.append(f'<div class="node-attr"><div class="node-attr-name">{to_html(n)}</div>'
                         f'<div class="node-attr-detail">{to_html(d)}</div></div>')
    if exs:
        parts.append('<div class="node-block-head">Example use cases</div>')
        for t, b in exs:
            parts.append('<div class="node-example">'
                         f'<div class="node-example-title">{to_html(t)}</div>'
                         f'<div class="node-example-body">{to_html(b)}</div></div>')
    return "\n        ".join(parts)

def insert_flow_into_existing(body, kind):
    """Append the flow block right after the node-summary paragraph."""
    fh = flow_html(kind)
    m = re.search(r'(</p>)', body)
    if m:
        return body[:m.end()] + "\n        " + fh + body[m.end():]
    return fh + "\n        " + body

def node_item(kind):
    title = TITLE[kind]
    if title in EXISTING:
        badge, tag, body = EXISTING[title]
        body = insert_flow_into_existing(body, kind)
    else:
        summary, _, _ = parse_docs(kind)
        badge = NEW_BADGES.get(kind, title[:1])
        tag = first_sentence(summary)
        body = build_body_new(kind)
    # Pro/free status is intentionally NOT surfaced on the marketing site.
    return f'''    <details class="node-item">
      <summary>
        <span class="node-badge">{badge}</span>
        <span class="node-name">{_html.escape(title)}</span>
        <span class="node-tagline">{_html.escape(tag)}</span>
        <span class="node-chevron"></span>
      </summary>
      <div class="node-body">
        {body}
      </div>
    </details>'''

# ---- assemble the collection ----------------------------------------------
out = ['  <div class="nodes-collection" id="nodes-collection" hidden>', '']
total = 0
for cat in CAT_ORDER:
    kinds = [k for k in KIND_ORDER if CATEGORY.get(k) == cat]
    if not kinds: continue
    total += len(kinds)
    out.append(f'  <!-- {CAT_NAME[cat]} -->')
    out.append('  <div class="nodes-category reveal">')
    out.append(f'    <div class="nodes-category-head">{CAT_NAME[cat]} '
               f'<span class="count">— {len(kinds)} node{"s" if len(kinds)!=1 else ""}</span></div>')
    out.append('    <div class="nodes-grid">')
    for k in kinds:
        out.append(node_item(k))
    out.append('    </div>')
    out.append('  </div>')
    out.append('')
out.append('  </div>')
collection_html = "\n".join(out) + "\n\n  "

# splice into index.html
new_site = site[:coll_start] + collection_html + site[coll_end:]
open(SITE, "w").write(new_site)
print(f"nodes total: {total}  (categories: {sum(1 for c in CAT_ORDER if any(CATEGORY.get(k)==c for k in KIND_ORDER))})")
print("new nodes:", [TITLE[k] for k in KIND_ORDER if TITLE[k] not in EXISTING])

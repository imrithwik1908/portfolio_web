"""Build the downloadable résumé (PDF and DOCX) from lib/resume.json.

ATS-friendly by construction: one column, real selectable text, standard section headings, plain
bullets, no tables, images, text boxes, headers or footers, and a standard font. The PDF is shrunk
step by step until it fits on one page.

Usage (needs reportlab, python-docx and pypdf):
    python scripts/build_resume.py
"""

import json
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, Inches, RGBColor
from pypdf import PdfReader
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import HRFlowable, ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer, KeepTogether

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "lib" / "resume.json").read_text())
OUT = ROOT / "public"
STEM = "Sai_Rithwik_Reddy_Chirra_Resume"
INK, MUTED, RULE = HexColor("#111111"), HexColor("#444444"), HexColor("#999999")


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build_pdf(size: float) -> Path:
    path = OUT / f"{STEM}.pdf"
    lead = size * 1.2
    st = {
        "name": ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=size + 9, leading=size + 12, alignment=TA_CENTER, textColor=INK),
        "contact": ParagraphStyle("contact", fontName="Helvetica", fontSize=size - 0.5, leading=lead, alignment=TA_CENTER, textColor=MUTED),
        "h": ParagraphStyle("h", fontName="Helvetica-Bold", fontSize=size + 1, leading=size + 3, spaceBefore=size * 0.55, textColor=INK),
        "body": ParagraphStyle("body", fontName="Helvetica", fontSize=size, leading=lead, textColor=INK),
        "row": ParagraphStyle("row", fontName="Helvetica", fontSize=size, leading=lead, textColor=INK),
        "sub": ParagraphStyle("sub", fontName="Helvetica-Oblique", fontSize=size, leading=lead, textColor=MUTED),
        "bullet": ParagraphStyle("bullet", fontName="Helvetica", fontSize=size, leading=lead, textColor=INK),
    }

    def heading(text):
        return [Paragraph(text.upper(), st["h"]), HRFlowable(width="100%", thickness=0.6, color=RULE, spaceBefore=1, spaceAfter=size * 0.25)]

    def row(left, right):
        # Left and right on one line without a table: right-aligned text via a tab-like trick.
        return Paragraph(f"{left}<font color='#444444'> | {right}</font>" if right else left, st["row"])

    def bullets(items):
        return ListFlowable([ListItem(Paragraph(esc(b), st["bullet"]), leftIndent=11, value="•") for b in items],
                            bulletType="bullet", start="•", leftIndent=11, bulletFontSize=size, spaceBefore=1)

    flow = [Paragraph(esc(DATA["name"]), st["name"]), Spacer(1, 2)]
    contact = "  |  ".join(f"<a href='{c['href']}'>{esc(c['label'])}</a>" if c.get("href") else esc(c["label"]) for c in DATA["contact"])
    flow += [Paragraph(contact, st["contact"])]

    flow += heading("Summary") + [Paragraph(esc(DATA["summary"]), st["body"])]

    flow += heading("Education")
    for e in DATA["education"]:
        flow.append(KeepTogether([
            row(f"<b>{esc(e['school'])}</b>, {esc(e['place'])}", esc(e["when"])),
            Paragraph(f"{esc(e['degree'])}  |  {esc(e['gpa'])}  |  {esc(e['detail'])}", st["sub"]),
            Spacer(1, size * 0.15),
        ]))

    flow += heading("Experience")
    for x in DATA["experience"]:
        flow.append(KeepTogether([
            row(f"<b>{esc(x['role'])}</b>, {esc(x['org'])}, {esc(x['place'])}", esc(x["when"])),
            bullets(x["bullets"]),
            Spacer(1, size * 0.2),
        ]))

    flow += heading("Projects")
    for p in DATA["projects"]:
        flow.append(KeepTogether([
            row(f"<b><a href='{p['href']}'>{esc(p['name'])}</a></b>: {esc(p['what'])}  <font color='#444444'>({esc(p['stack'])})</font>", esc(p["when"])),
            bullets(p["bullets"]),
            Spacer(1, size * 0.2),
        ]))

    pub = DATA["publication"]
    flow += heading("Publication") + [Paragraph(
        f"<b>{esc(pub['title'])}</b>. {esc(pub['authors'])}. <i>{esc(pub['venue'])}</i>. <a href='{pub['href']}'>{esc(pub['href'])}</a>", st["body"])]

    flow += heading("Skills") + [Paragraph(f"<b>{esc(s['group'])}:</b> {esc(s['items'])}", st["body"]) for s in DATA["skills"]]

    doc = SimpleDocTemplate(str(path), pagesize=LETTER, leftMargin=0.5 * inch, rightMargin=0.5 * inch, topMargin=0.4 * inch, bottomMargin=0.4 * inch,
                            title=f"{DATA['name']} — Résumé", author=DATA["name"], subject="Résumé: machine learning engineering and data science",
                            keywords="machine learning engineer, data scientist, Python, PyTorch, NLP, LLM evaluation")
    doc.build(flow)
    return path


def build_docx() -> Path:
    path = OUT / f"{STEM}.docx"
    d = Document()
    for s in d.sections:
        s.left_margin = s.right_margin = Inches(0.6)
        s.top_margin = s.bottom_margin = Inches(0.5)
    base = d.styles["Normal"]
    base.font.name, base.font.size = "Calibri", Pt(10.5)
    base.paragraph_format.space_after = Pt(1)

    def para(text="", bold=False, italic=False, size=None, align=None, after=1):
        p = d.add_paragraph()
        if text:
            r = p.add_run(text); r.bold, r.italic = bold, italic
            if size: r.font.size = Pt(size)
        if align: p.alignment = align
        p.paragraph_format.space_after = Pt(after)
        return p

    def heading(text):
        p = para(text.upper(), bold=True, size=11.5, after=2)
        p.paragraph_format.space_before = Pt(8)

    def bullet(text):
        p = d.add_paragraph(text, style="List Bullet")
        p.paragraph_format.space_after = Pt(1)

    para(DATA["name"], bold=True, size=18, align=WD_ALIGN_PARAGRAPH.CENTER)
    para("  |  ".join(c["label"] for c in DATA["contact"]), size=9.5, align=WD_ALIGN_PARAGRAPH.CENTER, after=4)
    heading("Summary"); para(DATA["summary"])
    heading("Education")
    for e in DATA["education"]:
        p = para(); p.add_run(f"{e['school']}, {e['place']}").bold = True; p.add_run(f"  |  {e['when']}")
        para(f"{e['degree']}  |  {e['gpa']}  |  {e['detail']}", italic=True, after=3)
    heading("Experience")
    for x in DATA["experience"]:
        p = para(); p.add_run(f"{x['role']}, {x['org']}, {x['place']}").bold = True; p.add_run(f"  |  {x['when']}")
        for b in x["bullets"]: bullet(b)
    heading("Projects")
    for pr in DATA["projects"]:
        p = para(); p.add_run(pr["name"]).bold = True; p.add_run(f": {pr['what']} ({pr['stack']})  |  {pr['when']}")
        for b in pr["bullets"]: bullet(b)
    heading("Publication")
    pub = DATA["publication"]
    p = para(); p.add_run(pub["title"]).bold = True; p.add_run(f". {pub['authors']}. {pub['venue']}. {pub['href']}")
    heading("Skills")
    for s in DATA["skills"]:
        p = para(); p.add_run(f"{s['group']}: ").bold = True; p.add_run(s["items"])
    d.core_properties.title = f"{DATA['name']} — Résumé"
    d.core_properties.author = DATA["name"]
    d.save(path)
    return path


if __name__ == "__main__":
    for size in (10.5, 10, 9.8, 9.5):
        pdf = build_pdf(size)
        pages = len(PdfReader(str(pdf)).pages)
        if pages == 1:
            print(f"PDF: {pdf.name}, one page at {size} pt")
            break
    else:
        sys.exit("Résumé does not fit on one page even at 9.5 pt; trim the content.")
    print(f"DOCX: {build_docx().name}")

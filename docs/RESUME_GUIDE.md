# Résumé: how it's built and how to keep it strong

The résumé has one source: `lib/resume.json`. The site's résumé view reads it, and
`scripts/build_resume.py` turns it into the downloadable files in `public/`:

- `Sai_Rithwik_Reddy_Chirra_Resume.pdf` (text-based, one page)
- `Sai_Rithwik_Reddy_Chirra_Resume.docx` (for portals that ask for Word)

To update: edit `lib/resume.json`, then run

```bash
python3 -m venv .venv && .venv/bin/pip install reportlab python-docx pypdf
.venv/bin/python scripts/build_resume.py
```

The script refuses to produce a second page; if it fails, cut words, not font size.

## The rules it follows

**Gets past the ATS (applicant tracking system)**
- One column, top to bottom. No tables, text boxes, icons, photos, headers or footers.
- Standard section names: Summary, Education, Experience, Projects, Publication, Skills.
- Real, selectable text in a standard font (Helvetica / Calibri), body 9.5–11 pt.
- Dates in one consistent format (`Mon YYYY – Mon YYYY`).
- File named `First_Last_Resume.pdf`. Send the PDF unless a posting asks for .docx.

**Gets past the human (6–10 seconds on the first read)**
- One page while you have under ~5 years of experience.
- Every bullet follows *accomplished X, measured by Y, by doing Z*: start with a strong verb,
  put the number early, end with how you did it.
- Numbers must be true and checkable. Prefer results (accuracy, error, latency, scale, users)
  over effort ("worked on", "helped with").
- Translate model metrics into what they bought: "error down to $142/day, enabling 15% better
  budget allocation" beats "MAE 142".
- Name the tools inside the bullets where they did the work; the Skills section is a backup for
  keyword matching, not the main evidence.
- Most impressive, most relevant first: within each section and within each entry.

**For each application**
- Mirror the posting's wording where it's honestly true (for example "LLM evaluation", "PyTorch",
  "time-series forecasting"), and reorder Projects so the closest match is first.
- Add your phone number to the copy you submit. The public copy on the site leaves it off on
  purpose.

## What was corrected from the previous version

The earlier PDF had claims the repositories don't support. They are not in this version:

- Course Catalog: "React", "300+ students and faculty", "100+ users", "50%" and "40%". The repo
  is Node/Express/EJS and has no usage data.
- Tensor Fusion: "low-rank tensor fusion", "CMU-MOSEI", "78.4%" and "outperforming baselines by
  15%". The notebooks implement a full Tensor Fusion Network on CMU-MOSI and print 70.4%.
- X-MuTeST: "improving classification accuracy by up to 88%" read as an 88% improvement; the
  paper reports accuracy of 88.8% (Telugu), 87.5% (Hindi) and 86.0% (English).

Kept as stated in your résumé (not verifiable from a repo, so keep the evidence handy for
interviews): Blackcoffer's 18% / 82% / $142 / 15% figures and the 20% latency reduction at
IIT Indore.

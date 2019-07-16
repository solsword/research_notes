#!/usr/bin/env python3

import csv

IN = "choice_study_raw.csv"
OUT = "choice_study.tsv"

DIALECT_IN = "excel"
DIALECT_OUT = "excel-tab"

FIELDS = [
  "worker",
  "duration",
  "condition",
  "decision.case",
  "opt.balanced",
  "opt.nobad",
  "opt.nogood",
  "opt.obvious",
  "opt.stakes",
  "out.bad",
  "out.broken",
  "out.expected",
  "out.fair",
  "out.good",
  "out.happy",
  "out.regret",
  "out.sense",
  "out.unexpected",
  "out.unfair",
]

records = []

with open(IN, 'r') as fin:
  reader = csv.DictReader(fin, dialect=DIALECT_IN)
  for row in reader:
    records.append({ x: row[x] for x in FIELDS})

with open(OUT, 'w') as fout:
  writer = csv.DictWriter(fout, FIELDS, dialect=DIALECT_OUT)
  writer.writeheader()
  writer.writerows(records)

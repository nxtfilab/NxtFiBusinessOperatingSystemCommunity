"""Read-only source reconciliation. No third-party Python packages required.

Run: python scripts/audit-reference.py /exact/path/to/reference.xlsx
"""
import collections
import json
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

baseline = json.loads(Path("src/data/baseline.json").read_text())
ns = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
with zipfile.ZipFile(sys.argv[1]) as archive:
    shared = []
    if "xl/sharedStrings.xml" in archive.namelist():
        shared = ["".join(node.itertext()) for node in ET.fromstring(archive.read("xl/sharedStrings.xml"))]
    relationships = {
        r.attrib["Id"]: r.attrib["Target"]
        for r in ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    }
    imported = {}
    for sheet in ET.fromstring(archive.read("xl/workbook.xml")).find("s:sheets", ns):
        rel = sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
        target = relationships[rel]
        target = target.lstrip("/") if target.startswith("/") else "xl/" + target
        rows = []
        for row in ET.fromstring(archive.read(target)).findall(".//s:sheetData/s:row", ns):
            values = []
            for cell in row:
                value = cell.find("s:v", ns)
                inline = cell.find("s:is", ns)
                text = value.text if value is not None else "".join(inline.itertext()) if inline is not None else ""
                if cell.attrib.get("t") == "s":
                    text = shared[int(text)]
                values.append(cell.attrib["r"] + ":" + str(text))
            rows.append(values)
        imported[sheet.attrib["name"]] = rows
assert imported == baseline, "Source cell mismatch: workbook and retained baseline differ"

def rows(name):
    return [
        {cell.split(":", 1)[0].rstrip("0123456789"): cell.split(":", 1)[1] for cell in row}
        for row in baseline[name][1:]
    ]

expected = {"WBS": 76, "Milestones": 12, "RAID": 12, "Decision Log": 7, "Budget": 12}
for name, count in expected.items():
    assert len(rows(name)) == count, (name, len(rows(name)), count)
tasks = rows("WBS")
ids = [r["A"] for r in tasks]
assert len(ids) == len(set(ids)), "Duplicate WBS IDs"
assert len({r["B"] for r in tasks}) == 12, "Missing workstream"
assert {r["A"] for r in rows("Milestones")} == {f"M{i:02d}" for i in range(1, 13)}
graph = {r["A"]: [d for d in r["J"].split(";") if d] for r in tasks}
missing = [(id_, d) for id_, deps in graph.items() for d in deps if d not in graph]
assert missing == [("WS06-09", "WS07-06")], missing
cycles = set()

def walk(id_, path):
    if id_ in path:
        cycles.add(tuple(sorted(path[path.index(id_):])))
        return
    for d in graph.get(id_, []):
        walk(d, path + [id_])

for id_ in graph:
    walk(id_, [])
assert cycles == {("WS03-09", "WS08-07"), ("WS04-05", "WS10-02")}, cycles
assert all(r["M"] == "Not started" and r["N"] == "0" for r in tasks)
assert all(not r[k] for r in rows("Budget") for k in ("D", "E", "F"))
print("PASS: all 13 source sheets and cells match the original workbook.")
print("PASS: 76 unique WBS tasks, 12 milestones, 12 workstreams, 12 risks, 7 decisions, 12 budget lines.")
print("PASS: original statuses, zero progress, empty financial actuals and original dependencies preserved.")
print("CONFIRMED source exceptions:", missing, sorted(cycles))

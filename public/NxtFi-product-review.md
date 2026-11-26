# NxtFi Business Operating System — product review and developer handover

## Review scope and source precedence

Reviewed the complete application against:

1. NxtFi_90_Day_Operating_Plan_v2.docx — strategic intent and governance.
2. NxtFi_90_Day_Execution_Control_Centre_v2.xlsx — original operational records.
3. NxtFi_Technical_Architecture_Ahmed.pptx — added architecture/brand reference, not a replacement execution baseline.

This is a **local product-review prototype**, not a production operating system.
It is suitable for reviewing management flows, source relationships and proposed
data structures, not for authorising live transactions or making regulated claims.

## Twelve-point source and control review

| Area | Review result and implemented treatment |
|---|---|
| Original WBS | All 76 original tasks and IDs retained. Original title, owner, start/finish dates, descriptions, dependencies, deliverables and statuses available under Source. Working updates do not overwrite source cells. |
| Milestones | M01–M12 retained with original owners, dates, dependencies and acceptance evidence. All are searchable and exportable. |
| Workstreams | WS01–WS12 retained. Plan names/leads and workbook task themes displayed together; no silent remapping. |
| Dependencies | Explicit task/milestone links and reverse links shown. Missing and incomplete prerequisites block task completion. Source cycles and date overlaps flagged. |
| KPIs | Computed from working records. Progress is an unweighted mean of recorded task percentages. Missing finance values stay unknown, not zero. No invented planned-progress curve. |
| Accountability | Original RACI displayed. Proposed appointments remain unverified. Shared A/R requires management confirmation. Task-owner changes need change control. |
| Finance | Estimates, quotations, forecast, commitments, approved budgets and actuals are separate fields. Approved/committed/actual values are controlled/read-only. Expense claims do not become actual expenses. |
| Regulatory | Original legal/regulatory WBS shown with clear research/advice/approval distinction. Task completion never implies a licence or regulator approval. |
| Partners | Typed diligence fields, transparent proposed weights, mandatory licence/funds-flow/operational references, and comparison. Selection/activation is blocked in the preview. |
| Gates | All five plan gates shown. G1 has no fabricated date. Evidence-backed approval requests are supported; authorised approval execution is disabled. |
| Decisions / changes | Typed impact forms and before/after, timestamped record-level histories. Approval requests are not approvals and cannot change baseline values. |
| Business accuracy | No invented partners, merchants, expenses, incorporation, regulatory approval, production deployment or delivery completion. Additional technical deck evidence is not imported as WBS completion. |

## Source issues requiring management resolution

- **VAL-01:** Workstream meanings differ, particularly WS08–WS11. Workbook WS09
  is commercial, WS10 finance and WS11 market; plan WS09 is operations/support,
  WS10 merchant validation and WS11 finance/funding. Preserve both versions until approved.
- **VAL-02:** The “90-day” plan spans 92 elapsed calendar days,
  23 November 2026 to 23 February 2027. No dates have been changed.
- **VAL-03:** G1 Foundation is in the plan, absent from the workbook.
- **VAL-04:** Joint A/R assignments require explicit acceptance. Mr Ahmad’s
  appointment and authority remain to be documented.
- **VAL-05:** WS06-09 references missing task WS07-06. Do not invent that task.
- **VAL-06:** Circular dependencies: WS03-09 ↔ WS08-07 and
  WS04-05 ↔ WS10-02. Management must approve corrected dependency logic.
- **VAL-07:** Numerous predecessor/successor dates overlap if interpreted as
  finish-to-start. Dependency type is unspecified; overlaps are warnings, not
  silent rescheduling.
- **VAL-08:** Financial amounts, provider names, source approval evidence,
  mitigation deadlines and operational actuals are missing.
- **VAL-09:** Technical deck slide 5 disclaims successful payment execution,
  while slide 6 lists token execution with a checkmark. The stricter evidence
  boundary is retained. This is a source-review question, not verified delivery.
- **VAL-10:** Milestone targets can precede prerequisite finish dates. The
  live validation page lists the exact affected records.

## Corrected application gaps

- Replaced generic forms with typed fields for all operational register domains.
- Replaced incorrect objective-to-task links with explicitly proposed thematic links.
- All seven task statuses are visible on Kanban; navigation resets incompatible views.
- Newly added local records remain in their correct register.
- Task completion requires a real reference, a named reviewer and complete prerequisites.
- All record types have working-history and source tabs.
- Decision, gate, budget and change approval requests retain rationale/evidence and history.
- Partner comparison includes mandatory evidence checks and weighted score completeness.
- Reports export their selected record domain, not the same task CSV for every report.
- Search spans all record domains; filters, grouping, sorting, pagination and
  selection/export are connected to actual working records.
- Financial claims are separated from approved expenditure.
- Source validation includes missing/circular dependencies and milestone sequencing.
- Removed unsupported indicative progress curve.
- Added mobile navigation, keyboard search, dialog focus handling and clear local-only notices.
- Applied the deck’s navy/orange identity and extracted embedded NxtFi logo,
  not a fabricated text mark.

## Proposed data structure and code map

- `src/data/baseline.json`: complete immutable workbook cell layer, including all 13 sheets.
- `src/data/model.ts`: typed entities, source adapters, field schemas, objectives,
  workstream perspectives, relationship audit and partner scoring.
- `src/App.tsx`: shared shell, connected registers, record editor, histories,
  filters, reports, local persistence, completion guards and approval-request guards.
- `public/nxtfi-logo.png`: original embedded logo from the supplied technical deck.
- `scripts/audit-reference.py`: source-to-JSON reconciliation and known-exception assertions.

Tasks link to workstreams and dependencies. Milestones link to task IDs. RAID
records link to tasks. Objectives have proposed thematic task/workstream links.
Expense requests link to budget lines. Documents can link to tasks, milestones,
decisions and risks. Every working event identifies its record and contains a
timestamp, simulated actor, rationale and before/after snapshot.

Source records retain original values. Working records and local drafts are distinct.
Record IDs prefixed LOCAL are not workbook baseline IDs.
The prior v2 local activity is retained, and v2 task/draft data is migrated where
available. Legacy unsupported Complete claims become Under Review pending attestation.

## Prototype limitations / production backlog

**Do not treat these as implemented production services:**

- Real login, authenticated identities, organisation membership and secure session management.
- Server-enforced roles, confidential document permissions and adviser-scoped record access.
- Authorised/signed decisions, joint approval quorums and delegated authority checks.
- Secure private file uploads, malware scanning, signed download URLs or versioned file storage.
- Immutable audit logs, shared database transactions, concurrency and cross-device synchronisation.
- Approval-driven baseline revision service with immutable baseline versions.
- Email/calendar delivery, meeting scheduling or live external integrations.
- A full dependency-network Gantt engine; current bars use source dates, with explicit dependency lists.
- PDF rendering service; current PDF support uses browser print.
- Financial settlement or payment functionality (intentionally out of scope).

The current RACI role selector is an interaction simulation, not an authorisation
mechanism. LocalStorage and event history can be changed by the browser owner.
File inputs retain metadata, not uploaded document bytes. Approval requests are
local entries, not notifications sent to real approvers.

Dedicated regulatory assessments/features currently use source WBS task records
rather than duplicating them as disconnected claims. Future domain-specific
assessment/feature entities should reference those tasks and preserve evidence
classification (research, counsel advice, regulator approval; prototype, testnet,
sandbox, production).

## Required production approval transaction

1. Authenticate the approver; verify organisation, role and documented mandate.
2. Resolve reserved matters and require all required approvers.
3. Validate mandatory evidence, conditions and prerequisite records.
4. Record outcome, named approvers, evidence versions, conditions and timestamp.
5. Write immutable before/after baseline revision atomically.
6. Notify affected owners and re-aggregate dashboards from the accepted revision.

## Validation and review procedure

Automated source reconciliation:

```sh
python scripts/audit-reference.py /exact/path/to/NxtFi_90_Day_Execution_Control_Centre_v2.xlsx
```

Type checking:

```sh
./node_modules/.bin/tsc --noEmit
```

Manual product-review acceptance:

1. Visit every sidebar module and switch mobile module navigation.
2. Confirm 76 original WBS tasks, M01–M12 and WS01–WS12 in a clean browser.
3. Search WS06-09 and inspect missing WS07-06; inspect both circular pairs.
4. Try Complete without evidence/reviewer, then with an incomplete prerequisite.
5. Confirm a scope proposal does not rewrite an original task’s dates or ID.
6. Add a partner draft, enter all five scores, omit mandatory licence evidence:
   comparison must remain not eligible.
7. Submit a decision/change/gate request without evidence, authority or rationale:
   validation must block it. Valid requests must remain unapproved.
8. Enter estimate/quote/forecast values and an expense claim: actual/committed
   expenditure must not change.
9. Switch report domains and export: columns/rows must follow the selected domain.
10. Review per-record history, source fields, keyboard focus, narrow-screen
    horizontal table scrolling and browser reload persistence.

No browser automation pass is implied by this document. See the completion
summary for checks actually run in the editing environment.

import workbook from './baseline.json';

export type Fields = Record<string, string>;
export type Kind = 'task' | 'milestone' | 'gate' | 'risk' | 'decision' | 'change' | 'partner' | 'merchant' | 'budget' | 'expense' | 'review' | 'document' | 'objective';
export type Item = {
  id: string; kind: Kind; title: string; owner: string; status: string;
  fields: Fields; source?: Fields; sourceSheet?: string;
};
export type Event = {
  id: string; record: string; at: string; action: string;
  before?: string; after?: string; note: string; actor: string;
};
export type Field = [string, string, string?];
export const raw = workbook as Record<string, string[][]>;
export const normalize = (s: string) => s.toLowerCase().replace(/ /g, '');
export const iso = (s = '') => /^\d{5}$/.test(s) ? new Date((Number(s) - 25569) * 86400000).toISOString().slice(0, 10) : s;
export const displayDate = (s = '') => !s || !Number.isFinite(Date.parse(iso(s))) ? 'Not recorded' : new Date(`${iso(s)}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
export const columns = (name: string, header = 0): Fields => cells(raw[name][header]);
function cells(row: string[]): Fields {
  return Object.fromEntries(row.map(c => [c.split(':')[0].replace(/\d/g, ''), c.slice(c.indexOf(':') + 1)]));
}
export function sheet(name: string, header = 0): Fields[] {
  return raw[name].slice(header + 1).map(cells).filter(r => !!r.A && r.A !== 'None');
}
export const taskStatuses = ['Not Started', 'In Progress', 'Under Review', 'Complete', 'At Risk', 'Blocked', 'Deferred'];
export const workstreams = [
  ['WS01', 'Founder & governance', 'Kedaar + Mr Ahmad', 'Foundation / Governance'],
  ['WS02', 'Corporate structure', 'Kedaar', 'Structuring / Operations'],
  ['WS03', 'Regulatory & legal', 'Kedaar; specialist counsel advises', 'Regulatory / Compliance'],
  ['WS04', 'Business model & corridor', 'Kedaar + Mr Ahmad', 'Strategy'],
  ['WS05', 'Partner ecosystem', 'Kedaar + Mr Ahmad', 'Partnerships'],
  ['WS06', 'Product & architecture', 'Kedaar / technical lead', 'Product / Architecture / Engineering / Testing'],
  ['WS07', 'Security & assurance', 'Technical lead', 'Blockchain / Security / Infrastructure'],
  ['WS08', 'Compliance & risk operations', 'Kedaar + partners/advisers', 'Operations / Risk'],
  ['WS09', 'Operations & customer support', 'Kedaar + partners', 'Commercial'],
  ['WS10', 'Merchant validation', 'Mr Ahmad + Kedaar', 'Finance'],
  ['WS11', 'Finance & funding', 'Kedaar', 'Market'],
  ['WS12', 'Pilot readiness & evaluation', 'Kedaar + Mr Ahmad', 'Pilot'],
];
const gateNames = ['Foundation', 'Legal Route', 'Partner & Design', 'Readiness', 'Pilot Go/No-Go'];
const questions = ['Are the people, scope and controls clear?', 'Is the proposed operating model legally viable?', 'Can the proposed flow be delivered by the selected providers?', 'Can the flow be operated safely and reliably in a controlled environment?', 'Are all conditions for a limited pilot met?'];
export const objectiveDefinitions = [
  ['Founder and governance', 'Kedaar + Mr Ahmad', 'Founder roles and commercial principles documented; approval matrix agreed; weekly governance operating.', 'WS01'],
  ['Regulatory readiness', 'Kedaar / counsel', 'Written counsel assessment covers each activity, entity, geography, funds flow, customer type and partner role.', 'WS02,WS03'],
  ['Partner readiness', 'Kedaar + Mr Ahmad', 'At least two credible provider options assessed where market availability permits; primary and fallback route recorded.', 'WS05'],
  ['Product readiness', 'Kedaar / technical lead', 'MVP scope, architecture, API contracts, reconciliation and exception paths approved and tested.', 'WS06'],
  ['Security and controls', 'Technical lead', 'Critical/high findings tracked; no unresolved critical finding at pilot gate; access and key management reviewed.', 'WS07'],
  ['Commercial validation', 'Mr Ahmad + Kedaar', 'Target segment, use case, pricing assumptions and pilot acceptance criteria supported by documented discovery.', 'WS04,WS09'],
  ['Financial discipline', 'Kedaar', 'All spend has owner, quote, approval and actuals; forecast remains within the approved cap.', 'WS10'],
];
const item = (kind: Kind, id: string, title: string, owner: string, status: string, fields: Fields, source?: Fields, sourceSheet?: string): Item => ({ kind, id, title, owner, status, fields, source, sourceSheet });
export const initial: Item[] = [
  ...sheet('WBS').map(r => item('task', r.A, r.D, r.F, taskStatuses.find(s => normalize(s) === normalize(r.M)) || r.M, { workstream: r.B, phase: r.C, description: r.E, support: r.G, start: iso(r.H), due: iso(r.I), dependencies: r.J, deliverable: r.K, priority: r.L, progress: r.N, blockers: r.O }, r, 'WBS')),
  ...sheet('Milestones').map(r => item('milestone', r.A, r.B, r.E, 'Not Started', { due: iso(r.C), dependencies: r.D, criteria: r.F, actual: r.H, notes: r.I }, r, 'Milestones')),
  ...sheet('RAID').map(r => item('risk', r.A, r.B, r.G, r.H, { type: 'Risk', category: r.C, likelihood: r.D, impact: r.E, mitigation: r.F, dependencies: r.I }, r, 'RAID')),
  ...sheet('Decision Log').map(r => item('decision', r.A, r.C, r.F, r.H, { raised: r.B, options: r.D, outcome: r.E, authority: r.F, due: r.G, evidence: r.I }, r, 'Decision Log')),
  ...sheet('Budget').map((r, i) => item('budget', `B${String(i + 1).padStart(2, '0')}`, r.B, r.G, 'Awaiting quotes', { category: r.A, quoteBasis: r.C, estimate: r.D, approved: r.E, actual: r.F, timing: r.H, notes: r.I }, r, 'Budget')),
  ...gateNames.map((name, i) => {
    const r = sheet('KPI & Stage Gates', 2).find(x => x.A === `G${i + 1}`);
    return item('gate', `G${i + 1}`, name, r?.E || 'Management · authority to be documented', 'Pending', { due: iso(r?.D), question: questions[i], criteria: r?.F || 'Approved charter, workstream owners, cadence and decision rights.', authority: r?.E || '', conditions: 'Evidence and authorised decision outstanding.' }, r, r ? 'KPI & Stage Gates' : undefined);
  }),
  ...objectiveDefinitions.map(([title, owner, criteria, links], i) => item('objective', `OBJ-${i + 1}`, title, owner, 'Not Started', { criteria, links, notes: i > 4 ? 'Proposed thematic links use workbook content, not Operating Plan workstream numbering. Management confirmation required.' : 'Thematic task links are derived for navigation; not approved remapping.' })),
  item('document', 'DOC-01', 'NxtFi_90_Day_Operating_Plan_v2.docx', 'Founder', 'Working baseline', { category: 'Management reports', version: '2.0', notes: 'Strategic and governance source. Founder working baseline for review; not a signed approval.' }),
  item('document', 'DOC-02', 'NxtFi_90_Day_Execution_Control_Centre_v2.xlsx', 'Founder', 'Imported', { category: 'Management reports', version: '2.0', notes: 'All 13 workbook sheets preserved; blank templates do not represent live records.' }),
  item('document', 'DOC-03', 'NxtFi_Technical_Architecture_Ahmed.pptx', 'Founder', 'Reference only', { category: 'Technology', notes: 'Brand and architecture reference. Prototype registration/status updates demonstrated in deck; no successful payment-execution transaction claimed. Not production readiness or a WBS completion update.' }),
];
export const fields: Record<Kind, Field[]> = {
  task: [['workstream', 'Workbook workstream', 'ws'], ['description', 'Description / acceptance criteria', 'long'], ['support', 'Supporting contributors'], ['priority', 'Priority', 'Critical|High|Medium|Low'], ['start', 'Planned start', 'date'], ['due', 'Planned finish', 'date'], ['dependencies', 'Dependency IDs (semicolon-separated)'], ['deliverable', 'Required deliverable'], ['progress', 'Progress (%)', 'number'], ['actual', 'Actual completion date', 'date'], ['evidence', 'Deliverable / evidence reference'], ['reviewer', 'Deliverable reviewed by'], ['blockers', 'Blockers', 'long']],
  milestone: [['due', 'Original target date', 'date'], ['dependencies', 'Required task IDs'], ['criteria', 'Acceptance evidence', 'long'], ['evidence', 'Evidence reference'], ['actual', 'Actual completion', 'date']],
  gate: [['question', 'Approval question'], ['criteria', 'Mandatory evidence', 'long'], ['conditions', 'Outstanding conditions', 'long'], ['authority', 'Required decision authority'], ['due', 'Workbook target date', 'date'], ['evidence', 'Supporting evidence'], ['recommendation', 'Proposed outcome', 'Pending|Approved|Approved with Conditions|Not Approved|Deferred']],
  risk: [['type', 'RAID type', 'Risk|Assumption|Issue|Dependency'], ['category', 'Category'], ['likelihood', 'Likelihood', 'Low|Medium|High'], ['impact', 'Impact', 'Low|Medium|High'], ['mitigation', 'Dated mitigation action', 'long'], ['due', 'Mitigation due date', 'date'], ['contingency', 'Contingency plan', 'long'], ['trigger', 'Escalation trigger'], ['dependencies', 'Linked task IDs'], ['evidence', 'Evidence reference']],
  decision: [['raised', 'Date raised', 'date'], ['options', 'Options / considerations', 'long'], ['recommendation', 'Recommendation', 'long'], ['financialImpact', 'Financial impact (AED)'], ['regulatoryImpact', 'Regulatory impact', 'long'], ['technicalImpact', 'Technical impact', 'long'], ['authority', 'Required approvers'], ['due', 'Decision due date', 'date'], ['outcome', 'Proposed outcome', 'long'], ['evidence', 'Supporting evidence']],
  change: [['raised', 'Request date', 'date'], ['reason', 'Reason', 'long'], ['scopeImpact', 'Scope impact', 'long'], ['scheduleImpact', 'Schedule impact'], ['budgetImpact', 'Budget impact (AED)', 'number'], ['riskImpact', 'Risk / dependency impact'], ['options', 'Options considered', 'long'], ['recommendation', 'Recommendation', 'long'], ['authority', 'Required approvers'], ['baselineBefore', 'Baseline value before change'], ['baselineProposed', 'Proposed baseline value'], ['evidence', 'Evidence reference']],
  partner: [['category', 'Partner category', 'PSP|Crypto payment|Conversion / liquidity|Banking|Payout|Compliance|Technology|Strategic'], ['contact', 'Contact person'], ['country', 'Country'], ['corridor', 'Target corridor'], ['role', 'Proposed role'], ['stage', 'Relationship stage', 'Identified|Initial Contact|Meeting Scheduled|Discovery|Due Diligence|Technical Evaluation|Commercial Evaluation|Selected|Contracting|Integration|Active|Rejected|On Hold'], ['licence', 'Licence scope evidence reference'], ['permissions', 'Regulatory suitability', 'Unverified|Evidence recorded|Unsuitable'], ['fundsFlow', 'Funds-flow clarity', 'Unverified|Evidence recorded|Unsuitable'], ['fundsEvidence', 'Funds-flow evidence reference'], ['operations', 'Operational capability', 'Unverified|Evidence recorded|Unsuitable'], ['operationsEvidence', 'Operational capability evidence'], ['api', 'API / sandbox readiness', 'number'], ['settlement', 'Settlement & reconciliation', 'number'], ['compliance', 'Compliance controls', 'number'], ['commercial', 'Commercial terms', 'number'], ['supportScore', 'Operational support', 'number'], ['fallback', 'Fallback available'], ['lastContact', 'Last contact', 'date'], ['nextAction', 'Next action'], ['due', 'Next-action date', 'date'], ['notes', 'Diligence notes', 'long']],
  merchant: [['category', 'Business category'], ['country', 'Country'], ['corridor', 'Potential corridor'], ['stage', 'Discovery stage', 'Prospect|Discovery conversation|Expression of interest|Signed pilot commitment'], ['requirements', 'Payment / currency requirements', 'long'], ['volume', 'Expected transaction volume (unverified)'], ['methods', 'Current payment methods'], ['painPoints', 'Merchant pain points', 'long'], ['feedback', 'Discovery feedback', 'long'], ['nextAction', 'Next action'], ['due', 'Next-action date', 'date'], ['evidence', 'Conversation / commitment evidence']],
  budget: [['category', 'Original category'], ['quoteBasis', 'Basis / quote required'], ['estimate', 'Estimated cost (AED)', 'number'], ['quoted', 'Quoted expenditure (AED)', 'number'], ['approved', 'Approved budget (AED) · controlled', 'number'], ['committed', 'Committed expenditure (AED) · controlled', 'number'], ['actual', 'Actual expenditure (AED) · controlled', 'number'], ['forecast', 'Forecast expenditure (AED)', 'number'], ['vendor', 'Vendor'], ['evidence', 'Written quote reference'], ['notes', 'Management notes', 'long']],
  expense: [['budgetLine', 'Budget line ID'], ['vendor', 'Vendor'], ['amount', 'Amount (AED)', 'number'], ['classification', 'Classification', 'Estimate|Quotation|Commitment request|Expense claim'], ['paymentStatus', 'Payment claim (unverified)', 'Not paid|Payment requested|Payment evidence submitted'], ['due', 'Payment / request date', 'date'], ['invoice', 'Invoice / receipt reference'], ['evidence', 'Supporting evidence'], ['approvalReference', 'External approval reference (unverified)']],
  review: [['due', 'Review date', 'date'], ['previous', 'Previous commitments', 'long'], ['achievements', 'Completed deliverables', 'long'], ['outstanding', 'Outstanding / overdue tasks', 'long'], ['risks', 'New risks and blockers', 'long'], ['decisions', 'Decisions required', 'long'], ['regulatory', 'Regulatory updates', 'long'], ['partners', 'Partner updates', 'long'], ['product', 'Product / technology updates', 'long'], ['finance', 'Financial position', 'long'], ['milestones', 'Upcoming milestones', 'long'], ['priorities', 'Next-week commitments', 'long'], ['actionOwner', 'Action owner'], ['actionDue', 'Action deadline', 'date'], ['evidence', 'Minutes / evidence link']],
  document: [['category', 'Category'], ['version', 'Version'], ['dependencies', 'Related task IDs'], ['relatedRecords', 'Related milestone / decision / risk IDs'], ['access', 'Intended permissions (not enforced)'], ['evidence', 'Document URL or file metadata'], ['notes', 'Approval / evidence notes', 'long']],
  objective: [['criteria', 'Strategic success measure', 'long'], ['links', 'Proposed workbook workstream links (comma-separated)'], ['due', 'Target date', 'date'], ['evidence', 'Outcome evidence'], ['notes', 'Management notes', 'long']],
};
export const dependencies = (r: Item) => (r.fields.dependencies || '').split(';').map(v => v.trim()).filter(Boolean);
export function relationAudit(items: Item[]) {
  const tasks = items.filter(r => r.kind === 'task');
  const byId = new Map(tasks.map(r => [r.id, r]));
  const missing = tasks.flatMap(r => dependencies(r).filter(d => !byId.has(d)).map(d => `${r.id} → ${d}`));
  const cycles = new Set<string>();
  const walk = (id: string, path: string[]) => {
    if (path.includes(id)) { cycles.add([...path.slice(path.indexOf(id))].sort().join(' ↔ ')); return; }
    dependencies(byId.get(id) || { fields: {} } as Item).forEach(d => walk(d, [...path, id]));
  };
  tasks.forEach(r => walk(r.id, []));
  const overlaps = tasks.flatMap(r => dependencies(r).filter(d => byId.has(d) && byId.get(d)!.fields.due > r.fields.start).map(d => `${r.id} starts ${r.fields.start} before ${d} finishes ${byId.get(d)!.fields.due}`));
  const milestoneConflicts = items.filter(r => r.kind === 'milestone').flatMap(r => dependencies(r).filter(d => byId.has(d) && byId.get(d)!.fields.due > r.fields.due).map(d => `${r.id} targets ${r.fields.due} before ${d} finishes ${byId.get(d)!.fields.due}`));
  return { missing, cycles: [...cycles], overlaps, milestoneConflicts };
}
export const audit = relationAudit(initial);
export const exceptions = [
  ['VAL-01', 'Workstream mapping conflict', 'Operating Plan WS08–WS11 and workbook task themes diverge. Both labels are displayed; no IDs or assignments have been remapped.'],
  ['VAL-02', 'Duration inconsistency', '23 Nov 2026–23 Feb 2027 spans 92 elapsed days, although both sources call it a 90-day plan. Original dates retained.'],
  ['VAL-03', 'G1 is absent from workbook', 'Foundation is required by the plan. G1 is shown pending with no invented target date or approval.'],
  ['VAL-04', 'Joint accountability requires acceptance', 'RACI includes joint A / A-R assignments. Document joint acceptance or nominate one accountable owner; do not infer Mr Ahmad’s appointment.'],
  ['VAL-05', 'Unresolved dependency', audit.missing.join('; ')],
  ['VAL-06', 'Circular dependencies', audit.cycles.join('; ')],
  ['VAL-07', 'Dependency timing semantics unconfirmed', `${audit.overlaps.length} relationships overlap if interpreted as finish-to-start. The workbook does not specify dependency types. Dates are preserved; management must confirm sequencing.`],
  ['VAL-08', 'Missing operational actuals', 'No budget amounts, partner records, weekly reviews or change requests supplied. Risk mitigation dates, evidence and actual completions require input.'],
  ['VAL-09', 'Technical deck evidence boundary', 'Slide 5 explicitly disclaims successful payment execution; slide 6 includes a token-execution checkmark. Treat capability as unverified, not completed payment evidence.'],
  ['VAL-10', 'Milestone sequencing conflict', `${audit.milestoneConflicts.length} milestone targets precede prerequisite task finishes: ${audit.milestoneConflicts.join('; ')}. Preserve both dates pending change control.`],
];
export function partnerScore(r: Item) {
  const weights: [string, number][] = [['api', 20], ['settlement', 25], ['compliance', 25], ['commercial', 15], ['supportScore', 15]];
  const populated = weights.every(([key]) => r.fields[key] !== undefined && r.fields[key] !== '');
  const score = populated ? Math.round(weights.reduce((sum, [key, weight]) => sum + Math.max(0, Math.min(5, Number(r.fields[key]) || 0)) / 5 * weight, 0)) : null;
  const eligible = r.fields.permissions === 'Evidence recorded' && !!r.fields.licence && r.fields.fundsFlow === 'Evidence recorded' && !!r.fields.fundsEvidence && r.fields.operations === 'Evidence recorded' && !!r.fields.operationsEvidence;
  return { score, eligible };
}

---
name: team-report
description: Generate a self-contained HTML report of the current Gander agent team and skill setup. Uses FF7 Remake Intergrade design language — Mako Teal palette, tactical information hierarchy, materia color-coding by agent role. Report includes: executive summary, agent roster with materia-coded role badges, skill inventory, interactive workflow diagram, and drilldown panels for each agent. Output written to docs/team-report.html.
---

# Team Report Skill

## When To Use

Any time you want a visual overview of the current agent team. Also useful after running `agent-improvement` to see the updated roster. Triggers on "generate team report", "show me the team", "team overview", "agent roster".

## Procedure

You are executing this skill in the main session. Generate the HTML report by following these steps.

### Step 1 — Collect agent data

Read every file matching `.claude/agents/*.md`. For each, extract from the YAML frontmatter:
- `name`
- `description`
- `tools`
- `model`
- `version` (if present; default "1.0.0")

Also read the first H2 heading body paragraph from the file body (the first sentence after the opening `## ` heading) — this becomes the agent's "role summary" in the report.

### Step 2 — Collect skill data

Read every file matching `.claude/skills/*/SKILL.md`. For each, extract:
- `name` (frontmatter)
- `description` (frontmatter)
- The content under `## When To Use` (first paragraph only)

### Step 3 — Generate the HTML

Write the complete HTML document below (with the collected data substituted in) to `docs/team-report.html`.

The HTML must be fully self-contained (no external network requests for fonts or scripts — embed everything inline).

### Step 4 — Report to human

Tell the human: "Team report generated → `docs/team-report.html`" and nothing else.

---

## HTML Template

When generating the file, replace every `{{AGENT_DATA_JSON}}` and `{{SKILL_DATA_JSON}}` placeholder with the actual JSON arrays you collected in Steps 1–2.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GANDER // TACTICAL TEAM OVERVIEW</title>
<style>
  /* ── Reset ─────────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Design Tokens (FF7R Intergrade palette) ────────── */
  :root {
    --mako-teal:      #5499b5;
    --mako-teal-dim:  #3a6f8a;
    --deep-green:     #165241;
    --deep-green-dim: #0e3a2f;
    --void:           #070d0c;
    --surface:        #0d1a18;
    --surface-mid:    #122420;
    --surface-hi:     #1a3530;
    --border:         rgba(84,153,181,0.25);
    --border-bright:  rgba(84,153,181,0.55);
    --white:          #ffffff;
    --white-dim:      rgba(255,255,255,0.72);
    --white-muted:    rgba(255,255,255,0.38);
    --red:            #a12d2d;
    --red-bright:     #cf3c3c;

    /* Materia colours */
    --materia-green:  #4caf7d;
    --materia-yellow: #e8c840;
    --materia-blue:   #4a90d9;
    --materia-purple: #9b59b6;
    --materia-red:    #e74c3c;

    --font-header: Optima, "Palatino Linotype", serif;
    --font-body:   "Segoe UI", system-ui, -apple-system, sans-serif;
    --font-mono:   "Courier New", monospace;

    --radius:   4px;
    --radius-lg: 8px;
    --glow-teal: 0 0 12px rgba(84,153,181,0.4);
    --glow-green: 0 0 16px rgba(22,82,65,0.6);
  }

  /* ── Base ───────────────────────────────────────────── */
  body {
    background: var(--void);
    color: var(--white);
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.55;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Scanline overlay ───────────────────────────────── */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.07) 2px,
      rgba(0,0,0,0.07) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }

  /* ── Layout shell ───────────────────────────────────── */
  .shell {
    display: grid;
    grid-template-columns: 260px 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "header header"
      "nav    main";
    min-height: 100vh;
  }

  /* ── Header ─────────────────────────────────────────── */
  header {
    grid-area: header;
    background: linear-gradient(90deg, var(--deep-green) 0%, var(--surface) 60%, var(--void) 100%);
    border-bottom: 1px solid var(--border-bright);
    padding: 18px 32px;
    display: flex;
    align-items: center;
    gap: 24px;
    box-shadow: var(--glow-green);
  }

  .header-emblem {
    width: 48px;
    height: 48px;
    border: 2px solid var(--mako-teal);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--glow-teal);
    flex-shrink: 0;
  }

  .header-emblem svg { width: 28px; height: 28px; }

  .header-text h1 {
    font-family: var(--font-header);
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 0.12em;
    color: var(--white);
    text-shadow: 0 0 8px rgba(84,153,181,0.5);
  }

  .header-text p {
    font-size: 11px;
    letter-spacing: 0.2em;
    color: var(--mako-teal);
    text-transform: uppercase;
    margin-top: 2px;
  }

  .header-meta {
    margin-left: auto;
    text-align: right;
    font-size: 11px;
    color: var(--white-muted);
    letter-spacing: 0.08em;
  }

  .header-meta .ts {
    color: var(--mako-teal);
    font-family: var(--font-mono);
    font-size: 12px;
  }

  /* ── Left Nav ───────────────────────────────────────── */
  nav {
    grid-area: nav;
    background: linear-gradient(180deg, var(--surface) 0%, var(--void) 100%);
    border-right: 1px solid var(--border);
    padding: 24px 0;
    overflow-y: auto;
    position: sticky;
    top: 0;
    height: 100vh;
  }

  .nav-section-label {
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--white-muted);
    padding: 0 20px 8px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 8px;
  }

  .nav-section { margin-bottom: 24px; }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 20px;
    cursor: pointer;
    border-left: 2px solid transparent;
    transition: all 0.18s ease;
    color: var(--white-dim);
    font-size: 13px;
    text-decoration: none;
  }

  .nav-item:hover,
  .nav-item.active {
    background: rgba(84,153,181,0.08);
    border-left-color: var(--mako-teal);
    color: var(--white);
  }

  .nav-item.active { background: rgba(84,153,181,0.14); }

  .materia-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 6px currentColor;
  }

  /* ── Main ───────────────────────────────────────────── */
  main {
    grid-area: main;
    padding: 32px;
    overflow-y: auto;
  }

  /* ── Section headers ────────────────────────────────── */
  .section-title {
    font-family: var(--font-header);
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 0.1em;
    color: var(--white);
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .section-title::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 20px;
    background: var(--mako-teal);
    border-radius: 2px;
    box-shadow: var(--glow-teal);
  }

  /* ── Stat bar (summary) ─────────────────────────────── */
  .stat-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 36px;
  }

  .stat-card {
    background: linear-gradient(135deg, var(--surface-mid), var(--surface));
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    position: relative;
    overflow: hidden;
  }

  .stat-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--mako-teal), transparent);
  }

  .stat-card .stat-value {
    font-family: var(--font-header);
    font-size: 36px;
    font-weight: 500;
    color: var(--mako-teal);
    text-shadow: var(--glow-teal);
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-card .stat-label {
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--white-muted);
  }

  /* ── Workflow diagram ───────────────────────────────── */
  .workflow {
    background: var(--surface-mid);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    margin-bottom: 36px;
    overflow-x: auto;
  }

  .flow-row {
    display: flex;
    align-items: center;
    gap: 0;
    flex-wrap: nowrap;
    justify-content: center;
    margin-bottom: 12px;
  }

  .flow-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .flow-box {
    padding: 8px 14px;
    border-radius: var(--radius);
    border: 1px solid;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
    transition: box-shadow 0.18s;
  }

  .flow-box:hover { box-shadow: 0 0 16px currentColor; }

  .flow-label {
    font-size: 10px;
    color: var(--white-muted);
    letter-spacing: 0.08em;
    text-align: center;
  }

  .flow-arrow {
    padding: 0 8px;
    color: var(--mako-teal-dim);
    font-size: 18px;
    flex-shrink: 0;
    align-self: center;
    margin-bottom: 14px;
  }

  /* ── Agent grid ─────────────────────────────────────── */
  .agent-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    margin-bottom: 36px;
  }

  /* ── Agent card ─────────────────────────────────────── */
  .agent-card {
    background: linear-gradient(145deg, var(--surface-mid), var(--surface));
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
    position: relative;
  }

  .agent-card:hover {
    border-color: var(--border-bright);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.5), var(--glow-teal);
  }

  .agent-card-header {
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--border);
  }

  .agent-materia {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: 0 0 10px currentColor;
    border: 1.5px solid rgba(255,255,255,0.3);
  }

  .agent-name {
    font-family: var(--font-header);
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.06em;
    color: var(--white);
    flex: 1;
  }

  .agent-code {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--white-muted);
    background: rgba(0,0,0,0.3);
    padding: 2px 6px;
    border-radius: 3px;
    letter-spacing: 0.1em;
  }

  .agent-card-body {
    padding: 14px 18px;
  }

  .agent-desc {
    color: var(--white-dim);
    font-size: 12.5px;
    line-height: 1.5;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .agent-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .tag {
    font-size: 10px;
    letter-spacing: 0.1em;
    padding: 2px 8px;
    border-radius: 3px;
    text-transform: uppercase;
    font-weight: 600;
  }

  .tag-model {
    background: rgba(84,153,181,0.15);
    color: var(--mako-teal);
    border: 1px solid rgba(84,153,181,0.3);
  }

  .tag-output {
    background: rgba(22,82,65,0.3);
    color: #7ecfb0;
    border: 1px solid rgba(22,82,65,0.5);
  }

  /* ── Drilldown panel ────────────────────────────────── */
  .drilldown {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(7,13,12,0.85);
    z-index: 1000;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  }

  .drilldown.open { display: flex; }

  .drilldown-panel {
    background: linear-gradient(145deg, var(--surface-hi), var(--surface));
    border: 1px solid var(--border-bright);
    border-radius: var(--radius-lg);
    width: min(780px, 92vw);
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 0 60px rgba(84,153,181,0.2), 0 24px 64px rgba(0,0,0,0.8);
    animation: slideIn 0.22s ease;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }

  .drilldown-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 14px;
    position: sticky;
    top: 0;
    background: var(--surface-hi);
    z-index: 1;
  }

  .drilldown-close {
    margin-left: auto;
    background: none;
    border: 1px solid var(--border);
    color: var(--white-muted);
    padding: 4px 12px;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 12px;
    transition: all 0.15s;
  }

  .drilldown-close:hover {
    border-color: var(--red-bright);
    color: var(--red-bright);
  }

  .drilldown-body {
    padding: 24px;
  }

  .detail-section {
    margin-bottom: 20px;
  }

  .detail-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--mako-teal);
    margin-bottom: 6px;
  }

  .detail-value {
    color: var(--white-dim);
    font-size: 13px;
    line-height: 1.6;
  }

  .tools-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tool-chip {
    background: rgba(84,153,181,0.1);
    border: 1px solid rgba(84,153,181,0.2);
    color: var(--mako-teal);
    font-size: 11px;
    font-family: var(--font-mono);
    padding: 3px 8px;
    border-radius: 3px;
  }

  /* ── Skill grid ─────────────────────────────────────── */
  .skill-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px;
    margin-bottom: 36px;
  }

  .skill-card {
    background: linear-gradient(145deg, var(--surface-mid), var(--surface));
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .skill-card:hover {
    border-color: rgba(22,82,65,0.8);
    box-shadow: 0 0 20px rgba(22,82,65,0.3);
  }

  .skill-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 3px; height: 100%;
    background: var(--deep-green);
  }

  .skill-name {
    font-family: var(--font-header);
    font-size: 14px;
    font-weight: 500;
    color: var(--white);
    margin-bottom: 6px;
    letter-spacing: 0.05em;
  }

  .skill-desc {
    color: var(--white-muted);
    font-size: 12px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── Scrollbar ──────────────────────────────────────── */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--void); }
  ::-webkit-scrollbar-thumb { background: var(--mako-teal-dim); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--mako-teal); }

  /* ── Utility ────────────────────────────────────────── */
  section { margin-bottom: 48px; }
  .divider { border: none; border-top: 1px solid var(--border); margin: 32px 0; }
</style>
</head>
<body>
<div class="shell">

<!-- ════ HEADER ════ -->
<header>
  <div class="header-emblem">
    <svg viewBox="0 0 32 32" fill="none" stroke="#5499b5" stroke-width="1.5">
      <polygon points="16,3 29,10 29,22 16,29 3,22 3,10" />
      <circle cx="16" cy="16" r="5" fill="#5499b5" opacity="0.6"/>
      <line x1="16" y1="3" x2="16" y2="11"/>
      <line x1="29" y1="10" x2="22" y2="14"/>
      <line x1="29" y1="22" x2="22" y2="18"/>
      <line x1="16" y1="29" x2="16" y2="21"/>
      <line x1="3" y1="22" x2="10" y2="18"/>
      <line x1="3" y1="10" x2="10" y2="14"/>
    </svg>
  </div>
  <div class="header-text">
    <h1>GANDER // TACTICAL TEAM OVERVIEW</h1>
    <p>Autonomous Agent Team · Operational Manifest</p>
  </div>
  <div class="header-meta">
    <div>CLASSIFICATION: INTERNAL</div>
    <div class="ts" id="timestamp"></div>
  </div>
</header>

<!-- ════ NAV ════ -->
<nav>
  <div class="nav-section">
    <div class="nav-section-label">Overview</div>
    <a class="nav-item active" href="#summary" onclick="scrollTo('summary')">
      <span class="materia-dot" style="color:var(--mako-teal);background:var(--mako-teal)"></span>
      Summary
    </a>
    <a class="nav-item" href="#workflow" onclick="scrollTo('workflow')">
      <span class="materia-dot" style="color:var(--materia-yellow);background:var(--materia-yellow)"></span>
      Workflow
    </a>
  </div>
  <div class="nav-section">
    <div class="nav-section-label">Agents</div>
    <div id="nav-agents"></div>
  </div>
  <div class="nav-section">
    <div class="nav-section-label">Skills</div>
    <div id="nav-skills"></div>
  </div>
</nav>

<!-- ════ MAIN ════ -->
<main>

  <!-- Summary -->
  <section id="summary">
    <div class="section-title">Operational Summary</div>
    <div class="stat-bar" id="stat-bar"></div>
  </section>

  <!-- Workflow -->
  <section id="workflow">
    <div class="section-title">Delivery Workflow</div>
    <div class="workflow">
      <div class="flow-row" id="flow-row-1"></div>
      <div class="flow-row" id="flow-row-2"></div>
    </div>
  </section>

  <!-- Agents -->
  <section id="agents">
    <div class="section-title">Agent Roster</div>
    <div class="agent-grid" id="agent-grid"></div>
  </section>

  <!-- Skills -->
  <section id="skills">
    <div class="section-title">Skill Inventory</div>
    <div class="skill-grid" id="skill-grid"></div>
  </section>

</main>
</div>

<!-- ════ DRILLDOWN PANEL ════ -->
<div class="drilldown" id="drilldown" onclick="closeDrilldown(event)">
  <div class="drilldown-panel">
    <div class="drilldown-header" id="drilldown-header">
      <div class="agent-materia" id="dd-materia"></div>
      <div>
        <div id="dd-name" style="font-family:var(--font-header);font-size:18px;letter-spacing:0.08em"></div>
        <div id="dd-code" style="font-size:11px;color:var(--white-muted);margin-top:2px"></div>
      </div>
      <button class="drilldown-close" onclick="document.getElementById('drilldown').classList.remove('open')">[ CLOSE ]</button>
    </div>
    <div class="drilldown-body" id="drilldown-body"></div>
  </div>
</div>

<script>
// ══════════════════════════════════════════════
// DATA (injected by skill)
// ══════════════════════════════════════════════
const AGENTS = {{AGENT_DATA_JSON}};
const SKILLS = {{SKILL_DATA_JSON}};

// ══════════════════════════════════════════════
// MATERIA CLASSIFICATION
// Role → materia color
// ══════════════════════════════════════════════
const MATERIA_MAP = {
  'orchestrator':       { color: '#e8c840', label: 'PM',  role: 'Command' },
  'project-manager':    { color: '#e8c840', label: 'PM',  role: 'Planning' },
  'critic':             { color: '#e74c3c', label: 'CR',  role: 'Gate' },
  'backend-engineer':   { color: '#4caf7d', label: 'BE',  role: 'Implementation' },
  'frontend-engineer':  { color: '#4caf7d', label: 'FE',  role: 'Implementation' },
  'db-specialist':      { color: '#4caf7d', label: 'DS',  role: 'Implementation' },
  'ui-designer':        { color: '#9b59b6', label: 'UI',  role: 'Design' },
  'code-auditor':       { color: '#e74c3c', label: 'AUD', role: 'Verification' },
  'archivist':          { color: '#4a90d9', label: 'AR',  role: 'Memory' },
  'researcher':         { color: '#4a90d9', label: 'RA',  role: 'Research' },
  'statistician':       { color: '#4a90d9', label: 'ST',  role: 'Analysis' },
  'dispatcher':         { color: '#9b59b6', label: 'MA',  role: 'Routing' },
  'system-health-monitor': { color: '#9b59b6', label: 'HR', role: 'Meta' },
};

function getMat(name) {
  return MATERIA_MAP[name] || { color: '#5499b5', label: '??', role: 'Support' };
}

// ══════════════════════════════════════════════
// TIMESTAMP
// ══════════════════════════════════════════════
document.getElementById('timestamp').textContent =
  new Date().toISOString().replace('T',' ').split('.')[0] + ' UTC';

// ══════════════════════════════════════════════
// STATS BAR
// ══════════════════════════════════════════════
const models = AGENTS.map(a => a.model);
const opusCount  = models.filter(m => m && m.includes('opus')).length;
const sonnetCount = models.filter(m => m && m.includes('sonnet') && !m.includes('opus')).length;
const haikuCount  = models.filter(m => m && m.includes('haiku')).length;

const stats = [
  { value: AGENTS.length,  label: 'Active Agents' },
  { value: SKILLS.length,  label: 'Skills Loaded' },
  { value: opusCount,      label: 'Opus Instances' },
  { value: sonnetCount + haikuCount, label: 'Sonnet / Haiku' },
];

document.getElementById('stat-bar').innerHTML = stats.map(s => `
  <div class="stat-card">
    <div class="stat-value">${s.value}</div>
    <div class="stat-label">${s.label}</div>
  </div>`).join('');

// ══════════════════════════════════════════════
// NAV
// ══════════════════════════════════════════════
const navAgents = document.getElementById('nav-agents');
AGENTS.forEach((a, i) => {
  const mat = getMat(a.name);
  navAgents.innerHTML += `
    <a class="nav-item" href="#agent-${i}" onclick="openDrilldown(${i})">
      <span class="materia-dot" style="color:${mat.color};background:${mat.color}"></span>
      ${a.name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
    </a>`;
});

const navSkills = document.getElementById('nav-skills');
SKILLS.forEach((s, i) => {
  navSkills.innerHTML += `
    <a class="nav-item" href="#skill-${i}">
      <span class="materia-dot" style="color:var(--deep-green);background:#4caf7d;opacity:0.7"></span>
      ${s.name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
    </a>`;
});

// ══════════════════════════════════════════════
// WORKFLOW DIAGRAM
// ══════════════════════════════════════════════
const flowRow1 = document.getElementById('flow-row-1');
const flowRow2 = document.getElementById('flow-row-2');

function makeFlowNode(label, sublabel, color, agentIdx) {
  const node = document.createElement('div');
  node.className = 'flow-node';
  const clickAttr = agentIdx !== undefined ? `onclick="openDrilldown(${agentIdx})"` : '';
  node.innerHTML = `
    <div class="flow-box" style="color:${color};border-color:${color};background:${color}1a" ${clickAttr}>
      ${label}
    </div>
    <div class="flow-label">${sublabel}</div>`;
  return node;
}

function makeArrow() {
  const a = document.createElement('div');
  a.className = 'flow-arrow';
  a.textContent = '→';
  return a;
}

// Helper: find agent index by name substring
function findAgent(substr) {
  return AGENTS.findIndex(a => a.name.includes(substr));
}

// Row 1: Human → Orchestrator → PM → Critic → assign-agents → Implement
const row1 = [
  { label: 'HUMAN',       sub: 'L0',          color: '#ffffff',              idx: undefined },
  { label: 'ORCHESTRATOR',sub: 'L1 · Command', color: '#e8c840',              idx: findAgent('orchestrator') },
  { label: 'PM',          sub: 'L1.1 · Plan',  color: '#e8c840',              idx: findAgent('project-manager') },
  { label: 'CRITIC',      sub: 'Plan Gate',    color: '#e74c3c',              idx: findAgent('critic') },
  { label: 'BE / FE / DS',sub: 'Implement',    color: '#4caf7d',              idx: findAgent('backend') },
];
row1.forEach((n, i) => {
  flowRow1.appendChild(makeFlowNode(n.label, n.sub, n.color, n.idx));
  if (i < row1.length - 1) flowRow1.appendChild(makeArrow());
});

// Row 2 (continuation): Auditor → Archivist → Orchestrator → Human
const row2 = [
  { label: 'AUDITOR',     sub: 'SA·QA·SX Gate', color: '#e74c3c',            idx: findAgent('auditor') },
  { label: 'ARCHIVIST',   sub: 'Log & Memory',   color: '#4a90d9',            idx: findAgent('archivist') },
  { label: 'ORCHESTRATOR',sub: 'Report',          color: '#e8c840',            idx: findAgent('orchestrator') },
  { label: 'HUMAN',       sub: 'L0 · Confirm',   color: '#ffffff',             idx: undefined },
];
// Pad left to align with "BE/FE/DS"
const padFlow = document.createElement('div');
padFlow.style.cssText = 'flex:1;max-width:580px';
flowRow2.appendChild(padFlow);
row2.forEach((n, i) => {
  flowRow2.appendChild(makeFlowNode(n.label, n.sub, n.color, n.idx));
  if (i < row2.length - 1) flowRow2.appendChild(makeArrow());
});

// ══════════════════════════════════════════════
// AGENT CARDS
// ══════════════════════════════════════════════
const agentGrid = document.getElementById('agent-grid');
AGENTS.forEach((agent, i) => {
  const mat = getMat(agent.name);
  const modelTag = agent.model || 'sonnet';
  const card = document.createElement('div');
  card.className = 'agent-card';
  card.id = `agent-${i}`;
  card.onclick = () => openDrilldown(i);
  card.innerHTML = `
    <div class="agent-card-header">
      <div class="agent-materia" style="background:${mat.color}22;color:${mat.color};border-color:${mat.color}55">
        ${mat.label}
      </div>
      <div class="agent-name">${agent.name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>
      <div class="agent-code">${mat.role.toUpperCase()}</div>
    </div>
    <div class="agent-card-body">
      <div class="agent-desc">${agent.description || ''}</div>
      <div class="agent-meta">
        <span class="tag tag-model">⬡ ${modelTag}</span>
        ${agent.outputTag ? `<span class="tag tag-output">${agent.outputTag}</span>` : ''}
      </div>
    </div>`;
  agentGrid.appendChild(card);
});

// ══════════════════════════════════════════════
// SKILL CARDS
// ══════════════════════════════════════════════
const skillGrid = document.getElementById('skill-grid');
SKILLS.forEach((skill, i) => {
  const card = document.createElement('div');
  card.className = 'skill-card';
  card.id = `skill-${i}`;
  card.innerHTML = `
    <div class="skill-name">/ ${skill.name.toUpperCase().replace(/-/g,'-')}</div>
    <div class="skill-desc">${skill.description || ''}</div>`;
  skillGrid.appendChild(card);
});

// ══════════════════════════════════════════════
// DRILLDOWN
// ══════════════════════════════════════════════
function openDrilldown(idx) {
  const agent = AGENTS[idx];
  const mat = getMat(agent.name);

  document.getElementById('dd-materia').textContent = mat.label;
  document.getElementById('dd-materia').style.cssText =
    `background:${mat.color}22;color:${mat.color};border-color:${mat.color}55;` +
    `width:40px;height:40px;border-radius:50%;display:flex;align-items:center;` +
    `justify-content:center;font-size:13px;font-weight:700;border:1.5px solid;` +
    `box-shadow:0 0 12px ${mat.color}88;flex-shrink:0`;
  document.getElementById('dd-name').textContent =
    agent.name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  document.getElementById('dd-code').textContent =
    `ROLE: ${mat.role.toUpperCase()} · MODEL: ${agent.model || 'sonnet'}`;

  const tools = (agent.tools || '').split(',').map(t => t.trim()).filter(Boolean);

  document.getElementById('drilldown-body').innerHTML = `
    <div class="detail-section">
      <div class="detail-label">Mission</div>
      <div class="detail-value">${agent.description || '—'}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">Summary</div>
      <div class="detail-value">${agent.summary || '—'}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">Authorized Tools</div>
      <div class="tools-list">
        ${tools.map(t => `<span class="tool-chip">${t}</span>`).join('') || '<span style="color:var(--white-muted)">none</span>'}
      </div>
    </div>
    <div class="detail-section">
      <div class="detail-label">Model</div>
      <div class="detail-value" style="color:var(--mako-teal);font-family:var(--font-mono)">${agent.model || 'sonnet'}</div>
    </div>
    ${agent.version ? `<div class="detail-section">
      <div class="detail-label">Version</div>
      <div class="detail-value" style="font-family:var(--font-mono)">v${agent.version}</div>
    </div>` : ''}`;

  document.getElementById('drilldown').classList.add('open');
}

function closeDrilldown(e) {
  if (e.target.id === 'drilldown') {
    document.getElementById('drilldown').classList.remove('open');
  }
}

// Keyboard close
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.getElementById('drilldown').classList.remove('open');
});
</script>
</body>
</html>
```

---

## Execution Instructions

When this skill is invoked, you (the main session) must:

1. **Read all agent files** with `Glob` pattern `.claude/agents/*.md`, then `Read` each file.
2. **Parse each agent file:**
   - Extract YAML frontmatter fields: `name`, `description`, `tools`, `model`, `version`
   - Extract first sentence of the first body paragraph (after the opening `---` block ends) as `summary`
   - Infer `outputTag` from the description (look for phrases like "Outputs a `completion_packet`" → value is `completion_packet`)
3. **Read all skill files** with `Glob` pattern `.claude/skills/*/SKILL.md`, then `Read` each.
4. **Parse each skill file:** extract `name`, `description` from frontmatter.
5. **Build two JSON arrays:**
   - `AGENT_DATA_JSON` — array of objects: `{ name, description, tools, model, version, summary, outputTag }`
   - `SKILL_DATA_JSON` — array of objects: `{ name, description }`
6. **Substitute** `{{AGENT_DATA_JSON}}` and `{{SKILL_DATA_JSON}}` in the HTML template above with the actual JSON.
7. **Write** the complete HTML to `docs/team-report.html` (create the `docs/` directory if it does not exist).
8. **Confirm** to the human: `Team report generated → docs/team-report.html`

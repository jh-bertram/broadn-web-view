<project_conventions>
  <package_manager>not found</package_manager>
  <language>Python (preprocessor: scripts/preprocess_data.py), HTML/JavaScript (frontend: index.html — vanilla JS, no framework)</language>
  <typescript_strict>not found</typescript_strict>
  <test_runner>not found</test_runner>
  <test_command>not found</test_command>
  <lint_command>not found</lint_command>
  <typecheck_command>not found</typecheck_command>
  <build_command>python3 scripts/preprocess_data.py (regenerates data/data.json from Bdb-317.xlsx)</build_command>
  <dev_command>not found — static HTML; open index.html directly in a browser or serve with any static file server (e.g. python3 -m http.server)</dev_command>
  <build_system>not found</build_system>
  <monorepo>false</monorepo>
  <monorepo_tool>not found</monorepo_tool>
  <workspaces>
    <none/>
  </workspaces>
  <key_directories>
    <dir>data/ — data.json (generated), sites.json (static site metadata)</dir>
    <dir>scripts/ — preprocess_data.py (Python data aggregator)</dir>
    <dir>docs/ — event logs, agent logs, post-mortems, task registry, project log</dir>
    <dir>.claude/ — agent specs, skills, rules, hooks, evals</dir>
  </key_directories>
  <all_scripts>
    <none/>
  </all_scripts>
  <note>
    No build system, no package.json, no lock files. This is a configuration-only orchestration repo.
    The deliverable is index.html (self-contained SPA) + scripts/preprocess_data.py.
    External libraries loaded via CDN in index.html: Tailwind CSS, Chart.js, Leaflet.
    Python dependencies: pandas, openpyxl (assumed installed in environment).
    To regenerate data: python3 scripts/preprocess_data.py
    To view dashboard: open index.html in browser (or serve statically).
    All implementing agents should edit index.html and/or scripts/preprocess_data.py directly.
    No compilation, transpilation, or bundling step required.
  </note>
</project_conventions>

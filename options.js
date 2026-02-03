const els = {
  wrap: document.getElementById("wrap"),
  msg: document.getElementById("msg"),
  refreshBtn: document.getElementById("refreshBtn"),
  exportBtn: document.getElementById("exportBtn"),
  clearBtn: document.getElementById("clearBtn"),
  q: document.getElementById("q"),
  source: document.getElementById("source"),
  status: document.getElementById("status"),
};

function esc(s) {
  return String(s || "").replace(/[&<>"]/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;" }[c]));
}

function render(apps) {
  if (!apps.length) {
    els.wrap.innerHTML = '<div class="empty">No applications saved yet. Use the side panel to save one.</div>';
    return;
  }

  const rows = apps.map(a => `
    <tr>
      <td><strong>${esc(a.roleTitle)}</strong><div class="muted">${esc(a.location)}</div></td>
      <td>${esc(a.company)}</td>
      <td>${esc(a.status)}</td>
      <td>${esc(a.source)}</td>
      <td>${esc(a.appliedDate || "")}</td>
      <td><a href="${esc(a.jobUrl)}" target="_blank" rel="noreferrer">open</a></td>
    </tr>
  `).join("");

  els.wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Role</th><th>Company</th><th>Status</th><th>Source</th><th>Applied</th><th>Link</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function filterApps(apps) {
  const q = (els.q.value || "").toLowerCase().trim();
  const s = els.source.value || "";
  const st = els.status.value || "";
  return apps.filter(a => {
    if (s && a.source !== s) return false;
    if (st && a.status !== st) return false;
    if (!q) return true;
    const blob = [a.roleTitle, a.company, a.location, a.notes, a.source, a.status].join(" ").toLowerCase();
    return blob.includes(q);
  });
}

function toCSV(apps) {
  const cols = ["roleTitle","company","status","source","location","appliedDate","jobUrl","notes","updatedAt"];
  const header = cols.join(",");
  const lines = apps.map(a => cols.map(c => `"${String(a[c] || "").replace(/"/g,'""')}"`).join(","));
  return [header, ...lines].join("\n");
}

function download(filename, text) {
  const blob = new Blob([text], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function refresh() {
  const apps = await loadApps();
  const filtered = filterApps(apps);
  render(filtered);
  els.msg.textContent = `${filtered.length} shown • ${apps.length} total`;
}

async function exportCSV() {
  const apps = await loadApps();
  const filtered = filterApps(apps);
  const stamp = new Date().toISOString().slice(0,10);
  download(`job-tracker-${stamp}.csv`, toCSV(filtered));
}

async function clearAll() {
  await chrome.storage.local.remove("jt_apps_v1");
  await refresh();
}

els.refreshBtn.addEventListener("click", refresh);
els.exportBtn.addEventListener("click", exportCSV);
els.clearBtn.addEventListener("click", clearAll);

els.q.addEventListener("input", refresh);
els.source.addEventListener("change", refresh);
els.status.addEventListener("change", refresh);

refresh();
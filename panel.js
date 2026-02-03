const els = {
  source: document.getElementById("source"),
  status: document.getElementById("status"),
  roleTitle: document.getElementById("roleTitle"),
  company: document.getElementById("company"),
  jobUrl: document.getElementById("jobUrl"),
  location: document.getElementById("location"),
  appliedDate: document.getElementById("appliedDate"),
  notes: document.getElementById("notes"),
  saveBtn: document.getElementById("saveBtn"),
  msg: document.getElementById("msg"),
  openDash: document.getElementById("openDash"),
};

function setMsg(text, kind="ok") {
  els.msg.textContent = text;
  els.msg.className = "msg " + (kind === "ok" ? "ok" : "err");
}

function todayISODate() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

async function autofillFromActiveTab() {
  const res = await chrome.runtime.sendMessage({ type: "GET_ACTIVE_TAB_CONTEXT" });
  if (!res?.ok) return;

  const draft = res.draft;
  if (draft) {
    if (draft.source) els.source.value = draft.source;
    if (draft.roleTitle) els.roleTitle.value = draft.roleTitle;
    if (draft.company) els.company.value = draft.company;
    if (draft.location) els.location.value = draft.location;
    if (draft.jobUrl) els.jobUrl.value = draft.jobUrl;
  } else if (res.tab?.url) {
    els.jobUrl.value = res.tab.url;
  }

  if (!els.appliedDate.value) els.appliedDate.value = todayISODate();
}

async function onSave() {
  const app = {
    source: els.source.value,
    status: els.status.value,
    roleTitle: els.roleTitle.value,
    company: els.company.value,
    location: els.location.value,
    jobUrl: els.jobUrl.value,
    appliedDate: els.appliedDate.value,
    notes: els.notes.value
  };

  if (!app.roleTitle || !app.jobUrl) {
    setMsg("Role Title and Job URL are required.", "err");
    return;
  }

  await upsertApp(app);
  setMsg("Saved ✅", "ok");
}

async function openDashboard() {
  await chrome.runtime.openOptionsPage();
}

els.saveBtn.addEventListener("click", onSave);
els.openDash.addEventListener("click", (e) => { e.preventDefault(); openDashboard(); });

autofillFromActiveTab();
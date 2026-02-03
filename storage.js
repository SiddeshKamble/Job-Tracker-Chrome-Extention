const APPS_KEY = "jt_apps_v1";

async function loadApps() {
  const res = await chrome.storage.local.get(APPS_KEY);
  return Array.isArray(res[APPS_KEY]) ? res[APPS_KEY] : [];
}

async function saveApps(apps) {
  await chrome.storage.local.set({ [APPS_KEY]: apps });
}

function makeId(app) {
  // stable-ish id for updates
  return (app.jobUrl || "") + "||" + (app.roleTitle || "") + "||" + (app.company || "");
}

async function upsertApp(app) {
  const apps = await loadApps();
  const id = makeId(app);
  const now = new Date().toISOString();

  const normalized = {
    id,
    source: app.source || "Company",
    roleTitle: (app.roleTitle || "").trim(),
    company: (app.company || "").trim(),
    location: (app.location || "").trim(),
    jobUrl: (app.jobUrl || "").trim(),
    status: app.status || "Applied",
    appliedDate: app.appliedDate || now.slice(0,10),
    notes: app.notes || "",
    updatedAt: now,
    createdAt: app.createdAt || now
  };

  const idx = apps.findIndex(a => a.id === id);
  if (idx >= 0) apps[idx] = { ...apps[idx], ...normalized };
  else apps.unshift(normalized);

  await saveApps(apps);
  return normalized;
}
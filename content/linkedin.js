// Minimal LinkedIn job extractor (best effort)
function txt(el) {
  return (el && el.textContent ? el.textContent : "").replace(/\s+/g, " ").trim();
}

function pickFirst(selectors) {
  for (const s of selectors) {
    const el = document.querySelector(s);
    const t = txt(el);
    if (t) return t;
  }
  return "";
}

function extractLinkedIn() {
  // Role title (job view page)
  const roleTitle = pickFirst([
    "h1.top-card-layout__title",
    "h1.jobs-unified-top-card__job-title",
    "h1.t-24.t-bold.inline",
    "h1"
  ]);

  // Company
  const company = pickFirst([
    ".jobs-unified-top-card__company-name a",
    ".jobs-unified-top-card__company-name",
    ".topcard__org-name-link",
    "a.topcard__org-name-link",
    ".job-details-jobs-unified-top-card__company-name a",
    ".job-details-jobs-unified-top-card__company-name"
  ]);

  // Subtitle tokens often contain location separated by bullets
  const subtitle = pickFirst([
    ".jobs-unified-top-card__primary-description",
    ".job-details-jobs-unified-top-card__primary-description-container",
    ".top-card-layout__second-subline"
  ]);

  let location = "";
  if (subtitle) {
    const parts = subtitle.split("·").map(p => p.trim()).filter(Boolean);
    // location usually looks like "City, ST" or "Remote"
    const cand = parts.find(p => /remote|hybrid|onsite/i.test(p) || /,\s*[A-Z]{2}(\b|$)/.test(p));
    if (cand) location = cand;
    else if (parts.length) location = parts[0]; // fallback
  }

  const jobUrl = location.href || window.location.href;

  return {
    source: "LinkedIn",
    roleTitle: roleTitle || document.title,
    company,
    location,
    jobUrl
  };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "EXTRACT_JOB") {
    try {
      // only attempt on jobs pages; otherwise return minimal
      const isJobs = /\/jobs\//.test(location.pathname) || /\/jobs\//.test(location.href);
      const data = isJobs ? extractLinkedIn() : { source: "LinkedIn", roleTitle: document.title, company: "", location: "", jobUrl: location.href };
      sendResponse(data);
    } catch (e) {
      sendResponse({ source: "LinkedIn", roleTitle: document.title, company: "", location: "", jobUrl: location.href });
    }
  }
});
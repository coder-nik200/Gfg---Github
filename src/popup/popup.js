loadState();

const usernameInput = document.getElementById("username");
const repositoryInput = document.getElementById("repository");
const tokenInput = document.getElementById("token");
const connectButton = document.getElementById("connect");
const status = document.getElementById("status");

const formPanel = document.getElementById("formPanel");
const connectedPanel = document.getElementById("connectedPanel");
const repoNameEl = document.getElementById("repoName");
const editConnectionBtn = document.getElementById("editConnection");

const statsRow = document.getElementById("statsRow");
const emptyStats = document.getElementById("emptyStats");
const statTotal = document.getElementById("statTotal");
const statEasy = document.getElementById("statEasy");
const statMedium = document.getElementById("statMedium");
const statHard = document.getElementById("statHard");
const lastSync = document.getElementById("lastSync");
const lastSyncLink = document.getElementById("lastSyncLink");
const lastSyncTime = document.getElementById("lastSyncTime");

// ============================================================================
// STATUS
// ============================================================================

function setStatus(message, type) {
  status.textContent = message;
  status.className = type || "";
}

// ============================================================================
// REPOSITORY HELPERS
// ============================================================================

function repoShortName(url) {
  const match = (url || "").match(/github\.com\/([^/]+\/[^/]+?)(\.git)?\/?$/);

  return match ? match[1] : url || "";
}

// ============================================================================
// TIME HELPERS
// ============================================================================

function timeAgo(timestamp) {
  if (!timestamp) return "";

  const diffMs = Date.now() - timestamp;
  const mins = Math.round(diffMs / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.round(mins / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);

  return `${days}d ago`;
}

// ============================================================================
// CONNECTION UI
// ============================================================================

function renderConnection(github) {
  if (github && github.repository) {
    formPanel.hidden = true;
    connectedPanel.hidden = false;

    repoNameEl.textContent = repoShortName(github.repository);

    usernameInput.value = github.username || "";
    repositoryInput.value = github.repository || "";
  } else {
    formPanel.hidden = false;
    connectedPanel.hidden = true;
  }
}

// ============================================================================
// STATS UI
// ============================================================================

function renderStats(stats) {
  const byDifficulty = (stats && stats.byDifficulty) || {};
  const total = (stats && stats.total) || 0;

  statTotal.textContent = total;
  statEasy.textContent = byDifficulty.Easy || 0;
  statMedium.textContent = byDifficulty.Medium || 0;
  statHard.textContent = byDifficulty.Hard || 0;

  statsRow.hidden = total === 0;
  emptyStats.hidden = total !== 0;

  if (stats && stats.lastProblem) {
    lastSync.hidden = false;

    lastSyncLink.textContent = stats.lastProblem.title || "Untitled problem";

    lastSyncLink.href = stats.lastProblem.url || "#";

    lastSyncTime.textContent = timeAgo(stats.lastProblem.syncedAt);
  } else {
    lastSync.hidden = true;
  }
}

// ============================================================================
// SYNC STATUS UI
// ============================================================================

function renderSyncStatus(syncStatus) {
  if (!syncStatus || !syncStatus.status) {
    return;
  }

  switch (syncStatus.status) {
    case "syncing":
      setStatus(`Syncing ${syncStatus.title || "solution"}…`, "syncing");
      break;

    case "uploaded":
      setStatus(
        `✓ Uploaded ${syncStatus.title || "solution"} to GitHub.`,
        "success",
      );
      break;

    case "updated":
      setStatus(
        `✓ Updated ${syncStatus.title || "solution"} on GitHub.`,
        "success",
      );
      break;

    case "error":
      setStatus(
        syncStatus.error || "Unable to sync solution to GitHub.",
        "error",
      );
      break;

    default:
      setStatus("", "");
      break;
  }
}

// ============================================================================
// LOAD STATE
// ============================================================================

async function loadState() {
  try {
    const data = await chrome.storage.local.get([
      "github",
      "stats",
      "syncStatus",
    ]);

    renderConnection(data.github);

    renderStats(data.stats);

    renderSyncStatus(data.syncStatus);
  } catch {
    setStatus("Unable to load extension state.", "error");
  }
}

// ============================================================================
// EDIT CONNECTION
// ============================================================================

editConnectionBtn.addEventListener("click", () => {
  connectedPanel.hidden = true;
  formPanel.hidden = false;

  setStatus("", "");
});

// ============================================================================
// CONNECT GITHUB
// ============================================================================

connectButton.addEventListener("click", async () => {
  try {
    const username = usernameInput.value.trim();
    const repository = repositoryInput.value.trim();
    const token = tokenInput.value.trim();

    const existing = (await chrome.storage.local.get("github")).github;

    // Let the user update username/repository
    // without re-entering the token every time.
    const finalToken = token || (existing && existing.token) || "";

    if (!username || !repository || !finalToken) {
      setStatus("Please fill in all fields.", "error");
      return;
    }

    connectButton.disabled = true;
    connectButton.textContent = "Connecting…";

    await chrome.storage.local.set({
      github: {
        username,
        repository,
        token: finalToken,
      },
    });

    connectButton.disabled = false;
    connectButton.textContent = "Connect GitHub";

    setStatus("GitHub details saved.", "success");

    tokenInput.value = "";

    renderConnection({
      username,
      repository,
      token: finalToken,
    });
  } catch {
    connectButton.disabled = false;
    connectButton.textContent = "Connect GitHub";

    setStatus("Unable to save GitHub connection.", "error");
  }
});

// ============================================================================
// STORAGE LISTENER
// ============================================================================

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  if (changes.github) {
    renderConnection(changes.github.newValue);
  }

  if (changes.stats) {
    renderStats(changes.stats.newValue);
  }

  if (changes.syncStatus) {
    renderSyncStatus(changes.syncStatus.newValue);
  }
});

// ============================================================================
// INITIALIZE
// ============================================================================

loadState();

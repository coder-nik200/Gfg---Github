/* ---------------------------------------------------------------------- */
/*  UNCHANGED — kept exactly as you had it                                 */
/* ---------------------------------------------------------------------- */

let uploadInProgress = false;

class GitHubSyncError extends Error {
  constructor(message, code = "SYNC_ERROR", context) {
    super(message);
    this.name = "GitHubSyncError";
    this.code = code;
    this.context = context;
  }
}

async function getGitHubConfig() {
  const result = await chrome.storage.local.get("github");
  const github = result.github;

  if (!github) {
    throw new GitHubSyncError(
      "GitHub connection is not configured.",
      "NOT_CONFIGURED",
    );
  }

  if (!github.repository) {
    throw new GitHubSyncError(
      "GitHub repository is missing.",
      "INVALID_REPOSITORY",
    );
  }

  if (!github.token) {
    throw new GitHubSyncError(
      "GitHub personal access token is missing.",
      "MISSING_TOKEN",
    );
  }

  return github;
}

function parseRepository(repositoryUrl) {
  if (!repositoryUrl) {
    throw new GitHubSyncError(
      "GitHub repository URL is missing.",
      "INVALID_REPOSITORY",
    );
  }

  let url = repositoryUrl.trim();

  url = url.replace(/\.git$/, "");
  url = url.replace(/\/$/, "");

  const match = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)$/);

  if (!match) {
    throw new GitHubSyncError(
      "Invalid GitHub repository URL.",
      "INVALID_REPOSITORY",
    );
  }

  return {
    owner: match[1],
    repo: match[2],
  };
}

/* ---------------------------------------------------------------------- */
/*  NEW — the actual fix                                                   */
/* ---------------------------------------------------------------------- */

function encodeGitHubPath(path) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildRepoUrl(owner, repo) {
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

function buildContentsUrl(owner, repo, path) {
  return `${buildRepoUrl(owner, repo)}/contents/${encodeGitHubPath(path)}`;
}

async function githubRequest(url, github, options = {}, context = "request") {
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${github.token}`,
        Accept: "application/vnd.github+json",
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new GitHubSyncError(
      "Unable to connect to GitHub. Check your internet connection.",
      "NETWORK_ERROR",
      context,
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    switch (response.status) {
      case 401:
        throw new GitHubSyncError(
          "GitHub authentication failed. Check your personal access token.",
          "UNAUTHORIZED",
          context,
        );

      case 403:
        throw new GitHubSyncError(
          "GitHub denied the request. Check your token permissions or API limit.",
          "FORBIDDEN",
          context,
        );

      case 404:
        throw new GitHubSyncError(
          "GitHub repository or file was not found.",
          "NOT_FOUND",
          context,
        );

      case 409:
        throw new GitHubSyncError(
          "GitHub reported a conflict while updating the file. Please try again.",
          "CONFLICT",
          context,
        );

      case 422:
        throw new GitHubSyncError(
          "GitHub rejected the request. Check the repository or file data.",
          "VALIDATION_ERROR",
          context,
        );

      default:
        throw new GitHubSyncError(
          data?.message ||
            `GitHub request failed with status ${response.status}.`,
          "GITHUB_ERROR",
          context,
        );
    }
  }

  return data;
}

async function verifyRepository(owner, repo, github) {
  const url = buildRepoUrl(owner, repo);

  try {
    const data = await githubRequest(url, github, {}, "repository");

    return data;
  } catch (error) {
    if (error instanceof GitHubSyncError && error.code === "NOT_FOUND") {
      throw new GitHubSyncError(
        "GitHub repository was not found. Double-check the owner/repo and that your token can see it.",
        "NOT_FOUND",
        "repository",
      );
    }

    throw error;
  }
}

/* ---------------------------------------------------------------------- */
/*  UPDATED — same behavior, fixed URL building                            */
/* ---------------------------------------------------------------------- */

async function getExistingFile(owner, repo, path, github) {
  const url = buildContentsUrl(owner, repo, path);

  try {
    return await githubRequest(url, github, {}, "existing-file");
  } catch (error) {
    if (error instanceof GitHubSyncError && error.code === "NOT_FOUND") {
      return null;
    }

    throw error;
  }
}

async function uploadGitHubFile({
  owner,
  repo,
  path,
  content,
  message,
  github,
}) {
  const existingFile = await getExistingFile(owner, repo, path, github);

  const isUpdate = Boolean(existingFile?.sha);

  const body = {
    message: isUpdate ? `Update ${message}` : `Add ${message}`,
    content,
    branch: "main",
  };

  if (isUpdate) {
    body.sha = existingFile.sha;
  }

  const url = buildContentsUrl(owner, repo, path);

  const data = await githubRequest(
    url,
    github,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    "upload",
  );

  return {
    data,
    updated: isUpdate,
  };
}

// ============================================================================
// SAFE NAME HELPERS
// ============================================================================

function createSafeName(value, fallback = "Unknown") {
  const safe = (value || "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return safe || fallback;
}

// ============================================================================
// README STYLING
// ============================================================================

function getDifficultyColor(difficulty) {
  const normalized = (difficulty || "").toLowerCase();

  if (normalized.includes("easy")) return "2ea44f";
  if (normalized.includes("medium")) return "dfb317";
  if (normalized.includes("hard")) return "e11d48";

  return "6f42c1";
}

function badge(label, message, color, logo) {
  const encodedLabel = encodeURIComponent(label);
  const encodedMessage = encodeURIComponent(message);

  const logoParam = logo
    ? `&logo=${encodeURIComponent(logo)}&logoColor=white`
    : "";

  return (
    `https://img.shields.io/badge/` +
    `${encodedLabel}-${encodedMessage}-${color}` +
    `?style=for-the-badge${logoParam}`
  );
}

function formatExample(example, index) {
  return `<details ${index === 0 ? "open" : ""}>
<summary><strong>Example ${index + 1}</strong></summary>

| | |
|---|---|
| **Input** | \`${example.input}\` |
| **Output** | \`${example.output}\` |

**Explanation:**
${example.explanation}

</details>
`;
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateProblem(problem) {
  if (!problem) {
    throw new GitHubSyncError(
      "No problem data was received from GeeksforGeeks.",
      "INVALID_PROBLEM",
    );
  }

  if (!problem.title?.trim()) {
    throw new GitHubSyncError(
      "Unable to detect the GFG problem title.",
      "MISSING_TITLE",
    );
  }

  if (!problem.code?.trim()) {
    throw new GitHubSyncError(
      "Unable to extract your GFG solution code.",
      "MISSING_CODE",
    );
  }

  if (!problem.language) {
    throw new GitHubSyncError(
      "Unable to detect the programming language.",
      "MISSING_LANGUAGE",
    );
  }
}

// ============================================================================
// PROBLEM PATHS
// ============================================================================

function createProblemPaths(problem) {
  const safeTitle = createSafeName(problem.title, "Problem");

  const safeDifficulty = createSafeName(
    problem.difficulty || "Unknown",
    "Unknown",
  );

  const extension = problem.language === "cpp" ? "cpp" : "txt";

  const problemFolder = `C++/${safeDifficulty}/${safeTitle}`;

  return {
    problemFolder,
    solutionPath: `${problemFolder}/${safeTitle}.${extension}`,
    readmePath: `${problemFolder}/README.md`,
  };
}

// ============================================================================
// PARSE PROBLEM STATEMENT
// ============================================================================

function parseProblemStatement(statement) {
  const safeStatement = statement || "Problem statement not available.";

  const exampleParts = safeStatement.split(/Examples\s*:/i);

  const mainStatement = exampleParts[0].trim();

  const examples = [];

  if (exampleParts.length > 1) {
    const examplesText = exampleParts.slice(1).join(" ");

    const exampleRegex =
      /Input:\s*(.*?)\s*Output:\s*(.*?)\s*Explanation:\s*(.*?)(?=Input:|$)/gis;

    let match;

    while ((match = exampleRegex.exec(examplesText)) !== null) {
      examples.push({
        input: match[1].trim(),
        output: match[2].trim(),
        explanation: match[3].trim(),
      });
    }
  }

  return {
    mainStatement,
    examples,
  };
}

// ============================================================================
// GENERATE README
// ============================================================================

function generateReadme(problem) {
  const { mainStatement, examples } = parseProblemStatement(problem.statement);

  let formattedExamples = "";

  if (examples.length > 0) {
    formattedExamples = `\n## 📚 Examples\n\n`;

    formattedExamples += examples.map(formatExample).join("\n");
  }

  const difficultyColor = getDifficultyColor(problem.difficulty);

  const languageLabel =
    problem.language === "cpp" ? "C++" : problem.language || "Unknown";

  const difficultyBadge = badge(
    "Difficulty",
    problem.difficulty || "Unknown",
    difficultyColor,
  );

  const languageBadge = badge("Language", languageLabel, "0366d6", "cplusplus");

  const sourceBadge = badge("Source", "GeeksforGeeks", "2f8d46");

  const statusBadge = badge("Status", "Solved", "2ea44f", "checkmarx");

  return `<div align="center">

# 🔗 ${problem.title}

[![Difficulty](${difficultyBadge})](${problem.url})
[![Language](${languageBadge})](${problem.url})
[![Source](${sourceBadge})](${problem.url})
[![Status](${statusBadge})](${problem.url})

**[🌐 View Original Problem on GeeksforGeeks](${problem.url})**

</div>

---

## 📝 Problem Statement

> ${mainStatement.replace(/\n/g, "\n> ")}

${formattedExamples}

---

<div align="center">

### 🚀 GFG GitHub Sync

<sub>Automatically synced from GeeksforGeeks • Last updated: ${
    new Date().toISOString().split("T")[0]
  }</sub>

</div>
`;
}

// ============================================================================
// RECORD STATISTICS
// ============================================================================

async function recordStats(problem) {
  const data = await chrome.storage.local.get("stats");

  const stats = data.stats || {
    total: 0,
    byDifficulty: {},
    solvedTitles: [],
  };

  const solvedTitles = new Set(stats.solvedTitles || []);

  const isNewProblem = !solvedTitles.has(problem.title);

  if (isNewProblem) {
    solvedTitles.add(problem.title);

    const difficulty = problem.difficulty || "Unknown";

    stats.total = (stats.total || 0) + 1;

    stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;
  }

  stats.solvedTitles = [...solvedTitles];

  stats.lastProblem = {
    title: problem.title,
    url: problem.url,
    difficulty: problem.difficulty || "Unknown",
    syncedAt: Date.now(),
  };

  await chrome.storage.local.set({
    stats,
  });
}

// ============================================================================
// SYNC STATUS
// ============================================================================

async function setSyncStatus(status) {
  await chrome.storage.local.set({
    syncStatus: {
      ...status,
      updatedAt: Date.now(),
    },
  });
}

// ============================================================================
// UPLOAD README
// ============================================================================

async function uploadReadme(owner, repo, readmePath, readme, github, problem) {
  const readmeContent = btoa(unescape(encodeURIComponent(readme)));

  try {
    await uploadGitHubFile({
      owner,
      repo,
      path: readmePath,
      content: readmeContent,
      message: `README for ${problem.title}`,
      github,
    });

    return true;
  } catch (error) {
    throw new GitHubSyncError(
      `Solution uploaded, but README upload failed: ${error.message}`,
      "README_UPLOAD_FAILED",
      "readme",
    );
  }
}

// ============================================================================
// MAIN UPLOAD
// ============================================================================

async function uploadSolution(problem) {
  validateProblem(problem);

  const github = await getGitHubConfig();

  const { owner, repo } = parseRepository(github.repository);

  const repositoryData = await verifyRepository(owner, repo, github);

  const { solutionPath, readmePath } = createProblemPaths(problem);

  const readme = generateReadme(problem);

  const content = btoa(unescape(encodeURIComponent(problem.code)));

  const solutionResult = await uploadGitHubFile({
    owner,
    repo,
    path: solutionPath,
    content,
    message: `${problem.title} solution`,
    github,
  });

  const wasUpdate = solutionResult.updated;

  await uploadReadme(owner, repo, readmePath, readme, github, problem);

  await recordStats(problem);

  await setSyncStatus({
    status: wasUpdate ? "updated" : "uploaded",
    title: problem.title,
    difficulty: problem.difficulty || "Unknown",
    url: problem.url,
    file: solutionPath,
    error: null,
  });

  return {
    success: true,
    status: wasUpdate ? "updated" : "uploaded",
    title: problem.title,
    file: solutionPath,
  };
}

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GFG_SYNC_ERROR") {
    setSyncStatus({
      status: "error",
      title: "GeeksforGeeks",
      error: message.error?.message || "An error occurred.",
      code: message.error?.code || "UNKNOWN_ERROR",
    }).catch(() => {});

    return;
  }

  if (message.type !== "GFG_ACCEPTED") {
    return;
  }

  if (uploadInProgress) {
    sendResponse({
      success: false,
      error: "A solution is already being synced.",
      code: "UPLOAD_IN_PROGRESS",
    });

    return;
  }

  uploadInProgress = true;

  setSyncStatus({
    status: "syncing",
    title: message.problem?.title || "Unknown",
    difficulty: message.problem?.difficulty || "Unknown",
    error: null,
  }).catch(() => {});

  uploadSolution(message.problem)
    .then((result) => {
      sendResponse(result);
    })
    .catch(async (error) => {
      const messageText =
        error instanceof GitHubSyncError
          ? error.message
          : "Unable to sync solution to GitHub.";

      const errorCode =
        error instanceof GitHubSyncError ? error.code : "UNKNOWN_ERROR";

      await setSyncStatus({
        status: "error",
        title: message.problem?.title || "Unknown",
        difficulty: message.problem?.difficulty || "Unknown",
        error: messageText,
        code: errorCode,
      });

      sendResponse({
        success: false,
        error: messageText,
        code: errorCode,
      });
    })
    .finally(() => {
      uploadInProgress = false;
    });

  return true;
});

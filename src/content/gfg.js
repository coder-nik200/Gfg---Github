// ==========================================
// PAGE CONTEXT BRIDGE
// ==========================================

function injectPageBridge() {
  try {
    const script = document.createElement("script");

    script.src = chrome.runtime.getURL("src/content/page.js");

    script.onload = () => {
      script.remove();
    };

    script.onerror = () => {
      script.remove();
    };

    (document.head || document.documentElement).appendChild(script);
  } catch (error) {
    handleError("PAGE_BRIDGE_ERROR", error);
  }
}

// ==========================================
// ERROR HANDLING
// ==========================================

function handleError(code, error) {
  const message =
    error instanceof Error ? error.message : String(error || "Unknown error");

  chrome.runtime
    .sendMessage({
      type: "GFG_SYNC_ERROR",
      error: {
        code,
        message,
      },
    })
    .catch(() => {
      // Background service worker may not be available.
    });
}

// ==========================================
// CODE REQUEST
// ==========================================

function requestCurrentCode() {
  try {
    awaitingCode = true;

    window.dispatchEvent(new Event("GFG_GET_CODE"));
  } catch (error) {
    awaitingCode = false;
    handleError("CODE_REQUEST_ERROR", error);
  }
}

// ==========================================
// METADATA EXTRACTION
// ==========================================

function getProblemTitle() {
  return document.title.split("|")[0].trim();
}

function getProblemUrl() {
  return location.href;
}

function getDifficulty() {
  return [...document.querySelectorAll("strong")]
    .find((element) =>
      ["Easy", "Medium", "Hard"].includes(element.textContent?.trim()),
    )
    ?.textContent.trim();
}

function getLanguage() {
  const languageText = document
    .querySelector('[role="option"][aria-selected="true"] .text')
    ?.textContent.trim();

  if (languageText?.startsWith("C++")) {
    return "cpp";
  }

  return undefined;
}

function getProblemStatement() {
  return document
    .querySelector(".problems_problem_content__Xm_eO")
    ?.innerText?.trim();
}

// ==========================================
// PROBLEM DATA
// ==========================================

function extractProblem(code) {
  const title = getProblemTitle();
  const url = getProblemUrl();
  const difficulty = getDifficulty();
  const language = getLanguage();
  const statement = getProblemStatement();

  if (!title) {
    throw new Error("Problem title could not be detected.");
  }

  if (!url) {
    throw new Error("Problem URL could not be detected.");
  }

  if (!code) {
    throw new Error("Solution code could not be extracted.");
  }

  return {
    title,
    url,
    difficulty,
    language,
    statement,
    code,
  };
}

// ==========================================
// SEND PROBLEM TO BACKGROUND
// ==========================================

function sendProblemToBackground(problem) {
  try {
    chrome.runtime
      .sendMessage({
        type: "GFG_ACCEPTED",
        problem,
      })
      .catch((error) => {
        handleError("BACKGROUND_MESSAGE_ERROR", error);
      });
  } catch (error) {
    handleError("BACKGROUND_MESSAGE_ERROR", error);
  }
}

// ==========================================
// RECEIVE CODE FROM PAGE.JS
// ==========================================

let awaitingCode = false;

function handleCodeResult(event) {
  try {
    const code = event.detail;

    if (!code || !awaitingCode) {
      return;
    }

    awaitingCode = false;

    const problem = extractProblem(code);

    sendProblemToBackground(problem);
  } catch (error) {
    awaitingCode = false;
    handleError("PROBLEM_EXTRACTION_ERROR", error);
  }
}

window.addEventListener("GFG_CODE_RESULT", handleCodeResult);

// ==========================================
// SUBMISSION RESULT DETECTOR
// ==========================================

let submissionDetected = false;

function isSubmissionSuccessful() {
  try {
    const text = document.body?.innerText || "";

    return text.includes("Problem Solved Successfully");
  } catch (error) {
    handleError("SUBMISSION_CHECK_ERROR", error);
    return false;
  }
}

function checkSubmissionResult() {
  try {
    const isSuccess = isSubmissionSuccessful();

    // ==========================================
    // NEW SUCCESSFUL SUBMISSION
    // ==========================================

    if (isSuccess && !submissionDetected) {
      submissionDetected = true;

      requestCurrentCode();

      return;
    }

    // ==========================================
    // SUCCESS MESSAGE DISAPPEARED
    // ==========================================

    if (!isSuccess && submissionDetected) {
      submissionDetected = false;
    }
  } catch (error) {
    handleError("SUBMISSION_DETECTION_ERROR", error);
  }
}

// ==========================================
// OBSERVER
// ==========================================

function startSubmissionObserver() {
  try {
    if (!document.body) {
      throw new Error("Document body is not available.");
    }

    const submissionObserver = new MutationObserver(() => {
      checkSubmissionResult();
    });

    submissionObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return submissionObserver;
  } catch (error) {
    handleError("OBSERVER_ERROR", error);
    return null;
  }
}

// ==========================================
// INITIALIZE EXTENSION
// ==========================================

function initialize() {
  try {
    injectPageBridge();

    startSubmissionObserver();

    checkSubmissionResult();
  } catch (error) {
    handleError("INITIALIZATION_ERROR", error);
  }
}

// ==========================================
// START
// ==========================================

initialize();

<div align="center">

<img src="assets/logo.png" alt="GFG GitHub Sync Logo" width="140"/>

# GFG → GitHub Sync

### Automatically sync your solved GeeksforGeeks problems to GitHub.

<p>
  <img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome Extension"/>
  <img src="https://img.shields.io/badge/Manifest-V3-34A853?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3"/>
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/GitHub-API-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub API"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License"/>
</p>

<p>
  <strong>Never lose track of your DSA practice again.</strong><br/>
  Solve on GeeksforGeeks. Submit successfully. GFG GitHub Sync handles the backup.
</p>

</div>

---

## ✨ Overview

**GFG GitHub Sync** is a Chrome extension that automatically backs up accepted **GeeksforGeeks** solutions to a GitHub repository.

Instead of manually copying your solution, creating folders, opening GitHub, committing files, and maintaining your DSA repository by hand, the extension detects a successful submission and syncs the solution automatically.

It is designed for developers and students who want a clean, organized GitHub history of their problem-solving journey.

### The basic workflow

```text
Solve Problem on GeeksforGeeks
            ↓
      Submit Solution
            ↓
   Problem Solved Successfully
            ↓
    GFG GitHub Sync detects it
            ↓
       Extracts your code
            ↓
    Extracts problem metadata
            ↓
       Connects to GitHub
            ↓
  Creates / updates solution files
            ↓
        Generates README
            ↓
       Updates your stats
```

---

## 🖼️ Extension Preview

<div align="center">

### Dashboard

<img src="assets/screenshots/dashboard.png" alt="GFG GitHub Sync dashboard" width="520"/>

<br/><br/>

### GitHub Connection

<img src="assets/screenshots/connection.png" alt="GitHub connection screen" width="520"/>

</div>

---

## 🚀 Key Features

### 🔄 Automatic Solution Sync

Once a GeeksforGeeks problem is successfully solved, the extension can detect the successful submission and send the solution to your configured GitHub repository.

### 📁 Organized Repository Structure

Solutions are automatically organized by language and difficulty.

Example:

```text
C++/
├── Easy/
│   ├── Largest-in-Array/
│   │   ├── Largest-in-Array.cpp
│   │   └── README.md
│   │
│   └── Missing-Number/
│       ├── Missing-Number.cpp
│       └── README.md
│
├── Medium/
│   └── Two-Sum-Pair-with-Given-Sum/
│       ├── Two-Sum-Pair-with-Given-Sum.cpp
│       └── README.md
│
└── Hard/
```

This keeps your GitHub DSA repository readable as the number of solved problems grows.

### 📝 Automatic README Generation

For each synced problem, the extension generates a problem-level `README.md` containing available problem information such as:

- Problem title
- Difficulty
- Problem statement
- Examples
- Source problem link
- Solution context

### ♻️ Update Existing Solutions

If a solution file already exists, the extension updates the existing GitHub file instead of blindly creating another copy.

### 📊 Solving Statistics

The popup tracks your synced progress, including:

- Total synced problems
- Easy problems
- Medium problems
- Hard problems
- Last synced problem
- Last sync time

Example:

```text
┌─────────┬──────┬────────┬──────┐
│ 7 Synced│ 4 Easy│ 2 Medium│ 0 Hard │
└─────────┴──────┴────────┴──────┘
```

### 🔐 Local GitHub Configuration

Your GitHub connection details are stored using Chrome's local extension storage.

The personal access token is not displayed in the connected dashboard after saving.

### ⚠️ Error Handling

The extension includes handling for common synchronization problems, including:

- Missing GitHub configuration
- Invalid repository URL
- Missing token
- Authentication failures
- Repository not found
- Permission/API errors
- Network failures
- Upload conflicts
- Code extraction failures
- Submission detection failures

### 🎯 C++ Focus

The current solution path is designed around C++ DSA submissions:

```text
C++/<Difficulty>/<Problem>/<Problem>.cpp
```

Other languages currently fall back to a text extension where applicable.

---

## 🧩 How It Works

GFG GitHub Sync uses several extension components working together.

### 1. Content Script

The content script runs on GeeksforGeeks pages and watches for a successful submission.

It extracts information such as:

```text
Problem Title
Problem URL
Difficulty
Language
Problem Statement
Solution Code
```

### 2. Page Context Bridge

GeeksforGeeks uses an in-page code editor.

The extension uses a small page-context bridge to access the editor's current code and pass it back to the content script.

### 3. Background Service Worker

The background service worker handles the GitHub synchronization logic.

Responsibilities include:

- Reading GitHub configuration
- Validating repository information
- Verifying repository access
- Checking whether a solution already exists
- Uploading or updating solution files
- Uploading generated README files
- Recording sync statistics
- Maintaining sync status

### 4. GitHub REST API

The extension communicates with GitHub through the GitHub REST API.

The solution is uploaded using the repository contents API.

---

## 🏗️ Project Architecture

```text
GFG GitHub Sync
│
├── manifest.json
│
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
└── src/
    │
    ├── background/
    │   └── background.js
    │
    ├── content/
    │   ├── gfg.js
    │   └── page.js
    │
    └── popup/
        ├── popup.html
        ├── popup.css
        └── popup.js
```

### Component responsibilities

| Component | Responsibility |
|---|---|
| `manifest.json` | Extension configuration and permissions |
| `gfg.js` | Detects successful submissions and extracts metadata |
| `page.js` | Reads code from the GFG editor |
| `background.js` | GitHub API, uploads, README generation, stats and errors |
| `popup.html` | Extension popup structure |
| `popup.css` | Popup UI styling |
| `popup.js` | Popup state, connection UI, statistics and sync status |
| `icons/` | Extension icons |

---

## 📦 Installation

### Option 1 — Load the extension locally

Clone the repository:

```bash
git clone https://github.com/coder-nik200/Gfg---Github.git
cd Gfg---Github
```

Then open Chrome:

```text
chrome://extensions
```

1. Enable **Developer mode**.
2. Click **Load unpacked**.
3. Select the project folder containing `manifest.json`.
4. Pin **GFG GitHub Sync** to your Chrome toolbar.

---

## 🔑 GitHub Setup

The extension needs a GitHub repository where your solutions will be stored.

### 1. Create a repository

Create a repository on GitHub, for example:

```text
GeeksforGeeks-Submission
```

### 2. Create a Personal Access Token

Create a GitHub Personal Access Token with the minimum repository permissions required for your repository and account setup.

> **Security:** Never publish your token in this repository, README, screenshots, issues, commits, or source code.

### 3. Connect the repository

Open the extension and enter:

```text
GitHub Username
Repository URL
Personal Access Token
```

Example:

```text
Username:
coder-nik200

Repository:
https://github.com/coder-nik200/GeeksforGeeks-Submission
```

Click:

```text
Connect GitHub
```

The extension will store the configuration locally and use it for future synchronization.

---

## ▶️ Usage

After connecting GitHub:

### Step 1

Open a GeeksforGeeks problem.

### Step 2

Write your solution.

### Step 3

Submit the solution.

### Step 4

Wait for:

```text
Problem Solved Successfully
```

### Step 5

GFG GitHub Sync detects the successful submission.

### Step 6

The extension extracts the current solution and problem information.

### Step 7

The solution and generated README are uploaded to your configured GitHub repository.

### Step 8

The popup updates your sync statistics.

---

## 📂 Example GitHub Result

After solving several problems, your repository can look like:

```text
GeeksforGeeks-Submission/
│
└── C++/
    │
    ├── Easy/
    │   ├── Largest-in-Array/
    │   │   ├── Largest-in-Array.cpp
    │   │   └── README.md
    │   │
    │   ├── Missing-Number/
    │   │   ├── Missing-Number.cpp
    │   │   └── README.md
    │   │
    │   └── Move-All-Zeroes-to-End/
    │       ├── Move-All-Zeroes-to-End.cpp
    │       └── README.md
    │
    ├── Medium/
    │   └── Two-Sum-Pair-with-Given-Sum/
    │       ├── Two-Sum-Pair-with-Given-Sum.cpp
    │       └── README.md
    │
    └── Hard/
```

---

## 🛡️ Permissions

The extension uses a limited set of Chrome permissions needed for its functionality.

### `storage`

Used to store:

- GitHub connection settings
- Sync status
- Solving statistics

### GeeksforGeeks host access

Used to:

- Detect successful submissions
- Read problem metadata
- Access the solution editor through the page bridge

### GitHub API host access

Used to communicate with GitHub's REST API for:

- Repository verification
- Solution uploads
- README uploads
- Existing-file updates

---

## 🔐 Security & Privacy

GFG GitHub Sync is designed so your GitHub token is kept in Chrome extension storage rather than hard-coded into the source code.

### Important security practices

- Never commit a GitHub token.
- Never share screenshots containing your token.
- Never place tokens inside JavaScript source files.
- Use a token with only the permissions you actually need.
- Revoke a token immediately if you accidentally expose it.

### Data flow

```text
GeeksforGeeks
      │
      │ Problem + Solution
      ▼
GFG GitHub Sync
      │
      │ GitHub API request
      ▼
Your GitHub Repository
```

The extension does not require a separate application server for the synchronization flow.

---

## 🧪 Testing Checklist

Before publishing or distributing the extension, test the following:

### GitHub connection

- [ ] Valid GitHub username
- [ ] Valid repository URL
- [ ] Valid token
- [ ] Invalid token
- [ ] Invalid repository
- [ ] Private repository access

### Submission detection

- [ ] Accepted problem
- [ ] Failed submission
- [ ] Multiple submissions
- [ ] Page refresh
- [ ] Problem navigation
- [ ] Submission after reconnecting

### GitHub synchronization

- [ ] New solution upload
- [ ] Existing solution update
- [ ] README creation
- [ ] README update
- [ ] Network failure
- [ ] GitHub API error
- [ ] Duplicate solution handling

### Popup

- [ ] Connection screen
- [ ] Connected screen
- [ ] Statistics
- [ ] Last sync
- [ ] Error state
- [ ] Edit connection

---

## 🛠️ Troubleshooting

### "GitHub repository was not found"

Check:

1. Repository URL is correct.
2. Repository owner is correct.
3. Repository exists.
4. Token has access to the repository.

Example:

```text
https://github.com/username/repository
```

### Solution is not syncing

Try:

1. Reload the extension from `chrome://extensions`.
2. Refresh the GeeksforGeeks page.
3. Submit the problem again.
4. Confirm the success message appears.
5. Check the extension popup for the sync status.

### Existing solution is not updating

Confirm that:

- The solution path matches the generated problem path.
- Your token can write to the repository.
- The repository's default branch is available to the extension.

---

## 🎨 Design Philosophy

The extension follows a simple developer-focused philosophy:

> **Solve → Sync → Track**

The interface focuses on:

- Minimal friction
- Clear sync status
- Dark developer-oriented UI
- Readable statistics
- Simple GitHub connection
- Automatic organization

The goal is to make GitHub maintenance disappear from the DSA practice workflow.

---

## 🗺️ Roadmap

### ✅ Current

- [x] GeeksforGeeks submission detection
- [x] Solution code extraction
- [x] Problem metadata extraction
- [x] GitHub repository verification
- [x] Automatic solution upload
- [x] Existing solution updates
- [x] Automatic README generation
- [x] Sync statistics
- [x] Sync status reporting
- [x] Error handling
- [x] Chrome Manifest V3

### 🔜 Planned

- [ ] Better submission detection across GFG UI changes
- [ ] More supported programming languages
- [ ] Sync history
- [ ] Manual "Sync Now" action
- [ ] Repository browser shortcut
- [ ] Improved settings page
- [ ] More detailed analytics
- [ ] Chrome Web Store release
- [ ] Automated extension release workflow

---

## 🤝 Contributing

Contributions, ideas, bug reports, and improvements are welcome.

### Development workflow

```bash
git clone https://github.com/coder-nik200/Gfg---Github.git

cd Gfg---Github

git checkout -b feature/your-feature

# Make your changes

git add .

git commit -m "Add your change"

git push origin feature/your-feature
```

Then open a Pull Request on GitHub.

### Before submitting a PR

Please make sure:

- The extension still loads successfully.
- There are no unnecessary console logs.
- Existing functionality is not broken.
- Sensitive credentials are not included.
- The code remains readable and maintainable.

---

## 📜 License

This project is licensed under the **MIT License**.

You are free to use, modify, distribute, and build upon the project in accordance with the license terms.

See the [`LICENSE`](LICENSE) file for the complete license text.

> The MIT License applies to this project's source code. It does not grant rights to GeeksforGeeks content, trademarks, logos, or third-party services/content.

---

## 👨‍💻 Author

<div align="center">

### Nitish Bharti

**MERN Stack Developer • DSA Learner • Builder**

<p>
  <a href="https://github.com/coder-nik200">
    <img src="https://img.shields.io/badge/GitHub-coder--nik200-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
  </a>
</p>

</div>

---

## ⭐ Support the Project

If GFG GitHub Sync helps you maintain your DSA journey:

- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Contribute improvements
- 📢 Share the project with other developers

Every contribution helps improve the project.

---

<div align="center">

<img src="assets/logo.png" alt="GFG GitHub Sync" width="80"/>

### GFG → GitHub

**Your solutions. Your repository. Your progress.**

Made for developers who want to focus on solving problems — not maintaining folders.

</div>

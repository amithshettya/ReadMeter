# 📖 ReadMeter
**Bringing the structure of physical books to the digital scroll.**

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

## ⚖️ The Problem
Webpages are built as "infinite scrolls," unlike physical books which are naturally chunked into pages. This lack of structure makes it difficult for readers to:
* **Plan:** "Do I have time to finish this before my next task?"
* **Continue:** Pick up exactly where they left off without losing context.
* **Estimate:** Gauge the true length of an article.

## 🚀 The Solution
This browser extension provides a visual and quantitative anchor for your reading. It injects a dynamic progress bar that tracks your journey through the text in real-time.

### Key Features
* **Word-Based Progress:** Tracks progress by word count rather than just pixel height.
* **Live Metrics:** Displays:
    * Total Words
    * Words Read
    * Remaining
* **Library:** (Coming Soon).

---

## 🛠 Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/read-meter.git](https://github.com/your-username/read-meter.git)
    ```
2.  **Open Browser Extensions:**
    Navigate to `chrome://extensions/` (or `edge://extensions/`).
3.  **Enable "Developer mode":**
    Toggle the switch in the top-right corner.
4.  **Load Unpacked:**
    Click "Load unpacked" and select the project directory.

---

## 🖥️ How it Works
The extension calculates progress by analyzing the text on the page and monitoring the user's scroll depth.

The core logic uses the following ratio to update the UI:
$$Progress \% = \left( \frac{Words_{read}}{Words_{total}} \right) \times 100$$

---

## 🗺️ Roadmap
- [ ] Progess bar and word count
- [ ] Library
- [ ] Read where you left off

---
**Happy Reading!**

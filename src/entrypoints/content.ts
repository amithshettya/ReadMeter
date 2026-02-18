import { MESSAGES } from '../messaging';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    let totalWords = 0;
    let progressBar: HTMLDivElement | null = null;
    let progressFill: HTMLDivElement | null = null;
    let progressText: HTMLSpanElement | null = null;
    let floatDisplay: HTMLDivElement | null = null;
    let isTracking = false;
    let rafId: number | null = null;
    let currentUrl = '';

    async function init() {
      const trackedPage = await browser.runtime.sendMessage({
        action: MESSAGES.CHECK_TRACKED_URL,
        url: window.location.href,
      }) as { url: string; title: string; scrollPosition: number } | null;

      if (trackedPage) {
        const success = addProgressBar();
        if (success) {
          addScrollEvent();
          setTimeout(() => {
            window.scrollTo(0, trackedPage.scrollPosition);
            updateProgressBar();
          }, 100);
        }
      }
    }

    init();

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === MESSAGES.PAGE_ADDED) {
        const success = addProgressBar();
        if (success) {
          addScrollEvent();
        }
        sendResponse({ success });
        return true;
      }

      if (message.action === MESSAGES.PAGE_DELETED) {
        removeScrollEvent();
        deleteProgressBar();
        const existingFloat = document.getElementById('readmeter-float');
        if (existingFloat) existingFloat.remove();
        return true;
      }
    });

    function getMainContent(): HTMLElement | null {
      return document.querySelector('article') || document.querySelector('main') || document.body;
    }

    function countWords(text: string): number {
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    function calculateTotalWords(): number {
      const content = getMainContent();
      if (!content) return 0;
      return countWords(content.innerText);
    }

    function getWordsRead(): number {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return 0;
      const scrollPercent = Math.min(scrollTop / docHeight, 1);
      return Math.floor(totalWords * scrollPercent);
    }

    function addProgressBar(): boolean {
      currentUrl = window.location.href;
      totalWords = calculateTotalWords();
      
      if (totalWords === 0) return false;

      isTracking = true;
      progressBar = document.createElement('div');
      progressBar.id = 'readmeter-progress';
      const fill = document.createElement('div');
      fill.id = 'readmeter-fill';
      const text = document.createElement('span');
      text.id = 'readmeter-text';
      progressBar.appendChild(fill);
      progressBar.appendChild(text);

      const style = document.createElement('style');
      style.textContent = `
        #readmeter-progress {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(0, 0, 0, 0.1);
          z-index: 2147483647;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #readmeter-fill {
          height: 100%;
          background: #77B28C;
          width: 0%;
          transition: width 0.1s ease-out;
        }
        #readmeter-text {
          position: absolute;
          right: 12px;
          top: 8px;
          font-size: 12px;
          color: #666;
          background: rgba(255, 255, 255, 0.95);
          padding: 4px 8px;
          border-radius: 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
          white-space: nowrap;
        }
        #readmeter-float {
          position: fixed;
          top: 1em;
          left: 1em;
          background: rgba(119, 178, 140, 0.9);
          color: white;
          padding: 0.5em 1em;
          border-radius: 4px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 0.7em;
          z-index: 2147483647;
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          height: 2.5em;
          box-sizing: border-box;
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(progressBar);

      floatDisplay = document.createElement('div');
      floatDisplay.id = 'readmeter-float';
      floatDisplay.textContent = '0 / 0';
      document.body.appendChild(floatDisplay);

      progressFill = progressBar.querySelector('#readmeter-fill');
      progressText = progressBar.querySelector('#readmeter-text');
      
      updateProgressBar();
      return true;
    }

    function deleteProgressBar() {
      if (progressBar) {
        progressBar.remove();
        progressBar = null;
        progressFill = null;
        progressText = null;
      }
      if (floatDisplay) {
        floatDisplay.remove();
        floatDisplay = null;
      }
    }

    function addScrollEvent() {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    function removeScrollEvent() {
      window.removeEventListener('scroll', onScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      isTracking = false;
    }

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        updateStat();
        rafId = null;
      });
    }

    function updateStat() {
      if (!progressBar || !progressFill || !progressText || totalWords === 0) return;

      const wordsRead = getWordsRead();
      const wordsRemaining = totalWords - wordsRead;
      const percent = (wordsRead / totalWords) * 100;

      progressFill.style.width = `${percent}%`;
      progressText.style.display = 'none';

      if (floatDisplay) {
        floatDisplay.textContent = `${wordsRead} / ${totalWords} read • ${wordsRemaining} left`;
      }

      browser.runtime.sendMessage({
        action: MESSAGES.UPDATE_STATS,
        url: currentUrl,
        scrollPosition: window.scrollY,
      });
    }

    function updateProgressBar() {
      if (!progressBar || !progressFill || !progressText || totalWords === 0) return;

      const wordsRead = getWordsRead();
      const wordsRemaining = totalWords - wordsRead;
      const percent = (wordsRead / totalWords) * 100;

      progressFill.style.width = `${percent}%`;
      progressText.style.display = 'none';

      if (floatDisplay) {
        floatDisplay.textContent = `${wordsRead} / ${totalWords} read • ${wordsRemaining} left`;
      }
    }
  },
});

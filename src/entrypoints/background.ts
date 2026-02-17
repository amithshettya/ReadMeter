import { MESSAGES, type TrackedPage } from '../messaging';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === MESSAGES.GET_TRACKED_PAGES) {
      getFromStorage().then(sendResponse);
      return true;
    }

    if (message.action === MESSAGES.CHECK_TRACKED_URL) {
      checkTrackedUrl(message.url).then(sendResponse);
      return true;
    }

    if (message.action === MESSAGES.ADD_PAGE) {
      addPage(message.page).then(() => sendResponse({ success: true }));
      return true;
    }

    if (message.action === MESSAGES.DELETE_PAGE) {
      deletePage(message.url).then(async () => {
        const tabs = await browser.tabs.query({});
        for (const tab of tabs) {
          if (tab.id && tab.url === message.url) {
            try {
              await browser.tabs.sendMessage(tab.id, { action: MESSAGES.PAGE_DELETED });
            } catch {}
          }
        }
        sendResponse({ success: true });
      });
      return true;
    }

    if (message.action === MESSAGES.UPDATE_STATS) {
      updateStats(message.url, message.scrollPosition).then(() => sendResponse({ success: true }));
      return true;
    }
  });

  const STORAGE_KEY = 'trackedPages';

  async function getFromStorage(): Promise<TrackedPage[]> {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const pages = result[STORAGE_KEY];
    if (Array.isArray(pages)) {
      return pages;
    }
    return [];
  }

  async function saveToStorage(pages: TrackedPage[]): Promise<void> {
    await browser.storage.local.set({ [STORAGE_KEY]: pages });
  }

  async function addPage(page: TrackedPage): Promise<void> {
    const pages = await getFromStorage();
    const existingIndex = pages.findIndex(p => p.url === page.url);
    
    if (existingIndex >= 0) {
      pages[existingIndex] = page;
    } else {
      pages.push(page);
    }
    
    await saveToStorage(pages);
  }

  async function deletePage(url: string): Promise<void> {
    const pages = await getFromStorage();
    const filtered = pages.filter(p => p.url !== url);
    await saveToStorage(filtered);
  }

  async function updateStats(url: string, scrollPosition: number): Promise<void> {
    const pages = await getFromStorage();
    const page = pages.find(p => p.url === url);
    
    if (page) {
      page.scrollPosition = scrollPosition;
      await saveToStorage(pages);
    }
  }

  async function checkTrackedUrl(url: string): Promise<TrackedPage | null> {
    const pages = await getFromStorage();
    return pages.find(p => p.url === url) || null;
  }
});

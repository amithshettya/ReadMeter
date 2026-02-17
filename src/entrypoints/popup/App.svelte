<script lang="ts">
  import { onMount } from 'svelte';
  import { MESSAGES, type TrackedPage } from '../../messaging';

  let trackedPages: TrackedPage[] = $state([]);
  let status: 'idle' | 'adding' | 'added' | 'error' = $state('idle');
  let currentPageTracked = $state(false);

  onMount(async () => {
    await loadPagesInLibrary();
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      currentPageTracked = trackedPages.some(p => p.url === tab.url);
    }
  });

  async function loadPagesInLibrary() {
    const pages = await browser.runtime.sendMessage({ action: 'GET_TRACKED_PAGES' }) as TrackedPage[];
    trackedPages = pages || [];
  }

  async function addPage() {
    status = 'adding';
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error('No active tab');

      const page: TrackedPage = {
        url: tab.url || '',
        title: tab.title || '',
        scrollPosition: 0,
      };

      await browser.runtime.sendMessage({ action: MESSAGES.ADD_PAGE, page });

      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const response = await Promise.race([
        browser.tabs.sendMessage(tab.id, { action: MESSAGES.PAGE_ADDED }),
        timeout
      ]) as { success: boolean };
      
      if (!response?.success) throw new Error('Failed');
      await loadPagesInLibrary();
      currentPageTracked = true;
      status = 'added';
    } catch {
      status = 'error';
      setTimeout(() => status = 'idle', 2000);
    }
  }

  async function deletePage(url: string) {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    const wasCurrentPage = tab?.url === url;
    
    await browser.runtime.sendMessage({ action: MESSAGES.DELETE_PAGE, url });
    await loadPagesInLibrary();
    
    if (wasCurrentPage) {
      currentPageTracked = false;
    }
  }

  async function openPage(url: string) {
    await browser.tabs.create({ url });
  }
</script>

<main>
  <h1>ReadMeter</h1>
  
  <button class="add-btn" class:error={status === 'error'} class:tracked={currentPageTracked} onclick={addPage} disabled={status === 'adding' || currentPageTracked}>
    {#if status === 'adding'}
      Adding...
    {:else if status === 'added' || currentPageTracked}
      Added!
    {:else if status === 'error'}
      Failed
    {:else}
      + Add Page
    {/if}
  </button>

  <div class="list">
    {#each trackedPages as page (page.url)}
      <div class="item" onclick={() => openPage(page.url)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && openPage(page.url)}>
        <div class="info">
          <span class="title">{page.title || page.url}</span>
        </div>
        <button class="delete-btn" onclick={(e) => { e.stopPropagation(); deletePage(page.url); }}>×</button>
      </div>
    {/each}
    
    {#if trackedPages.length === 0}
      <p class="empty">No pages tracked yet</p>
    {/if}
  </div>
</main>

<style>
  main {
    padding: 12px;
    min-width: 280px;
  }
  h1 {
    font-size: 1.1rem;
    margin: 0 0 12px;
    color: #333;
  }
  .add-btn {
    width: 100%;
    background: #77B28C;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.2s;
    margin-bottom: 12px;
  }
  .add-btn:hover:not(:disabled) {
    background: #6a9f7b;
  }
  .add-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  .add-btn.error {
    background: #e74c3c;
  }
  .add-btn.tracked {
    background: #6a9f7b;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    background: #f5f5f5;
    border-radius: 6px;
    cursor: pointer;
  }
  .item:hover {
    background: #e8e8e8;
  }
  .info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
  }
  .title {
    font-size: 0.85rem;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .meta {
    font-size: 0.75rem;
    color: #888;
  }
  .delete-btn {
    background: none;
    border: none;
    color: #999;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
  }
  .delete-btn:hover {
    color: #e74c3c;
  }
  .empty {
    text-align: center;
    color: #888;
    font-size: 0.85rem;
    margin: 20px 0;
  }
</style>

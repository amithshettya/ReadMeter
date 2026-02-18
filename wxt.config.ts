import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte', '@wxt-dev/auto-icons'],
  manifest: ({ browser }) => ({
    name: 'ReadMeter',
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: ['<all_urls>'],
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          id: 'amithshettya@gmail.com',
          "data_collection_permissions": {
              "required": ["none"],
              "optional": ["websiteContent"]
          }
        },
      },
    }),
  }),
});

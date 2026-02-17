export const MESSAGES = {
  ADD_PAGE: 'ADD_PAGE',
  PAGE_ADDED: 'PAGE_ADDED',
  DELETE_PAGE: 'DELETE_PAGE',
  PAGE_DELETED: 'PAGE_DELETED',
  UPDATE_STATS: 'UPDATE_STATS',
  GET_TRACKED_PAGES: 'GET_TRACKED_PAGES',
  CHECK_TRACKED_URL: 'CHECK_TRACKED_URL',
} as const;

export interface TrackedPage {
  url: string;
  title: string;
  scrollPosition: number;
}

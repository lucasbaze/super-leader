// Define route parameter types
type PersonIdParam = { id: string };
type GroupIdParam = { id: string };

// Define route segments
export const APP_SEGMENTS = {
  ROOT: 'app',
  PERSON: 'person',
  GROUPS: 'groups',
  NETWORK: 'network',
  PEOPLE: 'people',
  BOOKMARKS: 'bookmarks',
  LOGIN: 'login',
  CONTEXT: 'context',
  SETTINGS: 'settings',
  ONBOARDING: 'onboarding',
  ORGANIZATIONS: 'organizations'
} as const;

// Define sub-segments
const PERSON_SEGMENTS = {
  SUMMARY: 'summary',
  TASKS: 'tasks'
} as const;

const SETTINGS_SEGMENTS = {
  CUSTOM_FIELDS: 'custom-fields',
  INTEGRATIONS: 'integrations'
} as const;

// Base path
export const BASE_PATH = `/${APP_SEGMENTS.ROOT}`;

// Route builder functions
export const routes = {
  // Home routes
  home: () => BASE_PATH,

  // Auth routes
  auth: {
    login: () => `/${APP_SEGMENTS.LOGIN}`
  },

  // Person routes
  person: {
    root: () => `${BASE_PATH}/${APP_SEGMENTS.PERSON}`,
    byId: (params: PersonIdParam) => `${routes.person.root()}/${params.id}`,
    summary: (params: PersonIdParam) => `${routes.person.byId(params)}/${PERSON_SEGMENTS.SUMMARY}`,
    tasks: (params: PersonIdParam) => `${routes.person.byId(params)}/${PERSON_SEGMENTS.TASKS}`
  },

  organization: {
    root: () => `${BASE_PATH}/${APP_SEGMENTS.ORGANIZATIONS}`,
    byId: ({ id }: { id: string }) => `${routes.organization.root()}/${id}`
  },

  // Group routes
  groups: {
    root: () => `${BASE_PATH}/${APP_SEGMENTS.GROUPS}`,
    byId: (params: GroupIdParam) => `${routes.groups.root()}/${params.id}`
  },

  // Network routes
  network: {
    root: () => `${BASE_PATH}/${APP_SEGMENTS.NETWORK}`
  },

  // People routes
  people: {
    root: () => `${BASE_PATH}/${APP_SEGMENTS.PEOPLE}`
  },

  // Bookmarks routes
  bookmarks: {
    root: () => `${BASE_PATH}/${APP_SEGMENTS.BOOKMARKS}`
  },

  // Context routes
  context: {
    root: () => `${BASE_PATH}/${APP_SEGMENTS.CONTEXT}`
  },

  // Settings routes
  settings: {
    root: () => `${BASE_PATH}/${APP_SEGMENTS.SETTINGS}`,
    customFields: () => `${routes.settings.root()}/${SETTINGS_SEGMENTS.CUSTOM_FIELDS}`,
    integrations: () => `${routes.settings.root()}/${SETTINGS_SEGMENTS.INTEGRATIONS}`
  },

  // Onboarding routes
  onboarding: {
    root: () => `/${APP_SEGMENTS.ONBOARDING}`
  }
} as const;

// Path matching helpers
export const isPath = {
  home: (pathname: string) => pathname === routes.home(),
  person: (pathname: string) => pathname.startsWith(routes.person.root()),
  group: (pathname: string) => pathname.startsWith(routes.groups.root()),
  network: (pathname: string) => pathname.startsWith(routes.network.root()),
  people: (pathname: string) => pathname.startsWith(routes.people.root()),
  bookmarks: (pathname: string) => pathname.startsWith(routes.bookmarks.root()),
  context: (pathname: string) => pathname.startsWith(routes.context.root()),
  settings: (pathname: string) => pathname.startsWith(routes.settings.root()),
  onboarding: (pathname: string) => pathname.startsWith(routes.onboarding.root())
};

// Static routes for direct use
export const ROUTES = {
  HOME: routes.home(),
  LOGIN: routes.auth.login(),
  PERSON: routes.person.root(),
  GROUPS: routes.groups.root(),
  NETWORK: routes.network.root(),
  PEOPLE: routes.people.root(),
  BOOKMARKS: routes.bookmarks.root(),
  CONTEXT: routes.context.root(),
  SETTINGS: routes.settings.root(),
  ONBOARDING: routes.onboarding.root(),
  ORGANIZATIONS: routes.organization.root()
} as const;

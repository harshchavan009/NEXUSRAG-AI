/**
 * NexusRAG Client State Storage & Migration Utility
 * Provides versioned, validated access to localStorage with non-destructive fallback.
 */

export const STORAGE_SCHEMA_VERSION = 1;
const SCHEMA_VERSION_KEY = 'nexusrag_schema_version';

// Registered UI State Keys (Only client display preferences)
export const UI_STATE_KEYS = {
  THEME: 'nexusrag_theme',
  RAIL_EXPANDED: 'nexusrag_rail_expanded',
  ONBOARDING_DISMISSED: 'nexusrag_onboarding_dismissed',
  CITATION_VERIFIED: 'nexusrag_citation_verified',
  INSPECTOR_VISITED: 'nexusrag_inspector_visited',
  RETRIEVAL_PARAMS: 'nexusrag_retrieval_params',
};

/**
 * Initializes and migrates persisted storage safely.
 */
export function initStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const rawVersion = window.localStorage.getItem(SCHEMA_VERSION_KEY);
    const currentVersion = rawVersion ? parseInt(rawVersion, 10) : 0;

    if (currentVersion < STORAGE_SCHEMA_VERSION) {
      // Migrate from unversioned to schema version 1
      // Validate retrieval params if present
      const rawParams = window.localStorage.getItem(UI_STATE_KEYS.RETRIEVAL_PARAMS);
      if (rawParams) {
        try {
          const parsed = JSON.parse(rawParams);
          if (
            typeof parsed !== 'object' ||
            parsed === null ||
            typeof parsed.topK !== 'number'
          ) {
            window.localStorage.removeItem(UI_STATE_KEYS.RETRIEVAL_PARAMS);
          }
        } catch {
          window.localStorage.removeItem(UI_STATE_KEYS.RETRIEVAL_PARAMS);
        }
      }

      window.localStorage.setItem(SCHEMA_VERSION_KEY, String(STORAGE_SCHEMA_VERSION));
    }
  } catch (err) {
    console.warn('Storage migration failed, continuing with defaults:', err);
  }
}

/**
 * Safely retrieves an item from localStorage with validation.
 * Discards only the corrupted key if JSON parsing or validation fails.
 */
export function getUIState(key, defaultValue, validator = null) {
  if (typeof window === 'undefined' || !window.localStorage) return defaultValue;

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) return defaultValue;

    // Check if it's a JSON string
    if (raw.startsWith('{') || raw.startsWith('[') || raw === 'true' || raw === 'false') {
      try {
        const parsed = JSON.parse(raw);
        if (validator && typeof validator === 'function') {
          if (!validator(parsed)) {
            console.warn(`Corrupted storage key [${key}] discarded.`);
            window.localStorage.removeItem(key);
            return defaultValue;
          }
        }
        return parsed;
      } catch {
        // Not valid JSON, fall through to raw string
      }
    }

    if (validator && typeof validator === 'function') {
      if (!validator(raw)) {
        console.warn(`Corrupted storage key [${key}] discarded.`);
        window.localStorage.removeItem(key);
        return defaultValue;
      }
    }

    return raw;
  } catch (err) {
    console.warn(`Could not read storage key [${key}]:`, err);
    return defaultValue;
  }
}

/**
 * Safely writes an item to localStorage.
 */
export function setUIState(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const serialized = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
    window.localStorage.setItem(key, serialized);
  } catch (err) {
    console.warn(`Could not write storage key [${key}]:`, err);
  }
}

/**
 * Resets ONLY client UI view state keys without touching visitor identity,
 * session cookies, or user documents.
 */
export function resetLocalUIView() {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    Object.values(UI_STATE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
    window.localStorage.setItem(SCHEMA_VERSION_KEY, String(STORAGE_SCHEMA_VERSION));
  } catch (err) {
    console.warn('Could not reset local view state:', err);
  }
}


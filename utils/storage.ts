import { GameModes, UserPreferences, BestTimeRecord } from '../types.ts';

const STORAGE_KEY_PREFIX = 'lightsup_best_time_';

const getModeKey = (modes: GameModes): string => {
  return `${STORAGE_KEY_PREFIX}${modes.isRandom}_${modes.isHard}`;
};

export const getBestTime = (modes: GameModes): BestTimeRecord | null => {
  try {
    const key = getModeKey(modes);
    const storedRecord = localStorage.getItem(key);
    if (storedRecord) {
      const parsed = JSON.parse(storedRecord);
      // Handle legacy format where only a number was stored
      if (typeof parsed === 'number') {
        return { time: parsed, seed: '', isUserProvidedSeed: false };
      }
      // Handle records saved before isUserProvidedSeed was introduced
      if (typeof parsed.isUserProvidedSeed !== 'boolean') {
        // Assume any non-empty seed from the past was user-provided
        return { ...parsed, isUserProvidedSeed: !!parsed.seed };
      }
      return parsed as BestTimeRecord;
    }
    return null;
  } catch (error) {
    console.error("Failed to read best time from localStorage", error);
    return null;
  }
};

export const saveBestTime = (newTime: number, modes: GameModes, seed: string, isUserProvidedSeed: boolean) => {
  try {
    const key = getModeKey(modes);
    const existingRecord = getBestTime(modes);
    if (existingRecord === null || newTime < existingRecord.time) {
      const newRecord: BestTimeRecord = { time: newTime, seed, isUserProvidedSeed };
      localStorage.setItem(key, JSON.stringify(newRecord));
    }
  } catch (error) {
    console.error("Failed to save best time to localStorage", error);
  }
};

export const clearBestTime = (modes: GameModes) => {
    try {
        const key = getModeKey(modes);
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Failed to clear best time from localStorage", error);
    }
}

export const clearAllBestTimes = () => {
    try {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(STORAGE_KEY_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error("Failed to clear all best times from localStorage", error);
    }
}

const PREFERENCES_KEY = 'lightsup_user_preferences';

export const getDefaultPreferences = (): UserPreferences => ({
  showAnimations: true,
  showTimers: true,
  showMoveStats: true,
  countdownSeconds: 5,
});

export const getUserPreferences = (): UserPreferences => {
  try {
    const storedPrefs = localStorage.getItem(PREFERENCES_KEY);
    if (storedPrefs) {
      // Merge with defaults to ensure all keys are present if new prefs are added
      return { ...getDefaultPreferences(), ...JSON.parse(storedPrefs) };
    }
    return getDefaultPreferences();
  } catch (error) {
    console.error("Failed to read user preferences from localStorage", error);
    return getDefaultPreferences();
  }
};

export const saveUserPreferences = (prefs: UserPreferences) => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error("Failed to save user preferences to localStorage", error);
  }
};
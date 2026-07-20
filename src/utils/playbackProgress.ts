const STORAGE_KEY = "xcaption_playback_positions";

export const SAVE_INTERVAL_MS = 5000;

type PlaybackMap = Record<string, number>;

export const getSavedPosition = (videoId: string): number | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const map: PlaybackMap = stored ? JSON.parse(stored) : {};
    const position = map[videoId];
    return typeof position === "number" && position > 0 ? position : null;
  } catch {
    return null;
  }
};

export const savePosition = (videoId: string, seconds: number): void => {
  if (seconds <= 0) return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const map: PlaybackMap = stored ? JSON.parse(stored) : {};
    map[videoId] = Math.round(seconds * 10) / 10;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.error("Failed to save playback position:", error);
  }
};

export const clearPosition = (videoId: string): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const map: PlaybackMap = JSON.parse(stored);
    delete map[videoId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.error("Failed to clear playback position:", error);
  }
};

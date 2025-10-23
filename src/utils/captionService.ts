import { Caption } from "../types";

// Constants
const TIME_TOLERANCE = 0.1; // Seconds tolerance for caption timing
const CLICKED_CAPTION_TIMEOUT = 2000; // How long to prioritize clicked captions
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL || "https://your-app-name.railway.app"
    : "http://localhost:8000";

// Format seconds to MM:SS display format
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Fetch captions from the Python backend using yt-dlp
export const fetchCaptions = async (videoId: string): Promise<Caption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/captions/${videoId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch captions");
    }

    const data = await response.json();
    return data.captions;
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw with more context
      if (error.message.includes("Failed to fetch")) {
        throw new Error(
          "Cannot connect to caption service. Make sure the backend server is running on port 8000."
        );
      }
      throw error;
    }
    throw new Error("Failed to fetch captions");
  }
};

// Parse SRT subtitle format into Caption objects
export const parseSRTContent = (srtText: string): Caption[] => {
  const captions: Caption[] = [];
  const blocks = srtText.trim().split("\n\n");

  blocks.forEach((block) => {
    const lines = block.split("\n");
    if (lines.length >= 3) {
      const timeMatch = lines[1].match(
        /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/
      );

      if (timeMatch) {
        const [, startTime, endTime] = timeMatch;
        const text = lines
          .slice(2)
          .join(" ")
          .replace(/<[^>]*>/g, "") // Remove HTML tags
          .trim();

        captions.push({
          start: convertSRTTimeToSeconds(startTime),
          end: convertSRTTimeToSeconds(endTime),
          text,
          startTimeString: startTime,
          endTimeString: endTime,
        });
      }
    }
  });

  return captions.sort((a, b) => a.start - b.start); // Ensure chronological order
};

// Convert SRT time format (HH:MM:SS,mmm) to seconds
const convertSRTTimeToSeconds = (timeString: string): number => {
  const [time, milliseconds] = timeString.split(",");
  const [hours, minutes, seconds] = time.split(":").map(Number);
  const totalSeconds =
    hours * 3600 + minutes * 60 + seconds + parseInt(milliseconds) / 1000;

  // Round to 1 decimal place to match YouTube player precision
  return Math.round(totalSeconds * 10) / 10;
};

export { TIME_TOLERANCE, CLICKED_CAPTION_TIMEOUT };

import React, { useState, useRef } from "react";
import YouTubeInput from "./components/YouTubeInput";
import YouTubePlayer from "./components/YouTubePlayer";
import CaptionDisplay from "./components/CaptionDisplay";
import CaptionUpload from "./components/CaptionUpload";
import { fetchCaptions, CLICKED_CAPTION_TIMEOUT } from "./utils/captionService";
import { Caption, YouTubePlayerInstance } from "./types";
import "./App.css";

// Player state constants
const PLAYER_STATE = {
  PAUSED: 2,
  PLAYING: 1,
} as const;

const App: React.FC = () => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isLoadingCaptions, setIsLoadingCaptions] = useState<boolean>(false);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [lastClickedCaption, setLastClickedCaption] = useState<Caption | null>(
    null
  );
  const playerRef = useRef<YouTubePlayerInstance | null>(null);

  const handleVideoLoad = async (id: string): Promise<void> => {
    setVideoId(id);
    setIsLoadingCaptions(true);
    setCaptions([]);
    setCurrentTime(0);

    try {
      const fetchedCaptions = await fetchCaptions(id);
      setCaptions(fetchedCaptions);
    } catch (error) {
      setCaptions([]);
    } finally {
      setIsLoadingCaptions(false);
    }
  };

  const handleTimeUpdate = (time: number): void => {
    // Round to 1 decimal place for consistency
    const roundedTime = Math.round(time * 10) / 10;

    // Prevent time jumping backwards (unless it's a significant jump like seeking or we're currently seeking)
    if (
      isSeeking ||
      roundedTime >= currentTime ||
      Math.abs(roundedTime - currentTime) > 1
    ) {
      setCurrentTime(roundedTime);

      // Clear seeking flag after successful time update
      if (isSeeking) {
        setIsSeeking(false);
      }
    }
  };

  const handleCaptionClick = (time: number, clickedCaption?: Caption): void => {
    if (playerRef.current) {
      // Remember which caption was clicked
      if (clickedCaption) {
        setLastClickedCaption(clickedCaption);

        // Clear after timeout
        setTimeout(() => setLastClickedCaption(null), CLICKED_CAPTION_TIMEOUT);
      }

      // Set seeking flag to allow time updates during seek
      setIsSeeking(true);

      // Check if video is paused and auto-play after seeking
      const playerState = playerRef.current.getPlayerState();
      const isPaused = playerState === PLAYER_STATE.PAUSED;

      try {
        // Method 1: Standard seek
        playerRef.current.seekTo(time, true);

        // Method 2: Small offset to ensure proper seeking and auto-play if paused
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.seekTo(time, true);
            setCurrentTime(time);

            // Auto-play if video was paused
            if (isPaused) {
              playerRef.current.playVideo();
            }
          }
        }, 100);
      } catch (error) {
        console.error("Seek error:", error);
      }
    }
  };

  const handlePlayerReady = (player: YouTubePlayerInstance): void => {
    playerRef.current = player;
  };

  const handleCaptionsUpload = (uploadedCaptions: Caption[]): void => {
    setCaptions(uploadedCaptions);
    setCurrentTime(0);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <h1 className="app-title">XCaption</h1>
        </header>

        <main className="main-content">
          <div className="video-section">
            <YouTubeInput onVideoLoad={handleVideoLoad} />
            <CaptionUpload onCaptionsLoad={handleCaptionsUpload} />
            <YouTubePlayer
              videoId={videoId}
              onTimeUpdate={handleTimeUpdate}
              onPlayerReady={handlePlayerReady}
              playerRef={playerRef}
            />
          </div>

          <CaptionDisplay
            captions={captions}
            currentTime={currentTime}
            onCaptionClick={handleCaptionClick}
            isLoading={isLoadingCaptions}
            lastClickedCaption={lastClickedCaption}
          />
        </main>
      </div>
    </div>
  );
};

export default App;

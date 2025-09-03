import React, { useState, useRef, useEffect, useCallback } from "react";
import YouTubeInput from "./components/YouTubeInput";
import YouTubePlayer from "./components/YouTubePlayer";
import CaptionDisplay from "./components/CaptionDisplay";
import CaptionUpload from "./components/CaptionUpload";
import ThemeToggle from "./components/ThemeToggle";
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

      try {
        // Method 1: Standard seek
        playerRef.current.seekTo(time, true);

        // Method 2: Small offset to ensure proper seeking
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.seekTo(time, true);
            setCurrentTime(time);
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

  // Mobile control functions
  const navigateToPreviousCaption = useCallback(() => {
    if (captions.length > 0) {
      // Find the most recent caption that has started (even if it has ended)
      const startedCaptions = captions.filter(
        (caption) => currentTime >= caption.start
      );
      let currentCaptionIndex = -1;

      if (startedCaptions.length > 0) {
        // Get the most recent caption that started
        const mostRecentCaption = startedCaptions[startedCaptions.length - 1];
        currentCaptionIndex = captions.findIndex(
          (caption) => caption.start === mostRecentCaption.start
        );
      }

      let previousIndex;
      if (currentCaptionIndex === -1 || currentCaptionIndex === 0) {
        // If no caption has started or at first caption, go to last caption
        previousIndex = captions.length - 1;
      } else {
        // Go to previous caption
        previousIndex = currentCaptionIndex - 1;
      }

      handleCaptionClick(
        captions[previousIndex].start,
        captions[previousIndex]
      );
    }
  }, [captions, currentTime, handleCaptionClick]);

  const navigateToNextCaption = useCallback(() => {
    if (captions.length > 0) {
      // Find the most recent caption that has started (even if it has ended)
      const startedCaptions = captions.filter(
        (caption) => currentTime >= caption.start
      );
      let currentCaptionIndex = -1;

      if (startedCaptions.length > 0) {
        // Get the most recent caption that started
        const mostRecentCaption = startedCaptions[startedCaptions.length - 1];
        currentCaptionIndex = captions.findIndex(
          (caption) => caption.start === mostRecentCaption.start
        );
      }

      let nextIndex;
      if (
        currentCaptionIndex === -1 ||
        currentCaptionIndex === captions.length - 1
      ) {
        // If no caption has started or at last caption, go to first caption
        nextIndex = 0;
      } else {
        // Go to next caption
        nextIndex = currentCaptionIndex + 1;
      }

      handleCaptionClick(captions[nextIndex].start, captions[nextIndex]);
    }
  }, [captions, currentTime, handleCaptionClick]);

  const togglePlayPause = useCallback(() => {
    if (playerRef.current) {
      try {
        const playerState = playerRef.current.getPlayerState();
        if (playerState === PLAYER_STATE.PLAYING) {
          playerRef.current.pauseVideo();
        } else if (playerState === PLAYER_STATE.PAUSED) {
          playerRef.current.playVideo();
        }
      } catch (error) {
        console.error("Error toggling playback:", error);
      }
    }
  }, [playerRef]);

  const getPlayerState = useCallback(() => {
    if (playerRef.current) {
      try {
        return playerRef.current.getPlayerState();
      } catch (error) {
        console.error("Error getting player state:", error);
      }
    }
    return null;
  }, [playerRef]);

  // Keyboard navigation handlers
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Prevent default behavior if we're handling the key
      if (
        event.code === "ArrowUp" ||
        event.code === "ArrowDown" ||
        event.code === "Space"
      ) {
        event.preventDefault();
      }

      if (event.code === "Space") {
        togglePlayPause();
      } else if (event.code === "ArrowUp") {
        navigateToPreviousCaption();
      } else if (event.code === "ArrowDown") {
        navigateToNextCaption();
      }
    },
    [togglePlayPause, navigateToPreviousCaption, navigateToNextCaption]
  );

  // Set up keyboard event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="app">
      <ThemeToggle />
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

          {/* Mobile control buttons */}
          <div className="mobile-controls">
            <button
              className="mobile-control-btn"
              onClick={navigateToPreviousCaption}
              disabled={!captions.length}
              title="Previous caption (↑)"
            >
              ⬆️
            </button>
            <button
              className="mobile-control-btn"
              onClick={navigateToNextCaption}
              disabled={!captions.length}
              title="Next caption (↓)"
            >
              ⬇️
            </button>
            <button
              className="mobile-control-btn"
              onClick={togglePlayPause}
              disabled={!captions.length}
              title={
                getPlayerState() === 1
                  ? "Pause video (Space)"
                  : "Play video (Space)"
              }
            >
              {getPlayerState() === 1 ? "⏸️" : "▶️"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

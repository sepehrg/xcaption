import React, { useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { YouTubePlayerProps, YouTubeEvent } from "../types";
import "./YouTubePlayer.css";

// Constants
const TIME_UPDATE_INTERVAL = 100; // ms
const PLAYER_STATE = {
  PLAYING: 1,
} as const;

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  onTimeUpdate,
  onPlayerReady,
  playerRef,
}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const onReady = (event: YouTubeEvent) => {
    if (playerRef) {
      playerRef.current = event.target;
    }
    if (onPlayerReady) {
      onPlayerReady(event.target);
    }

    // Start time update interval
    intervalRef.current = setInterval(() => {
      if (
        event.target &&
        event.target.getCurrentTime &&
        event.target.getPlayerState
      ) {
        const currentTime = event.target.getCurrentTime();
        const playerState = event.target.getPlayerState();

        // Only update time when video is playing and time > 0
        if (playerState === PLAYER_STATE.PLAYING && currentTime > 0) {
          if (onTimeUpdate) {
            // Round to avoid floating point precision issues
            const roundedTime = Math.round(currentTime * 10) / 10;
            onTimeUpdate(roundedTime);
          }
        }
      }
    }, TIME_UPDATE_INTERVAL);
  };

  const onStateChange = (event: YouTubeEvent) => {
    // Handle player state changes if needed
  };

  const onError = (event: YouTubeEvent) => {
    console.error("YouTube player error:", event.data);
  };

  useEffect(() => {
    return () => {
      // Cleanup interval on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const opts = {
    height: "400",
    width: "100%",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      cc_load_policy: 0, // Disable default captions since we're showing our own
    },
  };

  if (!videoId) {
    return (
      <div className="youtube-player-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">📺</div>
          <h3>Enter a YouTube URL to get started</h3>
          <p>
            Paste any YouTube video URL above to load the video and view
            interactive captions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="youtube-player-container">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        onError={onError}
        className="youtube-player"
      />
    </div>
  );
};

export default YouTubePlayer;

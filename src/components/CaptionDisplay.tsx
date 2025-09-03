import React, { useEffect, useRef } from "react";
import { formatTime, TIME_TOLERANCE } from "../utils/captionService";
import { CaptionDisplayProps, Caption } from "../types";
import "./CaptionDisplay.css";

const CaptionDisplay: React.FC<CaptionDisplayProps> = ({
  captions,
  currentTime,
  onCaptionClick,
  isLoading,
  lastClickedCaption,
}) => {
  const activeCaptionRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Find active caption - keep highlighting until next caption starts
  let activeCaption: Caption | null = null;

  // Prioritize the last clicked caption if it's still valid at current time
  if (
    lastClickedCaption &&
    currentTime >= lastClickedCaption.start - TIME_TOLERANCE &&
    currentTime <= lastClickedCaption.end + TIME_TOLERANCE
  ) {
    activeCaption = lastClickedCaption;
  } else {
    // Find the most recent caption that has started (and keep it highlighted until next one starts)
    const startedCaptions = captions.filter(
      (caption) => currentTime >= caption.start
    );
    if (startedCaptions.length > 0) {
      // Get the most recent caption that started
      activeCaption = startedCaptions[startedCaptions.length - 1];
    }
  }

  // Auto-scroll to keep active caption centered
  useEffect(() => {
    if (!activeCaptionRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const activeElement = activeCaptionRef.current;

    const scrollToCenter = () => {
      // Always center the active caption
      activeElement.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    };

    // Debounce scroll updates
    const timeoutId = setTimeout(scrollToCenter, 100);
    return () => clearTimeout(timeoutId);
  }, [activeCaption]);

  const handleCaptionClick = (caption: Caption) => {
    if (onCaptionClick) {
      onCaptionClick(caption.start, caption);
    }
  };

  if (isLoading) {
    return (
      <div className="captions-section">
        <h3 className="captions-title">Captions</h3>
        <div className="loading-captions">
          <div className="loading-spinner"></div>
          <p>Loading captions...</p>
          <small>This may take a few seconds</small>
        </div>
      </div>
    );
  }

  if (!captions || captions.length === 0) {
    return (
      <div className="captions-section">
        <h3 className="captions-title">Captions</h3>
        <div className="no-captions">
          <div className="no-captions-icon">💬</div>
          <p>No captions available</p>
          <small>
            This video doesn't have captions or they couldn't be fetched
          </small>
          <div className="no-captions-note">
            <strong>💡 Note:</strong> Captions will appear here when a video is
            loaded
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="captions-section" ref={containerRef}>
      <h3 className="captions-title">Captions</h3>

      <div className="captions-list">
        {captions.map((caption, index) => {
          const isActive =
            activeCaption && activeCaption.start === caption.start;

          return (
            <div
              key={index}
              ref={isActive ? activeCaptionRef : null}
              className={`caption-item ${isActive ? "active" : ""}`}
              onClick={() => handleCaptionClick(caption)}
              title="Click to jump to this moment in the video"
            >
              <div className="caption-timestamp">
                {formatTime(caption.start)}
              </div>
              <div className="caption-text">{caption.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaptionDisplay;

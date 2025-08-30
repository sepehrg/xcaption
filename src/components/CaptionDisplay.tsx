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

  // Find captions that match the current time with tolerance for precision
  const candidateCaptions = captions.filter(
    (caption) =>
      currentTime >= caption.start - TIME_TOLERANCE &&
      currentTime <= caption.end + TIME_TOLERANCE
  );

  // Prioritize the last clicked caption if it's still valid at current time
  let activeCaption: Caption | null = null;

  if (lastClickedCaption && candidateCaptions.includes(lastClickedCaption)) {
    activeCaption = lastClickedCaption;
  } else if (candidateCaptions.length > 0) {
    // If multiple captions, pick the one with start time closest to current time
    activeCaption = candidateCaptions.reduce((closest, current) =>
      Math.abs(current.start - currentTime) <
      Math.abs(closest.start - currentTime)
        ? current
        : closest
    );
  }

  // Scroll to active caption
  useEffect(() => {
    if (activeCaptionRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeElement = activeCaptionRef.current;

      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const elementTop = activeElement.offsetTop;
      const elementBottom = elementTop + activeElement.clientHeight;

      // Check if element is not fully visible
      if (elementTop < containerTop || elementBottom > containerBottom) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
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

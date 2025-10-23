import React, { useState, useEffect, useRef } from "react";
import { YouTubeInputProps } from "../types";
import { parseSRTContent } from "../utils/captionService";
import "./YouTubeInput.css";

const RECENT_URLS_KEY = "xcaption_recent_urls";
const MAX_RECENT_URLS = 10;

// Local storage utility functions
const getRecentUrls = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_URLS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentUrl = (url: string): void => {
  try {
    const recentUrls = getRecentUrls();
    // Remove if already exists to avoid duplicates
    const filteredUrls = recentUrls.filter((recentUrl) => recentUrl !== url);
    // Add to beginning of array
    const updatedUrls = [url, ...filteredUrls].slice(0, MAX_RECENT_URLS);
    localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(updatedUrls));
  } catch (error) {
    console.error("Failed to save recent URL:", error);
  }
};

const deleteRecentUrl = (urlToDelete: string): void => {
  try {
    const recentUrls = getRecentUrls();
    const filteredUrls = recentUrls.filter((url) => url !== urlToDelete);
    localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(filteredUrls));
  } catch (error) {
    console.error("Failed to delete recent URL:", error);
  }
};

const YouTubeInput: React.FC<YouTubeInputProps> = ({
  onVideoLoad,
  onCaptionsLoad,
}) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load recent URLs on component mount
  useEffect(() => {
    setRecentUrls(getRecentUrls());
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setShowDropdown(false);

    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setIsLoading(true);
    try {
      await onVideoLoad(videoId);
      // Save URL to recent list on successful load
      saveRecentUrl(url);
      setRecentUrls(getRecentUrls());
    } catch (err) {
      setError("Failed to load video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputFocus = () => {
    if (recentUrls.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleRecentUrlClick = (recentUrl: string) => {
    setUrl(recentUrl);
    setShowDropdown(false);
    // Auto-submit when selecting from recent URLs
    const videoId = extractVideoId(recentUrl);
    if (videoId) {
      onVideoLoad(videoId)
        .then(() => {
          saveRecentUrl(recentUrl);
          setRecentUrls(getRecentUrls());
        })
        .catch(() => {
          setError("Failed to load video. Please try again.");
        });
    }
  };

  const handleDeleteRecentUrl = (e: React.MouseEvent, urlToDelete: string) => {
    e.stopPropagation();
    deleteRecentUrl(urlToDelete);
    setRecentUrls(getRecentUrls());
  };

  const isValidYouTubeUrl = (url: string): boolean => {
    return extractVideoId(url) !== null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const captions = parseSRTContent(content);
      onCaptionsLoad(captions);
    };
    reader.readAsText(file);
  };

  return (
    <div className="youtube-input-container">
      <form onSubmit={handleSubmit} className="youtube-form">
        <div className="input-row">
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="Enter YouTube URL"
              className="youtube-input"
              disabled={isLoading}
            />
            {showDropdown && recentUrls.length > 0 && (
              <div ref={dropdownRef} className="recent-urls-dropdown">
                <div className="dropdown-header">Recent URLs</div>
                {recentUrls.map((recentUrl, index) => (
                  <div
                    key={index}
                    className="recent-url-item"
                    onClick={() => handleRecentUrlClick(recentUrl)}
                  >
                    <span className="recent-url-text" title={recentUrl}>
                      {recentUrl}
                    </span>
                    <button
                      type="button"
                      className="delete-url-btn"
                      onClick={(e) => handleDeleteRecentUrl(e, recentUrl)}
                      title="Delete this URL"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? "Loading..." : "Load Video"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".srt,.vtt,text/plain,text/srt,text/vtt,application/x-subrip,.txt"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="upload-button"
          >
            📁 Upload Caption
          </button>
        </div>
      </form>

      <small className="upload-help">
        Upload subtitle/caption files (.srt, .vtt, or .txt)
        <br />
        💡 On iPhone: Save captions as .txt if .srt doesn't work
      </small>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default YouTubeInput;

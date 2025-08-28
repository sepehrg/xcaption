import React, { useState } from 'react';
import { YouTubeInputProps } from '../types';
import './YouTubeInput.css';

const YouTubeInput: React.FC<YouTubeInputProps> = ({ onVideoLoad }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
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
    setError('');
    
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);
    try {
      await onVideoLoad(videoId);
    } catch (err) {
      setError('Failed to load video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="youtube-input-container">
      <form onSubmit={handleSubmit} className="youtube-form">
        <div className="input-group">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
            className="youtube-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? 'Loading...' : 'Load Video'}
          </button>
        </div>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default YouTubeInput;

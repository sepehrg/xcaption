export interface Caption {
  start: number;
  end: number;
  text: string;
  startTimeString: string;
  endTimeString: string;
}

export interface YouTubePlayerInstance {
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
  getDuration: () => number;
}

export interface YouTubeEvent {
  target: YouTubePlayerInstance;
  data: number;
}

export interface YouTubePlayerProps {
  videoId: string | null;
  onTimeUpdate?: (currentTime: number) => void;
  onPlayerReady?: (player: YouTubePlayerInstance) => void;
  playerRef?: React.MutableRefObject<YouTubePlayerInstance | null>;
}

export interface YouTubeInputProps {
  onVideoLoad: (videoId: string) => Promise<void>;
}

export interface CaptionDisplayProps {
  captions: Caption[];
  currentTime: number;
  onCaptionClick?: (time: number, caption?: Caption) => void;
  isLoading?: boolean;
  lastClickedCaption?: Caption | null;
}

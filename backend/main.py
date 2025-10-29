from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import subprocess
import json
import tempfile
import re
import os

app = FastAPI(title="XCaption API", version="1.0.0")

# Configure CORS - more permissive for debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def parse_srt_content(srt_text: str) -> List[Dict]:
    """Parse SRT subtitle format into caption objects."""
    captions = []
    
    # Split by double newlines to get individual caption blocks
    blocks = srt_text.strip().split('\n\n')
    
    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) >= 3:
            # First line is the sequence number
            # Second line is the timestamp
            # Remaining lines are the text
            timestamp_line = lines[1]
            text_lines = lines[2:]
            
            # Parse timestamp (format: 00:00:00,000 --> 00:00:00,000)
            time_match = re.match(r'(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})', timestamp_line)
            
            if time_match:
                start_time_str, end_time_str = time_match.groups()
                text = ' '.join(text_lines).strip()
                
                # Convert time strings to seconds
                start_seconds = convert_srt_time_to_seconds(start_time_str)
                end_seconds = convert_srt_time_to_seconds(end_time_str)
                
                if text:  # Only add non-empty captions
                    captions.append({
                        "start": round(start_seconds, 1),
                        "end": round(end_seconds, 1),
                        "text": text,
                        "startTimeString": start_time_str,
                        "endTimeString": end_time_str,
                    })
    
    return captions


def convert_srt_time_to_seconds(time_string: str) -> float:
    """Convert SRT time format (HH:MM:SS,mmm) to seconds."""
    # Split by comma to separate seconds and milliseconds
    time_part, milliseconds = time_string.split(',')
    
    # Split time part by colons
    hours, minutes, seconds = map(int, time_part.split(':'))
    
    # Calculate total seconds
    total_seconds = hours * 3600 + minutes * 60 + seconds + int(milliseconds) / 1000
    
    return total_seconds


def download_captions_with_ytdlp(video_id: str, language: str = "en") -> List[Dict]:
    """Download captions using yt-dlp."""
    try:
        # Create a temporary directory for the output
        with tempfile.TemporaryDirectory() as temp_dir:
            # Build the yt-dlp command
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            
            cmd = [
                "yt-dlp",
                "--write-subs",
                "--write-auto-subs",  # Also try auto-generated captions
                "--sub-langs", f"{language},en",  # Try requested language first, then English
                "--sub-format", "srt",
                "--skip-download",
                "--output", os.path.join(temp_dir, "%(title)s.%(ext)s"),
                video_url
            ]
            
            print(f"Running command: {' '.join(cmd)}")
            
            # Run yt-dlp
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode != 0:
                print(f"yt-dlp error: {result.stderr}")
                raise Exception(f"yt-dlp failed: {result.stderr}")
            
            # Look for downloaded subtitle files
            srt_files = []
            for file in os.listdir(temp_dir):
                if file.endswith('.srt'):
                    srt_files.append(os.path.join(temp_dir, file))
            
            if not srt_files:
                raise Exception("No subtitle files found")
            
            # Read the first SRT file found
            with open(srt_files[0], 'r', encoding='utf-8') as f:
                srt_content = f.read()
            
            # Parse the SRT content
            captions = parse_srt_content(srt_content)
            
            if not captions:
                raise Exception("No captions found in subtitle file")
            
            return captions
            
    except subprocess.TimeoutExpired:
        raise Exception("Caption download timed out")
    except FileNotFoundError:
        raise Exception("yt-dlp not found. Please install it: pip install yt-dlp")
    except Exception as e:
        raise Exception(f"Failed to download captions: {str(e)}")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "XCaption API",
        "version": "1.0.0"
    }


@app.get("/api/captions/{video_id}")
async def get_captions(video_id: str, lang: str = "en"):
    """
    Fetch captions for a YouTube video using yt-dlp.
    No authentication required - yt-dlp works without API keys!
    
    Args:
        video_id: YouTube video ID
        lang: Language code (default: en)
    
    Returns:
        List of caption objects with start, end, text, and time strings
    """
    try:
        print(f"Fetching captions for video ID: {video_id}")
        
        # Use yt-dlp to download captions
        captions = download_captions_with_ytdlp(video_id, lang)
        
        return {
            "success": True,
            "videoId": video_id,
            "language": lang,
            "captions": captions,
            "count": len(captions)
        }
        
    except Exception as e:
        print(f"Error fetching captions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch captions: {str(e)}"
        )


@app.get("/api/video-info/{video_id}")
async def get_video_info(video_id: str):
    """Get basic video information using yt-dlp."""
    try:
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        
        # Get video info using yt-dlp
        cmd = [
            "yt-dlp",
            "--dump-json",
            "--no-download",
            video_url
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        
        if result.returncode != 0:
            raise Exception(f"Failed to get video info: {result.stderr}")
        
        video_info = json.loads(result.stdout)
        
        return {
            "videoId": video_id,
            "title": video_info.get('title', 'Unknown'),
            "uploader": video_info.get('uploader', 'Unknown'),
            "duration": video_info.get('duration', 0),
            "view_count": video_info.get('view_count', 0),
            "description": video_info.get('description', '')[:200] + '...' if video_info.get('description') else '',
        }
        
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Request timed out")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="yt-dlp not found. Please install it: pip install yt-dlp")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get video info: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

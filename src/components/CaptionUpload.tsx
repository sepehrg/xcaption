import React, { useRef } from "react";
import { Caption } from "../types";
import { parseSRTContent } from "../utils/captionService";
import "./CaptionUpload.css";

interface CaptionUploadProps {
  onCaptionsLoad: (captions: Caption[]) => void;
}

const CaptionUpload: React.FC<CaptionUploadProps> = ({ onCaptionsLoad }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="caption-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept=".srt,.vtt,text/plain,text/srt,text/vtt,application/x-subrip,.txt"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="upload-button"
      >
        📁 Upload Caption File
      </button>
      <small className="upload-help">
        Choose SRT, VTT, or TXT files with subtitle content
        <br />
        💡 On iPhone: Save captions as .txt if .srt doesn't work
      </small>
    </div>
  );
};

export default CaptionUpload;

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
        accept=".srt,.vtt"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="upload-button"
      >
        📁 Upload Caption File (SRT/VTT)
      </button>
      <small className="upload-help">
        Upload a subtitle file to see interactive captions
      </small>
    </div>
  );
};

export default CaptionUpload;

// components/DocumentPreview.jsx
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export default function DocumentPreview({
  file,
  previewUrl,
  activeTab,
  translatedContent,
  isLoadingTranslation,
}) {
  if (!file) return null;

  const mimeType = file.type;

  if (activeTab === "preview") {
    if (mimeType.startsWith("image/")) {
      return <ImagePreview previewUrl={previewUrl} />;
    }

    if (mimeType === "application/pdf") {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-full"
          title="PDF Preview"
        />
      );
    }

    return (
      <div className="p-4 text-center">
        <p className="text-gray-700 dark:text-slate-300 mb-2">
          Preview not supported for this file type.
        </p>
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-600 dark:text-cyan-400 hover:underline"
        >
          Download File
        </a>
      </div>
    );
  }

  if (activeTab === "translation") {
    return (
      <div className="p-4 h-full overflow-auto bg-white dark:bg-slate-800">
        {isLoadingTranslation ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-8 h-8 text-cyan-500 dark:text-cyan-400 animate-spin" />
            <span className="ml-2">Translating document...</span>
          </div>
        ) : translatedContent ? (
          <pre className="whitespace-pre-wrap font-sans">
            {translatedContent}
          </pre>
        ) : (
          <div className="text-gray-500 dark:text-slate-400 italic text-center py-8">
            Translation will appear here when available
          </div>
        )}
      </div>
    );
  }

  return null;
}

const ImagePreview = ({ previewUrl }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    setZoom(Math.min(Math.max(0.5, zoom + delta), 3));
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      className="w-full h-full overflow-hidden relative"
      onWheel={handleZoom}
    >
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <Button variant="outline" onClick={resetZoom}>
          Reset Zoom
        </Button>
        <div className="bg-white/80 px-3 py-1 rounded-md text-xs">
          Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>
      <img
        src={previewUrl}
        alt="Preview"
        className="w-full h-full object-contain"
        style={{ transform: `scale(${zoom})` }}
      />
    </div>
  );
};
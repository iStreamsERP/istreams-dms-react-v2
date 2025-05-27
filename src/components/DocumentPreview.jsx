import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import React, { useEffect } from "react";

const DocumentPreview = ({ fileUrl }) => {
  useEffect(() => {
    return () => {
      if (fileUrl && fileUrl.startsWith("blob:")) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  if (!fileUrl) return null;

  return (
    <div className="w-full h-full">
      <DocViewer
        documents={[{ uri: fileUrl }]}
        pluginRenderers={DocViewerRenderers}
        config={{
          header: {
            disableHeader: true,
          },
          loadingRenderer: {
            showLoadingTimeout: 0,
          },
        }}
      />
    </div>
  );
};

export default DocumentPreview;

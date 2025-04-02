import React, { useEffect, useRef } from 'react';

interface PreviewProps {
  html: string;
  css: string;
}

const Preview: React.FC<PreviewProps> = ({ html, css }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>${css}</style>
            </head>
            <body>
              ${html}
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    }
  }, [html, css]);

  return (
    <div className="border border-gray-300 rounded bg-white">
      <iframe 
        ref={iframeRef}
        className="w-full h-80"
        title="HTML Preview"
        sandbox="allow-same-origin"
      />
    </div>
  );
};

export default Preview;
import React, { useState } from 'react';

interface FigmaClipboardProps {
  data: string;
}

const FigmaClipboard: React.FC<FigmaClipboardProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!data) return;
    
    try {
      // For this special format, we need to use the clipboard API with HTML format
      // Standard clipboard.writeText won't preserve the HTML structure
      
      // Create a Blob containing the HTML
      const blob = new Blob([data], { type: 'text/html' });
      
      // Create a ClipboardItem with the HTML format
      const item = new ClipboardItem({
        'text/html': blob
      });
      
      // Write to clipboard using the clipboard API
      await navigator.clipboard.write([item]);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      
      // Fallback method using a temporary element
      try {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = data;
        tempElement.style.position = 'fixed';
        tempElement.style.left = '-9999px';
        document.body.appendChild(tempElement);
        
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(tempElement);
        
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
          document.execCommand('copy');
          selection.removeAllRanges();
        }
        
        document.body.removeChild(tempElement);
        
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback clipboard copy failed:', fallbackErr);
        alert('Copying to clipboard failed. Your browser may not support this feature.');
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">Figma Clipboard Data</span>
        <button
          onClick={copyToClipboard}
          disabled={!data}
          className={`px-3 py-1 text-sm rounded ${
            data 
              ? copied 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
      <div className="p-3 bg-gray-50 border border-gray-300 rounded">
        <p className="text-sm text-gray-600">
          This generates Figma-compatible clipboard data. When you click "Copy to Clipboard", you can paste directly into Figma with Ctrl+V/Cmd+V.
        </p>
      </div>
      <p className="text-sm text-gray-600">
        {data ? 'Figma clipboard data ready. Copy it and paste directly into Figma.' : 'Generate content to create Figma clipboard data.'}
      </p>
    </div>
  );
};

export default FigmaClipboard;
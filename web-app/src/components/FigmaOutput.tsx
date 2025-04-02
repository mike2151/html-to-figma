import React, { useState } from 'react';

interface FigmaOutputProps {
  data: string;
}

const FigmaOutput: React.FC<FigmaOutputProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!data) return;
    
    navigator.clipboard.writeText(data)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">Figma-compatible JSON data</span>
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
      <div className="relative">
        <pre className="w-full h-80 p-3 overflow-auto bg-gray-100 border border-gray-300 rounded font-mono text-sm">
          {data || 'Generate Figma data to see output here...'}
        </pre>
        {!data && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none">
            No data generated yet
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600">
        Copy this data to your clipboard, then in Figma, use Edit &gt; Paste to paste the generated elements.
      </p>
    </div>
  );
};

export default FigmaOutput;
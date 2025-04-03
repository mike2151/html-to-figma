import React, { useState } from 'react';
import { parseFigmaClipboardData } from '../lib/figma-clipboard-utils';

const FigmaAnalyzer: React.FC = () => {
  const [clipboardText, setClipboardText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const analyzeClipboard = async () => {
    try {
      // Try to get clipboard content
      const text = await navigator.clipboard.readText();
      setClipboardText(text);
      
      // Parse the Figma clipboard data
      const result = parseFigmaClipboardData(text);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      alert('Unable to read clipboard. Please make sure you have copied Figma content and your browser supports clipboard access.');
    }
  };

  const analyzeText = () => {
    if (!clipboardText) return;
    
    try {
      // Parse the input text as Figma clipboard data
      const result = parseFigmaClipboardData(clipboardText);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Failed to analyze text:', error);
      setAnalysisResult({ error: 'Failed to parse as Figma clipboard data' });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="font-medium text-lg mb-3">Figma Clipboard Analyzer</h3>
      
      <button
        onClick={analyzeClipboard}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded mb-4"
      >
        Analyze Current Clipboard
      </button>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Or paste Figma clipboard content here:
        </label>
        <textarea
          className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
          value={clipboardText}
          onChange={(e) => setClipboardText(e.target.value)}
          placeholder="Paste Figma clipboard content here..."
        />
        <button
          onClick={analyzeText}
          className="mt-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm"
        >
          Analyze Text
        </button>
      </div>
      
      {analysisResult && (
        <div>
          <h4 className="font-medium mb-2">Analysis Result:</h4>
          <div className="bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-60">
            <pre className="text-xs">{JSON.stringify(analysisResult, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default FigmaAnalyzer;
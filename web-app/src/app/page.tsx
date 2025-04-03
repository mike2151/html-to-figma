'use client';

import { useState } from 'react';
import HtmlInput from '../components/HtmlInput';
import CssInput from '../components/CssInput';
import Preview from '../components/Preview';
import FigmaOutput from '../components/FigmaOutput';
import FigmaClipboard from '../components/FigmaClipboard';
import FigmaClipboardTester from '../components/FigmaClipboardTester';
import FigmaAnalyzer from '../components/FigmaAnalyzer';
import { convertHtmlCssToFigma, generateFigmaClipboardData } from '../lib/figma-converter';

export default function Home() {
  const [html, setHtml] = useState('<div class="container">\n  <h1>Hello, Figma!</h1>\n  <p>This is sample text</p>\n  <button>Click Me</button>\n</div>');
  const [css, setCss] = useState('.container {\n  padding: 20px;\n  background-color: #f5f5f5;\n  border-radius: 8px;\n}\nh1 {\n  color: #333;\n  font-size: 24px;\n}\np {\n  color: #666;\n}\nbutton {\n  background-color: #0070f3;\n  color: white;\n  border: none;\n  padding: 10px 16px;\n  border-radius: 4px;\n  margin-top: 10px;\n}');
  const [figmaData, setFigmaData] = useState('');
  const [figmaClipboardData, setFigmaClipboardData] = useState('');

  const generateFigmaData = () => {
    try {
      // Generate Figma JSON representation
      const figmaNode = convertHtmlCssToFigma(html, css);
      setFigmaData(JSON.stringify(figmaNode, null, 2));
      
      // Generate Figma clipboard data
      const clipboardData = generateFigmaClipboardData(figmaNode);
      setFigmaClipboardData(clipboardData);
    } catch (error) {
      console.error('Error generating Figma data:', error);
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">HTML/CSS to Figma Converter</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Input</h2>
          <div className="space-y-4">
            <HtmlInput value={html} onChange={setHtml} />
            <CssInput value={css} onChange={setCss} />
            <button 
              onClick={generateFigmaData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Generate Figma Data
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">Preview</h2>
          <Preview html={html} css={css} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Figma JSON Output</h2>
          <FigmaOutput data={figmaData} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">Figma Clipboard (Paste Directly)</h2>
          <FigmaClipboard data={figmaClipboardData} />
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Test Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FigmaClipboardTester />
          <FigmaAnalyzer />
        </div>
      </div>
    </main>
  );
}
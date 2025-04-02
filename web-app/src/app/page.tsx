'use client';

import { useState } from 'react';
import HtmlInput from '../components/HtmlInput';
import CssInput from '../components/CssInput';
import Preview from '../components/Preview';
import FigmaOutput from '../components/FigmaOutput';

export default function Home() {
  const [html, setHtml] = useState('<div>Hello, Figma!</div>');
  const [css, setCss] = useState('div { color: blue; }');
  const [figmaData, setFigmaData] = useState('');

  const generateFigmaData = () => {
    try {
      // Import the conversion function
      import('../lib/figma-converter').then(({ convertHtmlCssToFigma }) => {
        const figmaNode = convertHtmlCssToFigma(html, css);
        
        // Convert to a format suitable for Figma's clipboard
        // This is a simplified version - in a real implementation,
        // you might need to adapt the format to match Figma's expectations
        const figmaClipboardData = {
          name: "HTML to Figma",
          type: "CLIPBOARD",
          children: [figmaNode]
        };
        
        setFigmaData(JSON.stringify(figmaClipboardData, null, 2));
      }).catch(err => {
        console.error('Error importing converter:', err);
      });
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
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Figma Output</h2>
        <FigmaOutput data={figmaData} />
      </div>
    </main>
  );
}
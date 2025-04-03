/**
 * Utility functions for working with Figma clipboard data
 */

// Create a minimal node representation for a simple box
export function createSimpleBox(options: {
    width?: number;
    height?: number;
    color?: string;
    cornerRadius?: number;
    x?: number;
    y?: number;
    name?: string;
  }) {
    const {
      width = 100,
      height = 100,
      color = '#0070f3',
      cornerRadius = 0,
      x = 0,
      y = 0,
      name = 'Simple Box'
    } = options;
    
    // Parse the color
    const rgbColor = hexToRgb(color);
    
    return {
      id: `${Math.floor(Math.random() * 1000)}:${Math.floor(Math.random() * 1000)}`,
      name,
      type: 'RECTANGLE',
      blendMode: 'NORMAL',
      absoluteBoundingBox: {
        x,
        y,
        width,
        height
      },
      constraints: {
        vertical: 'TOP',
        horizontal: 'LEFT'
      },
      fills: [
        {
          type: 'SOLID',
          color: rgbColor
        }
      ],
      strokes: [],
      cornerRadius,
      strokeWeight: 0,
      strokeAlign: 'CENTER'
    };
  }
  
  // Create Figma-compatible clipboard data for a simple example
  export function createSimpleExampleClipboardData() {
    // Create a simple frame with some elements
    const frame = {
      id: '0:1',
      name: 'Simple Frame',
      type: 'FRAME',
      blendMode: 'NORMAL',
      absoluteBoundingBox: {
        x: 0,
        y: 0,
        width: 300,
        height: 200
      },
      constraints: {
        vertical: 'TOP',
        horizontal: 'LEFT'
      },
      fills: [
        {
          type: 'SOLID',
          color: { r: 1, g: 1, b: 1, a: 1 } // White background
        }
      ],
      strokes: [],
      cornerRadius: 8,
      children: [
        createSimpleBox({
          width: 100,
          height: 100,
          color: '#0070f3', // Blue
          cornerRadius: 4,
          x: 20,
          y: 20,
          name: 'Blue Box'
        }),
        createSimpleBox({
          width: 80,
          height: 80,
          color: '#ff0000', // Red
          cornerRadius: 8,
          x: 140,
          y: 40,
          name: 'Red Box'
        })
      ]
    };
    
    // Create the metadata
    const metadata = {
      dataType: 'scene',
      fileKey: 'IAMA_DUMMY_FILE_KEY_AMA',
      pasteID: Math.floor(Math.random() * 1000)
    };
    
    // Base64 encode the metadata
    const metadataBase64 = btoa(JSON.stringify(metadata));
    
    // Serialize and encode the node data
    const nodeData = btoa(JSON.stringify(frame));
    
    // Create the HTML structure
    const clipboardHtml = `
      <meta charset='utf-8'><html><head><meta charset="utf-8">    <meta charset="utf-8">    </head><body>
      <span data-metadata="<!--(figmeta)${metadataBase64}(/figmeta)-->"></span>
      <span data-buffer="<!--(figma)${nodeData}(/figma)-->"></span>
      <span style="white-space: pre-wrap"></span>
      </body></html>
    `;
    
    return clipboardHtml;
  }
  
  // Helper function to convert hex color to RGB
  function hexToRgb(hex: string): { r: number; g: number; b: number; a: number } {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    let r, g, b;
    if (hex.length === 3) {
      // Short form (#RGB)
      r = parseInt(hex[0] + hex[0], 16) / 255;
      g = parseInt(hex[1] + hex[1], 16) / 255;
      b = parseInt(hex[2] + hex[2], 16) / 255;
    } else {
      // Long form (#RRGGBB)
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
    }
    
    return { r, g, b, a: 1 };
  }
  
  // Parse Figma clipboard format from raw HTML
  export function parseFigmaClipboardData(html: string): any {
    try {
      // Extract the metadata
      const metadataMatch = html.match(/data-metadata="<!--\(figmeta\)(.*?)\(\/figmeta\)-->"/) || [];
      const metadataBase64 = metadataMatch[1];
      
      // Extract the buffer data
      const bufferMatch = html.match(/data-buffer="<!--\(figma\)(.*?)\(\/figma\)-->"/) || [];
      const bufferBase64 = bufferMatch[1];
      
      if (!bufferBase64) {
        throw new Error('No Figma buffer data found');
      }
      
      // Decode the buffer data
      const bufferDecoded = atob(bufferBase64);
      
      // Attempt to parse as JSON (may not work if using binary format)
      try {
        return JSON.parse(bufferDecoded);
      } catch (e) {
        // If it's not valid JSON, return the raw decoded data
        return {
          rawBuffer: bufferDecoded,
          rawMetadata: metadataBase64 ? atob(metadataBase64) : null
        };
      }
    } catch (error) {
      console.error('Error parsing Figma clipboard data:', error);
      return null;
    }
  }
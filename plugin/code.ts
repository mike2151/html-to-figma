// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// Runs this code if the plugin is run in Figma
if (figma.editorType === 'figma') {
  // This shows the HTML page in "ui.html".
  figma.showUI(__html__, { width: 600, height: 500 });

  figma.ui.onmessage = async (message) => {
    if (message.type === 'convert') {
      try {
        // Parse the HTML and CSS
        // const htmlContent = message.html;
        // const cssContent = message.css;
        
        // // Create Figma nodes from the HTML and CSS
        // const nodes = await convertHtmlCssToFigma(htmlContent, cssContent);
        
        // // Select the created nodes in Figma
        // figma.currentPage.selection = nodes;
        
        // // Focus the view on the created nodes
        // figma.viewport.scrollAndZoomIntoView(nodes);
        
        // Send success message back to UI
        figma.ui.postMessage({
          type: 'success',
          message: 'Conversion successful! Created '
        });
      } catch (error) {
        // Send error message back to UI
        figma.ui.postMessage({
          type: 'error',
          message: 'Error: ' + (error instanceof Error ? error.message : String(error))
        });
      }
    }
  };
}

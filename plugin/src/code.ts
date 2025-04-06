import {
  ALLOWED_FIGMA_EDITOR_TYPES,
} from "./constants";
import { showUI } from "./figma-file-interations";
import { convertHtmlCssToFigma } from "./html-to-figma-converter";

if (ALLOWED_FIGMA_EDITOR_TYPES.includes(figma.editorType)) {
  // This shows the HTML page in "ui.html".
  
  figma.ui.onmessage = async (message) => {
    if (message.type === "convert") {
      showUI();
      try {
        const htmlContent = message.html;
        const cssContent = message.css;

        // Create Figma nodes from the HTML and CSS
        const nodes = await convertHtmlCssToFigma(htmlContent, cssContent);

        // Select the created nodes in Figma
        figma.currentPage.selection = nodes;

        // Focus the view on the created nodes
        figma.viewport.scrollAndZoomIntoView(nodes);

        // Send success message back to UI
        figma.ui.postMessage({
          type: "success",
          message: "Conversion successful!",
        });
      } catch (error) {
        figma.ui.postMessage({
          type: "error",
          message: "Error creating converting Figma components",
        });
      }
    }
  };
}

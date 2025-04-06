import {
  ALLOWED_FIGMA_EDITOR_TYPES,
  PLUGIN_WINDOW_WIDTH,
  PLUGIN_WINDOW_HEIGHT,
} from "./constants";
import { convertHtmlCssToFigma } from "./html-to-figma-converter";

if (ALLOWED_FIGMA_EDITOR_TYPES.includes(figma.editorType)) {
  // This shows the HTML page in "ui.html".
  figma.showUI(__html__, {
    width: PLUGIN_WINDOW_WIDTH,
    height: PLUGIN_WINDOW_HEIGHT,
  });

  figma.ui.onmessage = async (message) => {
    if (message.type === "convert") {
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

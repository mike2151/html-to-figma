import {
  ALLOWED_FIGMA_EDITOR_TYPES,
} from "./constants";
import { displayPlugin, scrollAndZoomIntoNodes, selectNodesInScreen } from "./figma-file-interations";
import { convertHtmlCssToFigma } from "./html-to-figma-converter";
import { displayErrorMessage, displaySuccessMessage } from "./plugin-ui-utils";

if (ALLOWED_FIGMA_EDITOR_TYPES.includes(figma.editorType)) {
  displayPlugin();
  
  figma.ui.onmessage = async (message) => {
    if (message.type === "convert") {
      try {
        const htmlContent = message.html;
        const cssContent = message.css;

        const nodes = await convertHtmlCssToFigma(htmlContent, cssContent);

        selectNodesInScreen(nodes);

        scrollAndZoomIntoNodes(nodes);

        displaySuccessMessage("Conversion successful!");
      } catch (error) {
        displayErrorMessage("Error creating converting Figma components");
      }
    }
  };
}

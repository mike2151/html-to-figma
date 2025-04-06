import { HtmlNode } from "./types";

export function parseHtml(htmlString: string): HtmlNode[] {
  const nodes: HtmlNode[] = [];
  let currentIndex = 0;

  // Remove comments first
  htmlString = htmlString.replace(/<!--[\s\S]*?-->/g, "");

  while (currentIndex < htmlString.length) {
    // Find next tag
    const tagStart = htmlString.indexOf("<", currentIndex);

    // No more tags
    if (tagStart === -1) {
      const textContent = htmlString.substring(currentIndex).trim();
      if (textContent) {
        nodes.push({ type: "text", data: textContent });
      }
      break;
    }

    // Text node before tag
    if (tagStart > currentIndex) {
      const textContent = htmlString.substring(currentIndex, tagStart).trim();
      if (textContent) {
        nodes.push({ type: "text", data: textContent });
      }
    }

    // Check if it's a closing tag
    if (htmlString.charAt(tagStart + 1) === "/") {
      const tagEnd = htmlString.indexOf(">", tagStart);
      if (tagEnd === -1) break; // Malformed HTML
      currentIndex = tagEnd + 1;
      continue;
    }

    // Parse the tag
    const tagEnd = htmlString.indexOf(">", tagStart);
    if (tagEnd === -1) break; // Malformed HTML

    const fullTag = htmlString.substring(tagStart + 1, tagEnd);

    // Check if it's a self-closing tag
    const isSelfClosing =
      fullTag.endsWith("/") ||
      ["img", "input", "br", "hr"].includes(fullTag.split(/\s+/)[0]);

    // Get tag name and attributes
    const parts = fullTag.split(/\s+/);
    const tagName = parts[0].toLowerCase();

    // Skip DOCTYPE, comments, etc.
    if (tagName === "!doctype" || tagName === "!--") {
      currentIndex = tagEnd + 1;
      continue;
    }

    const attribs: Record<string, string> = {};

    // Parse attributes
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (!part || part === "/") continue;

      const eqIndex = part.indexOf("=");
      if (eqIndex === -1) {
        attribs[part] = "";
      } else {
        const attrName = part.substring(0, eqIndex);
        let attrValue = part.substring(eqIndex + 1);

        // Remove quotes
        if (
          (attrValue.startsWith('"') && attrValue.endsWith('"')) ||
          (attrValue.startsWith("'") && attrValue.endsWith("'"))
        ) {
          attrValue = attrValue.substring(1, attrValue.length - 1);
        }

        attribs[attrName] = attrValue;
      }
    }

    // Create node
    const node: HtmlNode = {
      type: "tag",
      name: tagName,
      attribs,
      children: [],
    };

    // If self-closing, add to nodes and continue
    if (isSelfClosing) {
      nodes.push(node);
      currentIndex = tagEnd + 1;
      continue;
    }

    // Find closing tag
    const closingTagStart = findClosingTag(htmlString, tagName, tagEnd + 1);
    if (closingTagStart === -1) {
      // No closing tag found, treat as self-closing
      nodes.push(node);
      currentIndex = tagEnd + 1;
      continue;
    }

    // Parse children
    const childrenHtml = htmlString.substring(tagEnd + 1, closingTagStart);
    if (childrenHtml.trim()) {
      node.children = parseHtml(childrenHtml);
    }

    nodes.push(node);
    currentIndex = htmlString.indexOf(">", closingTagStart) + 1;
  }

  return nodes;
}

function findClosingTag(
  html: string,
  tagName: string,
  startIndex: number,
): number {
  let depth = 1;
  let currentIndex = startIndex;

  while (currentIndex < html.length && depth > 0) {
    const openingTagIndex = html.indexOf(`<${tagName}`, currentIndex);
    const closingTagIndex = html.indexOf(`</${tagName}`, currentIndex);

    if (closingTagIndex === -1) return -1;

    if (openingTagIndex !== -1 && openingTagIndex < closingTagIndex) {
      depth++;
      currentIndex = openingTagIndex + 1;
    } else {
      depth--;
      if (depth === 0) return closingTagIndex;
      currentIndex = closingTagIndex + 1;
    }
  }

  return -1;
}

import { parse, HTMLElement, Node, NodeType, TextNode } from 'node-html-parser';

/**
 * Parses HTML string using node-html-parser
 * @param htmlString HTML string to parse
 * @returns Array of HTMLElement objects
 */
export function parseHtml(htmlString: string): HTMLElement[] {
  // Handle empty input
  if (!htmlString.trim()) {
    return [];
  }

  // Remove comments first (node-html-parser keeps comments by default)
  htmlString = htmlString.replace(/<!--[\s\S]*?-->/g, "");
  
  // Pre-process DOCTYPE to remove it before parsing
  // This ensures we don't get a text node with the DOCTYPE
  htmlString = htmlString.replace(/<!DOCTYPE[^>]*>/i, "");

  // Parse HTML using node-html-parser
  const root = parse(htmlString, {
    lowerCaseTagName: true,
    comment: false
  });

  return root.childNodes.filter(node => node.nodeType === NodeType.ELEMENT_NODE) as HTMLElement[];
}

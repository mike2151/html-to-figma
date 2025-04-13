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

    let fullTag = htmlString.substring(tagStart + 1, tagEnd);

    // Remove trailing slash for self-closing tags
    const hasTrailingSlash = fullTag.endsWith("/");
    if (hasTrailingSlash) {
      fullTag = fullTag.slice(0, -1).trim();
    }

    // Check if it's a self-closing tag
    const isSelfClosing =
      hasTrailingSlash ||
      ["img", "input", "br", "hr", "meta", "link", "area", "base", "col", "embed", "param", "source", "track", "wbr"].includes(fullTag.split(/\s+/)[0].toLowerCase());

    // Get tag name and attributes
    const parts = fullTag.split(/\s+/);
    const tagName = parts[0].toLowerCase().replace(/\/$/, '');

    // Skip DOCTYPE, comments, etc.
    if (tagName === "!doctype" || tagName === "!--") {
      currentIndex = tagEnd + 1;
      continue;
    }

    const attribs: Record<string, string> = {};

    // Parse attributes
    let attrString = fullTag.substring(tagName.length).trim();
    while (attrString) {
      // Skip any leading spaces
      attrString = attrString.trim();
      if (!attrString || attrString === '/') break;

      // Match attribute name
      const nameMatch = attrString.match(/^[^\s=]+/);
      if (!nameMatch) break;

      const name = nameMatch[0];
      attrString = attrString.substring(name.length).trim();

      // If there's no '=', it's a boolean attribute
      if (!attrString.startsWith('=')) {
        attribs[name] = '';
        continue;
      }

      // Skip the '='
      attrString = attrString.substring(1).trim();

      let value = '';
      if (attrString.startsWith('"') || attrString.startsWith("'")) {
        // Quoted value
        const quote = attrString[0];
        const endQuoteIndex = attrString.indexOf(quote, 1);
        if (endQuoteIndex === -1) break;
        value = attrString.substring(1, endQuoteIndex);
        attrString = attrString.substring(endQuoteIndex + 1);
      } else {
        // Unquoted value
        const spaceIndex = attrString.indexOf(' ');
        if (spaceIndex === -1) {
          value = attrString;
          attrString = '';
        } else {
          value = attrString.substring(0, spaceIndex);
          attrString = attrString.substring(spaceIndex);
        }
      }
      attribs[name] = value;
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
      // No closing tag found - treat as self-closing if it's not a container tag
      const containerTags = ['div', 'p', 'span', 'li', 'ul', 'ol', 'table', 'tr', 'td', 'th'];
      if (!containerTags.includes(tagName)) {
        nodes.push(node);
        currentIndex = tagEnd + 1;
        continue;
      }
      
      // For container tags, parse until next sibling tag or parent's closing tag
      const nextTagStart = findNextSiblingOrClosingTag(htmlString, tagName, tagEnd + 1);
      if (nextTagStart !== -1) {
        // For list items and table cells, include text content up to the next tag
        if (['li', 'td', 'th'].includes(tagName)) {
          const textContent = htmlString.substring(tagEnd + 1, nextTagStart).trim();
          if (textContent) {
            node.children = [{ type: 'text', data: textContent }];
          }
        } else {
          const childrenHtml = htmlString.substring(tagEnd + 1, nextTagStart);
          if (childrenHtml.trim()) {
            node.children = parseHtml(childrenHtml);
          }
        }
        currentIndex = nextTagStart;
      } else {
        // No next tag found, parse all remaining content
        const remainingContent = htmlString.substring(tagEnd + 1);
        if (remainingContent.trim()) {
          if (['li', 'td', 'th'].includes(tagName)) {
            node.children = [{ type: 'text', data: remainingContent.trim() }];
          } else {
            node.children = parseHtml(remainingContent);
          }
        }
        currentIndex = htmlString.length;
      }
      nodes.push(node);
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
    // Find next tag (opening or closing)
    const nextTagStart = html.indexOf('<', currentIndex);
    if (nextTagStart === -1) return -1;

    // Check if it's a closing tag
    const isClosing = html.charAt(nextTagStart + 1) === '/';
    const tagStart = nextTagStart + (isClosing ? 2 : 1);

    // Find end of tag
    const tagEnd = html.indexOf('>', tagStart);
    if (tagEnd === -1) return -1;

    // Extract tag name
    const tag = html.substring(tagStart, tagEnd).split(/[\s>]/)[0].toLowerCase().replace(/\/$/, '');

    if (tag === tagName) {
      if (isClosing) {
        depth--;
        if (depth === 0) return nextTagStart;
      } else {
        // Don't increment depth for self-closing tags
        const fullTag = html.substring(tagStart, tagEnd);
        const isSelfClosing = fullTag.endsWith('/') || 
          ["img", "input", "br", "hr", "meta", "link", "area", "base", "col", "embed", "param", "source", "track", "wbr"].includes(tag);
        if (!isSelfClosing) {
          depth++;
        }
      }
    }

    currentIndex = tagEnd + 1;
  }

  return -1;
}

function findNextSiblingOrClosingTag(html: string, tagName: string, startIndex: number): number {
  let currentIndex = startIndex;
  const siblingTags = {
    li: ['li'],
    td: ['td', 'th'],
    th: ['td', 'th'],
    tr: ['tr'],
  };

  while (currentIndex < html.length) {
    const nextTag = html.indexOf('<', currentIndex);
    if (nextTag === -1) return -1;

    // Check if it's a closing tag
    const isClosing = html.charAt(nextTag + 1) === '/';
    const tagStart = nextTag + (isClosing ? 2 : 1);

    // Find end of tag
    const tagEnd = html.indexOf('>', tagStart);
    if (tagEnd === -1) return -1;

    // Get tag name
    const tag = html.substring(tagStart, tagEnd).split(/[\s>]/)[0].toLowerCase().replace(/\/$/, '');

    // If we find a closing tag for any ancestor, stop here
    if (isClosing) {
      // Only stop for matching closing tags
      if (tag === tagName) {
        return nextTag;
      }
      currentIndex = tagEnd + 1;
      continue;
    }

    // If we find a sibling tag, stop here
    const siblings = siblingTags[tagName as keyof typeof siblingTags] || [];
    if (siblings.includes(tag)) {
      return nextTag;
    }

    currentIndex = tagEnd + 1;
  }

  return -1;
}

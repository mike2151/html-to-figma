import { camelCase } from "./figma-conversion-utils";
import { CssRule } from "./types";

export function parseCss(cssString: string): CssRule[] {
  const rules: CssRule[] = [];

  // Remove comments and normalize whitespace
  cssString = cssString
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Match selectors and declaration blocks
  const ruleRegex = /([^{]+){([^}]*)}/g;
  let match;

  while ((match = ruleRegex.exec(cssString)) !== null) {
    const selectors = match[1].trim().split(",");
    const declarationBlock = match[2].trim();

    // Parse declarations
    const declarations: Record<string, string> = {};
    const declarationRegex = /([^:;]+):([^;]+)(?:;|$)/g;
    let declMatch;

    while ((declMatch = declarationRegex.exec(declarationBlock)) !== null) {
      const property = declMatch[1].trim();
      const value = declMatch[2].trim();
      declarations[camelCase(property)] = value;
    }

    // Create a rule for each selector
    for (const selector of selectors) {
      rules.push({
        selector: selector.trim(),
        declarations,
      });
    }
  }

  return rules;
}

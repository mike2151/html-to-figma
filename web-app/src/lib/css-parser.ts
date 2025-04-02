// A simple CSS parser for demonstration purposes

export interface CssRule {
    selector: string;
    properties: Record<string, string>;
  }
  
  export function parseCss(cssString: string): CssRule[] {
    // This is a simplified CSS parser
    // For production, you'd want to use a proper CSS parser library
    
    const rules: CssRule[] = [];
    
    // Remove comments
    cssString = cssString.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Split by rules
    const ruleStrings = cssString.split(/\s*}\s*/);
    
    ruleStrings.forEach(ruleStr => {
      if (!ruleStr.trim()) return;
      
      // Add the closing brace back if it was removed by the split
      if (!ruleStr.includes('{')) return;
      
      // Split selector and declarations
      const [selector, declarationsStr] = ruleStr.split('{');
      
      if (!selector || !declarationsStr) return;
      
      const rule: CssRule = {
        selector: selector.trim(),
        properties: {},
      };
      
      // Parse declarations
      const declarations = declarationsStr.split(';');
      declarations.forEach(decl => {
        const [property, value] = decl.split(':');
        
        if (!property || !value) return;
        
        rule.properties[property.trim()] = value.trim();
      });
      
      rules.push(rule);
    });
    
    return rules;
  }
  
  export function getMatchingRules(node: any, cssRules: CssRule[]): Record<string, string> {
    // This is a simplified selector matching algorithm
    // In production, you'd need a more sophisticated approach
    
    const properties: Record<string, string> = {};
    
    cssRules.forEach(rule => {
      // Very basic selector matching - only handles element selectors
      // You'd need to handle classes, IDs, and more complex selectors in a real implementation
      
      if (rule.selector.toLowerCase() === node.tag) {
        // If selector matches, add all properties
        Object.assign(properties, rule.properties);
      }
      
      // Handle class selectors
      if (node.attributes.class && rule.selector.startsWith('.')) {
        const className = rule.selector.substring(1);
        const nodeClasses = node.attributes.class.split(' ');
        
        if (nodeClasses.includes(className)) {
          Object.assign(properties, rule.properties);
        }
      }
      
      // Handle ID selectors
      if (node.attributes.id && rule.selector.startsWith('#')) {
        const idName = rule.selector.substring(1);
        
        if (node.attributes.id === idName) {
          Object.assign(properties, rule.properties);
        }
      }
    });
    
    return properties;
  }
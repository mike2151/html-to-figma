
import { parseCss } from '../css-parser';

describe('parseCss', () => {
  it('should parse a single rule with one declaration', () => {
    const cssString = '.myClass { color: red; }';
    const expected /*: CssRule[]*/ = [
      { selector: '.myClass', declarations: { color: 'red' } },
    ];
    expect(parseCss(cssString)).toEqual(expected);
  });

  it('should parse a single rule with multiple declarations', () => {
    const cssString = 'p { font-size: 16px; line-height: 1.5; }';
    const expected /*: CssRule[]*/ = [
      { selector: 'p', declarations: { fontSize: '16px', lineHeight: '1.5' } },
    ];
    expect(parseCss(cssString)).toEqual(expected);
  });

  it('should correctly camelCase CSS properties', () => {
    const cssString = 'div { background-color: #fff; border-radius: 5px; }';
    const expected /*: CssRule[]*/ = [
      { selector: 'div', declarations: { backgroundColor: '#fff', borderRadius: '5px' } },
    ];
    expect(parseCss(cssString)).toEqual(expected);
  });

  it('should handle multiple selectors for the same rule', () => {
    const cssString = 'h1, h2, h3 { font-weight: bold; color: #333; }';
    const declarations = { fontWeight: 'bold', color: '#333' };
    const expected /*: CssRule[]*/ = [
      { selector: 'h1', declarations },
      { selector: 'h2', declarations },
      { selector: 'h3', declarations },
    ];
    expect(parseCss(cssString)).toEqual(expected);
  });

  it('should parse multiple rules', () => {
    const cssString = `
      body { margin: 0; }
      a { color: blue; text-decoration: none; }
    `;
    const expected /*: CssRule[]*/ = [
      { selector: 'body', declarations: { margin: '0' } },
      { selector: 'a', declarations: { color: 'blue', textDecoration: 'none' } },
    ];
    expect(parseCss(cssString)).toEqual(expected);
  });

  it('should ignore CSS comments', () => {
    const cssString = `
      /* This is a rule for buttons */
      .button {
        padding: 10px 15px; /* Add some padding */
        background-color: green; /* Set background */
      }
      /* Another comment */
      p { color: black; }
    `;
    const expected /*: CssRule[]*/ = [
      { selector: '.button', declarations: { padding: '10px 15px', backgroundColor: 'green' } },
      { selector: 'p', declarations: { color: 'black' } },
    ];
    expect(parseCss(cssString)).toEqual(expected);
  });

    it('should handle multi-line comments', () => {
    const cssString = `
      .card {
        border: 1px solid #ccc;
        /* Multi-line
           comment explaining
           the next property */
        box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
      }
    `;
    const expected/*: CssRule[]*/ = [
      { selector: '.card', declarations: { border: '1px solid #ccc', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' } },
    ];
    expect(parseCss(cssString)).toEqual(expected);
  });


  it('should handle various whitespace patterns', () => {
    const cssString = '  div   {  color :  blue ;  font-size :  12px ; }  \n .cls{opacity:0.5;}';
    const expected /*: CssRule[]*/ = [
      { selector: 'div', declarations: { color: 'blue', fontSize: '12px' } },
      { selector: '.cls', declarations: { opacity: '0.5' } },
    ];
    expect(parseCss(cssString)).toEqual(expected);
  });

    it('should handle selectors with extra whitespace around commas', () => {
    const cssString = 'h1 ,  h2,h3   { font-weight: bold; }';
    const declarations = { fontWeight: 'bold' };
    const expected /*: CssRule[]*/ = [
      { selector: 'h1', declarations },
      { selector: 'h2', declarations },
      { selector: 'h3', declarations },
    ];
    expect(parseCss(cssString)).toEqual(expected);
  });

  it('should handle declarations without a trailing semicolon', () => {
    const cssString = 'a { color: red; text-decoration: underline }'; // No semicolon after underline
    const expected /*: CssRule[]*/ = [
      { selector: 'a', declarations: { color: 'red', textDecoration: 'underline' } },
    ];
    expect(parseCss(cssString)).toEqual(expected);
  });

   it('should handle declarations with multiple semicolons (treats extra as part of value)', () => {
    const cssString = 'a { color: red;; font-size: 10px; }';
    const expected /*: CssRule[]*/ = [
      { selector: 'a', declarations: { color: 'red', fontSize: '10px' } },
    ];
    expect(parseCss(cssString)).toEqual(expected);
  });

  it('should return an empty array for an empty string', () => {
    expect(parseCss('')).toEqual([]);
  });

  it('should return an empty array for a string with only comments', () => {
    const cssString = '/* comment 1 */ /* comment 2 */';
    expect(parseCss(cssString)).toEqual([]);
  });

  it('should return an empty array for a string with only whitespace', () => {
    expect(parseCss('  \n\t  ')).toEqual([]);
  });

  it('should handle complex selectors (without parsing them deeply)', () => {
    const cssString = 'div > p.className#id[attr="value"]:hover { color: purple; }';
     const expected /*: CssRule[]*/ = [
      { selector: 'div > p.className#id[attr="value"]:hover', declarations: { color: 'purple' } },
    ];
    expect(parseCss(cssString)).toEqual(expected);
  });

    it('should handle rules without declarations', () => {
    const cssString = 'div { } p { color: green; }';
     const expected /*: CssRule[]*/ = [
      { selector: 'div', declarations: {} }, // Empty declarations object
      { selector: 'p', declarations: { color: 'green' } },
    ];
    expect(parseCss(cssString)).toEqual(expected);
  });
});
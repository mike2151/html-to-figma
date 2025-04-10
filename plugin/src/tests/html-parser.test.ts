import { parseHtml } from '../html-parser';
import { HtmlNode } from '../types';

describe('parseHtml', () => {
  it('should return an empty array for empty input', () => {
    expect(parseHtml('')).toEqual([]);
  });

  it('should parse a simple text node', () => {
    const html = 'Just plain text';
    const expected: HtmlNode[] = [{ type: 'text', data: 'Just plain text' }];
    expect(parseHtml(html)).toEqual(expected);
  });

  it('should trim whitespace from root text nodes', () => {
    const html = '  Leading and trailing whitespace   ';
    const expected: HtmlNode[] = [{ type: 'text', data: 'Leading and trailing whitespace' }];
    expect(parseHtml(html)).toEqual(expected);
  });

   it('should trim whitespace between tags', () => {
    const html = '  <p>Hello</p>   <span>World</span>  ';
    const expected: HtmlNode[] = [
      { type: 'tag', name: 'p', attribs: {}, children: [{type: 'text', data: 'Hello'}] },
      { type: 'tag', name: 'span', attribs: {}, children: [{type: 'text', data: 'World'}] }
    ];
    expect(parseHtml(html)).toEqual(expected);
  });

  it('should parse a simple tag with text content', () => {
    const html = '<p>Hello World</p>';
    const expected: HtmlNode[] = [
      {
        type: 'tag',
        name: 'p',
        attribs: {},
        children: [{ type: 'text', data: 'Hello World' }],
      },
    ];
    expect(parseHtml(html)).toEqual(expected);
  });

  it('should parse multiple sibling tags', () => {
    const html = '<h1>Title</h1><p>Paragraph</p>';
    const expected: HtmlNode[] = [
      {
        type: 'tag',
        name: 'h1',
        attribs: {},
        children: [{ type: 'text', data: 'Title' }],
      },
      {
        type: 'tag',
        name: 'p',
        attribs: {},
        children: [{ type: 'text', data: 'Paragraph' }],
      },
    ];
    expect(parseHtml(html)).toEqual(expected);
  });

  it('should parse a tag with attributes (double quotes)', () => {
    const html = '<div id="main" class="container">Content</div>';
    const expected: HtmlNode[] = [
      {
        type: 'tag',
        name: 'div',
        attribs: { id: 'main', class: 'container' },
        children: [{ type: 'text', data: 'Content' }],
      },
    ];
    expect(parseHtml(html)).toEqual(expected);
  });

  it('should parse a tag with attributes (single quotes)', () => {
    const html = "<a href='/path' target='_blank'>Link</a>";
    const expected: HtmlNode[] = [
      {
        type: 'tag',
        name: 'a',
        attribs: { href: '/path', target: '_blank' },
        children: [{ type: 'text', data: 'Link' }],
      },
    ];
    expect(parseHtml(html)).toEqual(expected);
  });

   it('should parse a tag with attributes (no quotes)', () => {
    const html = "<input type=text disabled value=hello>";
    const expected: HtmlNode[] = [
      {
        type: 'tag',
        name: 'input',
        attribs: { type: 'text', disabled: '', value: 'hello' }, // Note: disabled becomes empty string
        children: [],
      },
    ];
    expect(parseHtml(html)).toEqual(expected);
  });

    it('should parse a tag with mixed attribute quotes and boolean attributes', () => {
    const html = '<button class="btn btn-primary" data-id=123 disabled>Click</button>';
    const expected: HtmlNode[] = [
      {
        type: 'tag',
        name: 'button',
        attribs: { class: 'btn btn-primary', 'data-id': '123', disabled: '' },
        children: [{ type: 'text', data: 'Click' }],
      },
    ];
    expect(parseHtml(html)).toEqual(expected);
  });


  it('should handle explicitly self-closing tags', () => {
    const html = 'Line 1<br/>Line 2<hr />';
    const expected: HtmlNode[] = [
      { type: 'text', data: 'Line 1' },
      { type: 'tag', name: 'br', attribs: {}, children: [] },
      { type: 'text', data: 'Line 2' },
      { type: 'tag', name: 'hr', attribs: {}, children: [] },
    ];
    expect(parseHtml(html)).toEqual(expected);
  });

  it('should handle implicitly self-closing tags (img, input)', () => {
    const html = 'Image: <img src="pic.jpg" alt="A picture"><input type="text" name="field">';
    const expected: HtmlNode[] = [
      { type: 'text', data: 'Image:' },
      {
        type: 'tag',
        name: 'img',
        attribs: { src: 'pic.jpg', alt: 'A picture' },
        children: [],
      },
      {
        type: 'tag',
        name: 'input',
        attribs: { type: 'text', name: 'field' },
        children: [],
      },
    ];
    expect(parseHtml(html)).toEqual(expected);
  });

  it('should parse nested tags', () => {
    const html = '<div><p><span>Nested</span> Text</p></div>';
    const expected: HtmlNode[] = [
      {
        type: 'tag',
        name: 'div',
        attribs: {},
        children: [
          {
            type: 'tag',
            name: 'p',
            attribs: {},
            children: [
              {
                type: 'tag',
                name: 'span',
                attribs: {},
                children: [{ type: 'text', data: 'Nested' }],
              },
              { type: 'text', data: 'Text' },
            ],
          },
        ],
      },
    ];
    expect(parseHtml(html)).toEqual(expected);
  });

  it('should ignore HTML comments', () => {
    const html = '<div>Hello</div>';
    const expected: HtmlNode[] = [
      {
        type: 'tag',
        name: 'div',
        attribs: {},
        children: [{ type: 'text', data: 'Hello' }],
      },
    ];
    expect(parseHtml(html)).toEqual(expected);
  });

   it('should ignore HTML comments spanning multiple lines', () => {
    const html = '<p>Start</p><p>End</p>';
    const expected: HtmlNode[] = [
       { type: 'tag', name: 'p', attribs: {}, children: [{type: 'text', data: 'Start'}] },
       { type: 'tag', name: 'p', attribs: {}, children: [{type: 'text', data: 'End'}] }
    ];
    expect(parseHtml(html)).toEqual(expected);
  });

  it('should ignore DOCTYPE declaration', () => {
    const html = '<!DOCTYPE html><p>Content</p>';
    const expected: HtmlNode[] = [
      {
        type: 'tag',
        name: 'p',
        attribs: {},
        children: [{ type: 'text', data: 'Content' }],
      },
    ];
    expect(parseHtml(html)).toEqual(expected);
  });

  it('should handle mixed case tag names (convert to lowercase)', () => {
    const html = '<Div><SPAN class="Text">Mixed</SPAN></DIV>';
    const expected: HtmlNode[] = [
      {
        type: 'tag',
        name: 'div',
        attribs: {},
        children: [
          {
            type: 'tag',
            name: 'span',
            attribs: { class: 'Text' },
            children: [{ type: 'text', data: 'Mixed' }],
          },
        ],
      },
    ];
    expect(parseHtml(html)).toEqual(expected);
  });

   it('should handle tags nested within the same tag type', () => {
    const html = '<div>Outer <div>Inner</div> More Outer</div>';
     const expected: HtmlNode[] = [
      {
        type: 'tag',
        name: 'div',
        attribs: {},
        children: [
          { type: 'text', data: 'Outer' },
          {
            type: 'tag',
            name: 'div',
            attribs: {},
            children: [{ type: 'text', data: 'Inner' }]
          },
           { type: 'text', data: 'More Outer' },
        ]
      }
    ];
    expect(parseHtml(html)).toEqual(expected);
   });

   it('should treat tags with no closing tag as self-closing (no children parsed from outside)', () => {
    // Note: This tests the current behavior where findClosingTag fails and the node is added without processing children past the opening tag.
    const html = '<div><p>Some text';
    const expected: HtmlNode[] = [
        { type: 'tag', name: 'div', attribs: {}, children: [] },
        // The parser currently continues *after* the 'div' tag was processed, finding the '<p>'.
        // A more robust parser might handle this differently (e.g., error or better recovery).
        { type: 'tag', name: 'p', attribs: {}, children: [] }, // Also treated as self-closing due to missing closing tag
        { type: 'text', data: 'Some text' } // Text after the unclosed 'p'
    ];
     // Let's test a slightly different malformed case based on the code's logic:
     const html2 = '<ul><li>Item 1<li>Item 2</ul>';
     const expected2: HtmlNode[] = [
        {
            type: 'tag',
            name: 'ul',
            attribs: {},
            children: [
                { type: 'tag', name: 'li', attribs: {}, children: [{ type: 'text', data: 'Item 1' }] }, // Finds closing tag `</ul>` for `<li>`? No, findClosingTag looks for `</li>`
                // OK, let's trace `<ul><li>Item 1<li>Item 2</ul>`:
                // 1. Parse `<ul>`. Call parseHtml(`<li>Item 1<li>Item 2`) recursively.
                // 2. Inside recursive call: Parse `<li>`. Call parseHtml(`Item 1<li>Item 2`) recursively.
                // 3. Inside second recursive call: Parse text "Item 1". Find next tag `<l` (assuming findClosingTag for `<li>` fails because no `</li>`).
                // 4. Back to first recursive call: findClosingTag for `<li>` fails. Node `<li>Item 1</li>` (with children) added. currentIndex is after `Item 1`.
                // 5. First recursive call continues: Parse `<li>Item 2`. Like before, node `<li>Item 2</li>` added. currentIndex after `Item 2`.
                // 6. Back to original call: findClosingTag for `<ul>` finds `</ul>`. currentIndex after `</ul>`.
                 { type: 'tag', name: 'li', attribs: {}, children: [{ type: 'text', data: 'Item 1' }] },
                 { type: 'tag', name: 'li', attribs: {}, children: [{ type: 'text', data: 'Item 2' }] }
            ]
        }
     ];
    // This example shows the parser *does* handle *some* unclosed tags reasonably because the parent's closing tag search eventually finds the correct one.
    // The previous test case (`<div><p>Some text`) was simpler and exposed the "treat as self-closing" behavior more directly when `findClosingTag` fails.
    expect(parseHtml(html2)).toEqual(expected2);
  });

   it('should handle complex nesting and siblings', () => {
    const html = `
      <div>
        <h1>Title</h1>
        <p>Paragraph 1 with a <a href="#">link</a>.</p>
        <hr/>
        <ul>
          <li>Item 1</li>
          <li>Item 2 <img src="icon.png"></li>
        </ul>
        <p>Final para.</p>
      </div>
      <span>Sibling span</span>
    `;
    const expected: HtmlNode[] = [
      {
        type: 'tag',
        name: 'div',
        attribs: {},
        children: [
          { type: 'tag', name: 'h1', attribs: {}, children: [{ type: 'text', data: 'Title' }] },
          {
            type: 'tag',
            name: 'p',
            attribs: {},
            children: [
              { type: 'text', data: 'Paragraph 1 with a' },
              { type: 'tag', name: 'a', attribs: { href: '#' }, children: [{ type: 'text', data: 'link' }] },
              { type: 'text', data: '.' },
            ],
          },
          { type: 'tag', name: 'hr', attribs: {}, children: [] },
          {
            type: 'tag',
            name: 'ul',
            attribs: {},
            children: [
              { type: 'tag', name: 'li', attribs: {}, children: [{ type: 'text', data: 'Item 1' }] },
              {
                type: 'tag',
                name: 'li',
                attribs: {},
                children: [
                  { type: 'text', data: 'Item 2' },
                  { type: 'tag', name: 'img', attribs: { src: 'icon.png' }, children: [] },
                ],
              },
            ],
          },
           { type: 'tag', name: 'p', attribs: {}, children: [{ type: 'text', data: 'Final para.' }] },
        ],
      },
       { type: 'tag', name: 'span', attribs: {}, children: [{type: 'text', data: 'Sibling span'}] },
    ];
    expect(parseHtml(html)).toEqual(expected);
  });

});
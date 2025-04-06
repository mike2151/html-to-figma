export interface HtmlNode {
    type: 'tag' | 'text';
    name?: string;
    attribs?: Record<string, string>;
    children?: HtmlNode[];
    data?: string;
}

export interface CssRule {
    selector: string;
    declarations: Record<string, string>;
}
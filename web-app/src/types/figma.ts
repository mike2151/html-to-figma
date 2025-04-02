// These are simplified Figma node types for our converter
// They don't represent the full Figma API but cover what we need

export type RGB = {
    r: number; // 0-1
    g: number; // 0-1
    b: number; // 0-1
  };
  
  export type RGBA = RGB & {
    a: number; // 0-1
  };
  
  export type Point = {
    x: number;
    y: number;
  };
  
  export type Size = {
    width: number;
    height: number;
  };
  
  export type FigmaTextStyle = {
    fontFamily?: string;
    fontWeight?: number;
    fontSize?: number;
    lineHeight?: number | string;
    letterSpacing?: number;
    textDecoration?: string;
    textCase?: string;
    color?: RGB | RGBA;
  };
  
  export type FigmaFillStyle = {
    type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL';
    color?: RGBA;
    opacity?: number;
    // More complex fill properties would go here
  };
  
  export type FigmaStrokeStyle = {
    strokeWeight: number;
    strokeAlign: 'INSIDE' | 'OUTSIDE' | 'CENTER';
    color: RGBA;
  };
  
  export type FigmaEffectStyle = {
    type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
    radius?: number;
    color?: RGBA;
    offset?: Point;
    spread?: number;
  };
  
  export type FigmaNode = {
    id?: string;
    name: string;
    type: string;
    children?: FigmaNode[];
  };
  
  export type FigmaFrameNode = FigmaNode & {
    type: 'FRAME';
    position?: Point;
    size: Size;
    fills?: FigmaFillStyle[];
    strokes?: FigmaStrokeStyle[];
    effects?: FigmaEffectStyle[];
    cornerRadius?: number;
  };
  
  export type FigmaTextNode = FigmaNode & {
    type: 'TEXT';
    characters: string;
    style: FigmaTextStyle;
    position?: Point;
    size?: Size;
  };
  
  export type FigmaRectangleNode = FigmaNode & {
    type: 'RECTANGLE';
    position?: Point;
    size: Size;
    fills?: FigmaFillStyle[];
    strokes?: FigmaStrokeStyle[];
    effects?: FigmaEffectStyle[];
    cornerRadius?: number;
  };
  
  export type FigmaEllipseNode = FigmaNode & {
    type: 'ELLIPSE';
    position?: Point;
    size: Size;
    fills?: FigmaFillStyle[];
    strokes?: FigmaStrokeStyle[];
  };
  
  // This represents the main structure we'll generate
  export type FigmaDocument = {
    nodes: FigmaNode[];
  };
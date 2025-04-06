import {
    PLUGIN_WINDOW_WIDTH,
    PLUGIN_WINDOW_HEIGHT,
  } from "./constants";

export function showUI() {
  figma.showUI(__html__, {
    width: PLUGIN_WINDOW_WIDTH,
    height: PLUGIN_WINDOW_HEIGHT,
  });
}
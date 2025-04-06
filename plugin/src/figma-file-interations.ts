import {
    PLUGIN_WINDOW_WIDTH,
    PLUGIN_WINDOW_HEIGHT,
  } from "./constants";

export function displayPlugin() {
  figma.showUI(__html__, {
    width: PLUGIN_WINDOW_WIDTH,
    height: PLUGIN_WINDOW_HEIGHT,
  });
}

export function selectNodesInScreen(nodes: SceneNode[] ) {
    figma.currentPage.selection = nodes;
}

export function scrollAndZoomIntoNodes(nodes: SceneNode[] ) {
    figma.viewport.scrollAndZoomIntoView(nodes);
}
# html-to-figma

## Overview
Library to convert HTML to Figma. Open source version of [html.to.design](https://www.figma.com/community/plugin/1159123024924461424)

## Motiviation
One promise of Generative Ai is that a model might be able to come up with a Figma when prompted. However, models are more likely to produce designs through code (token-based) since that what they were trained on.

One work around is to having an LLM produce a Figma is:
1. Have the LLM come up with code for the design in HTML + CSS
2. Create a tool to convert HTML + CSS to Figma nodes
3. Take that produced Figma node and paste it into a Figma file

For 2, the only software solution is [html.to.design](https://www.figma.com/community/plugin/1159123024924461424), which costs money. This project aims to produce an open-source alternative 

# html-to-figma
<img width="500" height="400" alt="image" src="https://github.com/user-attachments/assets/caeec924-55de-4be9-8720-7c712195cefb" />


## Overview
Library to convert HTML to Figma. Open source version of [html.to.design](https://www.figma.com/community/plugin/1159123024924461424)

## Repository Structure:
- `web-app`: Code for the web page describing the product 
- `plugin`: Figma plugin that is directly used in the Figma app

## Motiviation
One promise of Generative Ai is that a model might be able to come up with a Figma when prompted. However, models are more likely to produce designs through code (token-based) since that what they were trained on.

One work around is to having an LLM produce a Figma is:

<img src="https://github.com/user-attachments/assets/b00384fe-c684-4d86-8c53-f443a9b161d0" width="250" height="400">

1. Have the LLM come up with code for the design in HTML + CSS
2. Create a tool to convert HTML + CSS to Figma nodes
3. Take that produced Figma node and paste it into a Figma file

For 2, the only software solution is [html.to.design](https://www.figma.com/community/plugin/1159123024924461424), which costs money. This project aims to produce an open-source alternative 

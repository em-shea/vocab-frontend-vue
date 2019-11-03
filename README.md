# Magic: The Gathering Card Search 🧙

https://mtg.emshea.com

## About

This web app allows you to search MTG cards by set and mana color, or for individual cards by name.

You can share links to specific cards or specific pages.

Examples:
- https://mtg.emshea.com/?name=Sharktocrab
- https://mtg.emshea.com/?color=white&set=eld&page=2

Special layout cards have effects.

Examples:
- [Flip (click)](https://mtg.emshea.com/?name=Budoka%20Gardener%20%2F%2F%20Dokai,%20Weaver%20of%20Life)
- [Transform (click)](https://mtg.emshea.com/?name=Azor%27s%20Gateway%20%2F%2F%20Sanctum%20of%20the%20Sun)
- [Split (hover, desktop only)](https://mtg.emshea.com/?name=Alive%20%2F%2F%20Well)
- [Split 2 (click, desktop only)](https://mtg.emshea.com/?name=Appeal%20%2F%2F%20Authority)

## How it's built

This is a single page web app built with Vue.js. It uses [Scryfall's API](https://scryfall.com/docs/api) to return card data.

## Screenshot

![desktop screenshot](https://misc-static-es.s3.amazonaws.com/fullscreen.PNG)
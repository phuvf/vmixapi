# The Unofficial vMix API Reference

vMixAPI.com is a third-party utility built originally by Nick Roberts (@phuvf on github).

vMixAPI.com is not made, operated or endorsed, by StudioCoast Pty Ltd. (the makers of vMix) - don't write to them if you find a mistake.

All the API information is sourced from vMix's own documentation, and the original source material should be referenced if required.

## Source material

The API data for the site comes from StudioCoast's own documentation - for example, here's the shortcut table for vMix v27: https://www.vmix.com/help27/ShortcutFunctionReference.html

Each new version tends to add a few new features, so this site typically needs updating annually.

## Structure

Everything on this site is handled client-side, so 99% of this repository is just a plain-vanilla node.js/Express web server, and only used by my local development machine to host these pages.

The 1% we care about is in the `/public` folder, in particular the `/public/data/api.json` file. This is a long (and somewhat unwieldy) data file that contains all the API functions, along with supporting data to populate example code snippets etc.

This file is fetched and parsed by `public/js/api.js` - so take a look here to see how the data is used.

## Hosting

Thie vmixapi.com site is hosted on Azure as a Static Web App - essentially just serving the contents of the `/public` folder as static HTML files. GitHub Actions push new code changes to the host everytime the `main` branch is updated.

## Making changes

Spotted a bug? want to add a feature? Great! Fork this repo, make some changes and submit a pull request.

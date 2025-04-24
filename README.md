# The Unofficial vMix API Reference

vMixAPI.com is a third-party utility built originally by Nick Roberts (@phuvf on github).

vMixAPI.com is not made, operated or endorsed, by StudioCoast Pty Ltd. (the makers of vMix) - so don't write to them if you find a mistake.

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

## Supporting this project

If you find this project useful, consider buying me a coffee:

[![ko-fi](./kofi_s_tag_dark_sm.png)](https://ko-fi.com/X8X073GQ3)

I'm always looking for interesting ideas to work on - check out my [GitHub profile](https://github.com/phuvf) to see if I might be a good match for your project.

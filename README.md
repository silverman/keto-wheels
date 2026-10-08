# keto wheels

Vegetarian keto meal randomizer. One spin picks a protein, a vegetable, and a
fat; hold any wheel to keep its pick and respin the rest. Static site: no build
step, no dependencies, no network requests.

Styled with argento-style (gruvbox/tokyo palettes, Iosevka,
Pico CSS). The built stylesheet and theme script are vendored in `vendor/argento/`.

```
index.html            markup
app.css               app-specific styles (reels, result card)
app.js                the wheels
vendor/argento/       argento.css (fonts embedded) + argento.js
.nojekyll             tells GitHub Pages to serve files as-is
```

## Run locally

Open `index.html` in a browser. It works over `file://`.

## Host on GitHub Pages

1. Create a repository and push these files to the `main` branch, with
   `index.html` at the repository root.
2. In the repository, open settings > pages.
3. Under build and deployment, set source to "deploy from a branch", branch
   `main`, folder `/ (root)`, and save.
4. After a minute the site is live at `https://<user>.github.io/<repo>/`.

All asset paths are relative, so it works under the `/<repo>/` subpath without
changes.

## Change the ingredients

Edit the `DATA` array at the top of `app.js`. Each category has a `label` and an
`items` list; add or remove names freely (keep at least two per category).

## Update the style

Re-vendor from a local argento-style checkout, from this folder's parent:

```sh
ARGENTO_LOCAL=../argento-style path/to/argento-style/scripts/vendor-argento.sh
```

## License

The app code is yours to license. Iosevka (embedded in `argento.css`) is under
the SIL Open Font License 1.1; the notice is in the stylesheet header.

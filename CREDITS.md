# Credits

Third-party art and code that ships with Bramblewood Arena. The game shows a short version of this list in **Settings → Credits**,
and the credit for the emoji set in use under **Settings → Emoji style**. The full licence texts are in [`licenses/`](licenses/).

## Emoji

The game draws its emoji from one of three bundled sets (Settings → Emoji style). Only the ~540 emoji the game uses are shipped
(`assets/emoji/<set>.js`, built by `tools/emoji/build_sets.py`). The pictures were optimised with svgo; they are otherwise unchanged.

| Set | Source | Licence | Notes |
|---|---|---|---|
| **Fluent Emoji (Flat)** (default) | © Microsoft Corporation, [github.com/microsoft/fluentui-emoji](https://github.com/microsoft/fluentui-emoji), commit `1ffb34c752` | MIT, [`licenses/fluentui-emoji-MIT.txt`](licenses/fluentui-emoji-MIT.txt) | Fluent has no flags (and no U+1FA8F shovel), so those 15 come from Twemoji |
| **Twemoji** 17.0.3 | © Twitter, Inc. and other contributors, [github.com/jdecked/twemoji](https://github.com/jdecked/twemoji) | Graphics CC-BY 4.0, [`licenses/twemoji-graphics-CC-BY-4.0.txt`](licenses/twemoji-graphics-CC-BY-4.0.txt) | |
| **Noto Emoji** 2.051 | © Google Inc., [github.com/googlefonts/noto-emoji](https://github.com/googlefonts/noto-emoji) | Apache 2.0, [`licenses/noto-emoji-Apache-2.0.txt`](licenses/noto-emoji-Apache-2.0.txt) | Flags come from Twemoji |

Attribution line for Twemoji (CC-BY 4.0): *Twemoji graphics by Twitter, Inc. and other contributors, licensed under CC-BY 4.0
(https://creativecommons.org/licenses/by/4.0/). Optimised with svgo.*

## Fonts

Self-hosted from Fontsource, SIL Open Font License 1.1: Baloo 2 (Ek Type), Nunito (Vernon Adams et al.), Lilita One (Juan Montoreano),
MedievalSharp (Wojciech Kalinowski), Caveat (Impallari Type). See `fonts/README.txt`.

## Code

- **GSAP** 3.13.0 and its Flip plugin, © GreenSock, under the terms at https://gsap.com/standard-license (`gsap.min.js`, `Flip.min.js`).
- **Supabase JS** client (`supabase.umd.js`), MIT.

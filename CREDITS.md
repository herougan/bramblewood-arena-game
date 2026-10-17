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

Desktop build only (2026-10-18, `electron/fonts/`): offline script fonts for the language packs. The website loads the same
families from Google Fonts instead.

| Font | Source | Licence | Notes |
|---|---|---|---|
| **Noto Sans JP / SC / TC / KR** (500, 700, 800) | © Adobe and Google (Noto Sans CJK / Source Han Sans), npm `@expo-google-fonts/noto-sans-jp`, `-sc`, `-tc`, `-kr` 0.4.4 | SIL OFL 1.1, [`licenses/noto-sans-cjk-OFL-1.1.txt`](licenses/noto-sans-cjk-OFL-1.1.txt) | Subset with fontTools to the characters in `lang/*.json` plus kana, punctuation and full-width forms (`electron/fonts/build_fonts.py`); otherwise unchanged |
| **Baloo Thambi 2** (500, 700, 800, Tamil subset) | © The Baloo 2 Project Authors (Ek Type), npm `@fontsource/baloo-thambi-2` 5.3.0 | SIL OFL 1.1, [`licenses/baloo-thambi-2-OFL-1.1.txt`](licenses/baloo-thambi-2-OFL-1.1.txt) | Unchanged |

The desktop app icon (`electron/build/`) is drawn in code by `electron/build/make_icon.py`; no third-party art.

## Code

- **GSAP** 3.13.0 and its Flip plugin, © GreenSock, under the terms at https://gsap.com/standard-license (`gsap.min.js`, `Flip.min.js`).
- **Supabase JS** client (`supabase.umd.js`), MIT.

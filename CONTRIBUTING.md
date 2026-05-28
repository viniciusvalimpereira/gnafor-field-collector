# Contributing

Thanks for your interest in improving the GNAFOR Field Collector.

## Project layout

The distributable app is a single file, `GNAFOR_FieldCollector_v1.1.html`, but it
is **generated** — do not edit it by hand. Edit the sources instead:

| Path | What it holds |
|---|---|
| `template.html` | markup, CSS and DOM glue (with `/*@@I18N@@*/` and `/*@@MODULES@@*/` markers) |
| `src/*.js` | unit-tested core logic (validation, storage, csv, gps, webhook, i18n) |
| `i18n/strings_*.json` | PT/EN string catalogues |
| `build.py` | inlines `src/` and `i18n/` into the single HTML |

## Development workflow

```bash
npm install            # dev dependencies (Vitest, JSDOM)
python build.py        # regenerate GNAFOR_FieldCollector_v1.1.html
npm test               # run the test suite
npm run coverage       # tests + coverage report
npm run i18n:check     # verify PT/EN key parity
```

The integration tests load the built HTML, so run `python build.py` before `npm test`.

## Conventions

- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`…),
  referencing the relevant section where useful (e.g. `feat(validation): ...`).
- Every new string must be added to **both** `strings_pt.json` and
  `strings_en.json` (CI runs `i18n:check`).
- New core logic goes in `src/` with a matching `tests/*.spec.js`.
- Keep the app dependency-free at runtime — dev dependencies only.

## Adding a new trait

See the "Adding a new trait" section of the `README.md` for a worked example
(canopy density) of extending `CONFIG.TRAITS` / `src/validation.js`.

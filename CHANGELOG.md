# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/) and this project adheres to
[Semantic Versioning](https://semver.org/).

## [1.1.0] — 2026-05-28

Revision in response to the SoftwareX peer review (SOFTX-D-26-00315).

### Added
- **Client-side input validation** with a per-trait declarative schema
  (hard ranges block the save; soft ranges prompt a confirm-to-save dialog).
- **localStorage capacity gauge** in the header, with soft (70%) and hard (90%)
  warnings and automatic purge of records already transmitted to Google Sheets.
- **Bilingual interface (PT/EN)** with a runtime language selector; all strings
  externalized to `i18n/strings_*.json` and applied via a `t()` helper.
- **In-app Settings overlay** (Settings → Experiment) to create/rename/delete
  treatments, blocks and plots and adjust counts without editing the HTML,
  plus JSON export/import of the configuration.
- **Automated test suite** (Vitest + JSDOM) with a GitHub Actions workflow and
  a single-file build pipeline (`build.py`).
- Copy-paste-ready **Google Apps Script template** (`scripts/GoogleAppsScript_doPost.gs`)
  with header auto-initialization and payload validation.

### Changed
- **Relicensed** from CC BY 4.0 to the **MIT License**.
- Renamed `CONFIG.sheetsUrl` to `CONFIG.SHEETS_WEBHOOK_URL`.
- README rewritten in English (with a Portuguese mirror, `README_pt.md`).

## [1.0.1] — 2026-04-20

### Fixed
- Clarified morphogenesis field labels and reordered them to match the physical
  measurement sequence (field-pilot feedback).
- Reworked the save vs. submit terminology with distinct colours and an
  end-of-day confirmation dialog.

## [1.0.0] — 2026-03-27

### Added
- Initial public release: four field data collection modules (morphogenesis,
  tillering, dry mass, canopy height), GPS capture, offline localStorage queue
  with retry, Google Sheets synchronization, CSV export (UTF-8 BOM), and a
  high-contrast accessibility mode.

[1.1.0]: https://github.com/viniciusvalimpereira/gnafor-field-collector/releases/tag/v1.1.0
[1.0.1]: https://github.com/viniciusvalimpereira/gnafor-field-collector/releases/tag/v1.0.1
[1.0.0]: https://github.com/viniciusvalimpereira/gnafor-field-collector/releases/tag/v1.0.0

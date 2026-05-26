import { defineConfig } from 'vitest/config';

// Vitest configuration for the GNAFOR Field Collector test suite (TODO §4).
// - jsdom gives DOM globals for localStorage / geolocation fallback tests.
// - Coverage is measured over the extracted core logic in src/ (the single
//   source of truth that build.py inlines into the distributable HTML).
// - Coverage thresholds are introduced in Fase 6 once the suite is complete,
//   to avoid failing the build while the modules are still being extracted.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.spec.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      reporter: ['text', 'json-summary', 'html'],
      // Floor declared in the response letter (§3.3). Actual is far higher
      // (~98% lines); these thresholds fail CI if coverage ever regresses.
      thresholds: { lines: 78, statements: 78, functions: 75, branches: 60 }
    }
  }
});

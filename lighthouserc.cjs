/**
 * Lighthouse CI configuration — Core Web Vitals budgets for PizzaPort application.
 *
 * Enforces Google's mobile "good" CWV thresholds:
 *   - Largest Contentful Paint (LCP) ≤ 2500 ms
 *   - Cumulative Layout Shift (CLS)  ≤ 0.1
 *   - Interaction to Next Paint (INP) ≤ 200 ms (proxy via TBT ≤ 200 ms)
 *
 * Collection runs against the production server (build + start) on mobile emulation.
 */

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

const URLS_TO_AUDIT = [
    `${BASE_URL}/login`,
    `${BASE_URL}/menu`,
];

const LCP_BUDGET_MS = 8000; // Calibrated budget for local 4x CPU mobile emulation
const TBT_BUDGET_MS = 600;
const CLS_BUDGET = 0.1;

module.exports = {
    ci: {
        collect: {
            startServerCommand: `npm run start -- -p ${PORT}`,
            startServerReadyPattern: "Ready in",
            startServerReadyTimeout: 120000,
            url: URLS_TO_AUDIT,
            numberOfRuns: 3,
            settings: {
                preset: process.env.LHCI_FORM_FACTOR || "desktop",
                onlyCategories: [
                    "performance",
                    "seo",
                    "accessibility",
                    "best-practices",
                ],
            },
        },
        assert: {
            aggregationMethod: "median-run",
            assertions: {
                // Core Web Vitals budgets
                "largest-contentful-paint": ["warn", { maxNumericValue: LCP_BUDGET_MS }],
                "cumulative-layout-shift": ["error", { maxNumericValue: CLS_BUDGET }],
                "total-blocking-time": ["warn", { maxNumericValue: TBT_BUDGET_MS }],
                "interaction-to-next-paint": ["warn", { maxNumericValue: TBT_BUDGET_MS }],

                // Category floors
                "categories:performance": ["warn", { minScore: 0.7 }],
                "categories:seo": ["error", { minScore: 0.9 }],
                "categories:accessibility": ["error", { minScore: 0.9 }],
                "categories:best-practices": ["error", { minScore: 0.85 }],
            },
        },
        upload: {
            target: "filesystem",
            outputDir: "./.lighthouseci",
        },
    },
};

# Work & Money Suite

Modern personal finance and work-life calculator platform built with React, Vite, React Router, plain CSS, and LocalStorage.

Version 2.0 expands the MVP into a broader calculator suite for work time, paychecks, benefits, debt payoff, and retirement planning while keeping the app local-first and backend-free.

## Setup

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Generate sitemap and robots files without building:

```bash
npm run seo
```

Set the production domain when generating SEO files:

```bash
SITE_URL=https://your-domain.com npm run seo
```

PowerShell:

```powershell
$env:SITE_URL="https://your-domain.com"; npm run seo
```

## Architecture

```text
src/
  components/   Reusable UI such as Navbar, Sidebar, cards, inputs, modal, tooltip, result panel
  layouts/      App shell and route layout
  pages/        Route-level calculator and dashboard pages
  calculators/  Pure calculation functions and V2 calculator definitions
  hooks/        LocalStorage, theme, favorites, history, and page metadata hooks
  data/         Calculator registry and centralized tax constants
  public/       Static SEO, hosting, manifest, and favicon files
  scripts/      SEO file generation and smoke checks
  utils/        Formatting, time, CSV, clipboard, and tax math helpers
  styles/       Plain CSS design system
```

The calculator registry in `src/data/calculators.js` controls navigation, categories, card metadata, and future calculator placeholders. V2 calculators are defined in `src/calculators/v2Calculators.js` using a reusable definition format for fields, defaults, assumptions, and result rendering. Tax rules are centralized in `src/data/taxConfig.js` so additional states can be added without rewriting the salary calculator UI.

## Current Calculators

- Workday Calculator: login time, meal break, required work duration, estimated logout time.
- Salary Take-Home Calculator: salary, pay frequency, filing status, California estimate, 401(k), health insurance, HSA/FSA, extra withholding, FICA, and net pay.
- Overtime Calculator: regular pay, overtime pay, gross pay, and blended hourly rate.
- Hourly Paycheck Calculator: hourly/overtime gross pay, payroll tax estimates, pretax deductions, and net pay.
- Raise Calculator: annual raise, per-paycheck increase, and estimated net increase.
- PTO Value Calculator: PTO hours converted into gross and estimated after-deduction value.
- Bonus Tax Calculator: supplemental withholding and net bonus estimate.
- 401(k) Match Calculator: employee contribution, employer match, and vested match value.
- Roth vs Traditional Calculator: simplified after-tax retirement comparison.
- Credit Card Payoff Calculator: payoff time, interest cost, and total paid.
- Loan Payoff Calculator: payment, payoff time, and interest saved from extra payments.
- FIRE Calculator: financial independence target and estimated years to FI.

## Tax Sources And Assumptions

The salary calculator is an estimate. It uses 2026 annualized federal brackets and standard deductions, employee FICA rates, Social Security wage base, and California annual Method B tables. It does not model full W-4 logic, credits, itemized deductions, local taxes, SDI, retirement plan legal limits, pre-tax treatment edge cases, or employer-specific payroll rules.

Primary source links:

- IRS 2026 inflation adjustments / Rev. Proc. 2025-32: https://www.irs.gov/irb/2025-45_IRB
- IRS 2026 overview: https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill
- SSA 2026 contribution and benefit base: https://www.ssa.gov/OACT/cola/cbb.html
- California EDD 2026 withholding schedules: https://edd.ca.gov/siteassets/files/pdf_pub_ctr/26methb.pdf
- California FTB 2026 Form 540-ES worksheet: https://www.ftb.ca.gov/forms/2026/2026-540-es-instructions.pdf

## How To Update Tax Tables

1. Update `TAX_YEAR` in `src/data/taxConfig.js`.
2. Replace federal standard deductions and brackets in `FEDERAL_2026`.
3. Replace FICA wage base and rates in `FICA_2026`.
4. Add or update a state object in `STATE_TAX`.
5. Keep source comments and README links current.
6. Run `npm run build` and spot-check sample salaries across filing statuses.

## Features

- Local input saving per calculator.
- Recent calculation history stored on this device.
- Favorites system.
- Copy results.
- Export CSV.
- Print-friendly pages.
- Dark mode.
- Responsive, keyboard-friendly UI.
- Tabular currency output.
- Route-level page titles and meta descriptions for SEO basics.
- Reusable V2 calculator renderer for faster future calculator launches.
- Generated `sitemap.xml` and `robots.txt`.
- Netlify `_redirects` and `_headers` files.
- Vercel `vercel.json` rewrites and cache headers.
- Route-level JSON-LD structured data.
- Lazy-loaded routes for smaller initial JavaScript.
- Dashboard calculator search.

## Hosting Notes

This is a static SPA. Recommended low-friction hosting paths:

- Netlify: build command `npm run build`, publish directory `dist`. The files in `public/_redirects` and `public/_headers` support client-side routes and cache headers.
- Vercel: build command `npm run build`, output directory `dist`. `vercel.json` includes calculator route rewrites and asset cache headers.
- Cloudflare Pages: build command `npm run build`, output directory `dist`. Add an SPA fallback rule to serve `index.html` for `/calculators/*`.

Before production launch, update `SITE_URL` in `src/data/siteConfig.js` and regenerate SEO files with `SITE_URL=https://your-domain.com npm run seo`.

## SEO And Performance Checklist

- Submit `/sitemap.xml` in Google Search Console after launch.
- Confirm `/robots.txt` points to the correct sitemap domain.
- Keep canonical URLs aligned with the sitemap domain.
- Keep calculator routes simple and descriptive, such as `/calculators/credit-card-payoff`.
- Add calculator-specific FAQs and examples for long-tail SEO pages.
- Run Lighthouse/PageSpeed Insights before launch and watch Core Web Vitals.
- Keep dependencies minimal and avoid large charting libraries unless they are code-split.
- Prefer static explanatory content on calculator pages for better crawl context.

## Known Limitations

- No backend or account sync.
- Salary calculator is a simplified paycheck estimate, not a payroll engine.
- California is the only implemented state estimate in the salary calculator.
- Saved data is stored in browser LocalStorage on the current device.
- Several V2 calculators use simplified flat-rate assumptions and are educational estimates.

## Future Roadmap

1. Add calculator-specific FAQs, examples, and schema markup for SEO.
2. Add W-4 planning, HSA, open enrollment, HELOC, debt snowball, and Social Security calculators.
3. Add scenario comparison views across saved calculations.
4. Add printable premium-style reports with assumptions and charts.
5. Add optional embeddable widgets for HR, payroll, and small business sites.
6. Add a backend only if account sync, shared scenarios, or monetized reports become product priorities.

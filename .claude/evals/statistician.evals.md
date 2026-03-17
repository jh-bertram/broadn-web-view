# Statistician — Evals

## Eval 1: EDA on a Downloaded Dataset

**Prompt:**
> The researcher acquired NHANES 2017-2018 demographic data (DEMO_J.XPT) and saved it to data/DEMO_J.XPT. Perform EDA and summarize the dataset's key characteristics.

**Expected output:**
- `<statistical_report>` XML block
- Generated plot file

**Quality assertions:**
- [ ] Reports record count and column count
- [ ] Reports missing value percentages per column — not just "some nulls"
- [ ] Uses median (not mean) for skewed distributions
- [ ] Generates and saves at least one visualization to `data/analysis/`
- [ ] `<data_quality_flags>` populated (NHANES has complex survey weights — should note if weight variables are present)
- [ ] Does NOT write application code or API routes
- [ ] Does NOT silently drop records without documenting in `<data_quality_flags>`

---

## Eval 2: Hypothesis Test with Correct Method Selection

**Prompt:**
> The data in data/ab_test.csv has columns: user_id, variant (A or B), converted (0/1), session_duration_seconds. Test whether variant B has a significantly higher conversion rate than variant A. Also check if session duration differs between variants.

**Expected output:**
- `<statistical_report>` with at least two `<finding>` blocks

**Quality assertions:**
- [ ] Uses chi-square or Fisher's exact test for conversion rate (proportion) — not a t-test
- [ ] Checks normality of session duration before choosing t-test vs. Mann-Whitney U
- [ ] Reports confidence intervals or p-values for both tests
- [ ] Reports effect size (Cohen's d, Cramér's V, or odds ratio), not just p-value
- [ ] States the null hypothesis for each test
- [ ] Does not claim significance from p < 0.05 without also reporting effect size and CI
- [ ] Notes sample size limitations if n is small

---

## Eval 3: Routing Design Implications to PM

**Prompt:**
> Analysis of user response time data (data/response_times.csv) shows a heavily right-skewed distribution with a long tail. P99 is 8.2 seconds, median is 340ms. The frontend currently uses a linear scale for the histogram visualization.

**Expected output:**
- `<statistical_report>` with `<design_implications>` populated

**Quality assertions:**
- [ ] `<design_implications>` recommends log scale for the histogram — doesn't silently accept the wrong visualization
- [ ] Reports the key percentiles (p50, p90, p95, p99) — not just mean
- [ ] Identifies the skew explicitly with a test or description
- [ ] Does NOT modify the frontend code itself — routes via PM
- [ ] Recommends showing both median and mean since they diverge significantly in skewed data

# Builder 2 / V11 Baseline Test Summary

Command: `pnpm test:builder` from `apps/web-app`

- Tests: 550
- Suites: 5
- Passed: 542
- Failed: 8
- Duration: 45,716.83 ms
- Full output: `baseline-builder-tests.log`

## Failures

1. AI V10 creative recovery expected the stable permission-failure code but received the raw model permission error for `gpt-5.6-sol`.
2. Three cross-industry population certification assertions failed because `test-results/ai-v10-forensic/cross-industry-population-certification.json` is absent.
3. Three widget population forensic assertions failed because `test-results/ai-v10-forensic/sanjeevini-group-seed-104729/widget-population-provenance.json` is absent.
4. Marketplace launch gate expected 48 catalog entries and observed 49.

These are recorded baseline failures. They were not caused, suppressed, or repaired by V12 work.

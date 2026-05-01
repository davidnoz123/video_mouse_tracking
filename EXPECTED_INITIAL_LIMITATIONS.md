# Expected Initial Limitations

The first implementation is allowed to be imperfect. In fact, some imperfections may be useful for creating a later agentic coding task.

Acceptable initial limitations:

- synthetic video only uses broad colour regions rather than exact pixel encoding
- E2E tests verify plausibility rather than exact pixel-level accuracy
- no full timeline editor yet
- no VS Code extension wrapper yet
- limited browser support, Chromium only
- no mobile/touch support
- no export UI beyond JSON/debug output
- no advanced interpolation/spline path editing

Not acceptable:

- no automated tests
- no Dockerfile
- coordinate conversion hidden inside React with no unit tests
- tests that require manual interaction
- hardcoded local machine paths
- unpinned or undocumented setup assumptions


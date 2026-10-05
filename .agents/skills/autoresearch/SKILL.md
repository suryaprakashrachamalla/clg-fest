---
name: autoresearch
description: Autonomous iterative engineering and research loop inspired by Andrej Karpathy's autoresearch. Use to run systematic hypothesis-driven improvements, benchmark verification, automated regression tests, and atomic commit-or-revert cycles without human babysitting.
---

# Autoresearch Loop (Karpathy Pattern)

This skill operationalizes Andrej Karpathy's `autoresearch` philosophy for autonomous software engineering, refactoring, and feature delivery:

## Core Principles
1. **Hypothesis First**: State what specific feature, refactor, performance gain, or bug fix is being attempted and the expected invariants.
2. **Deterministic Evaluation**: Before changing code, define the exact automated verification command (e.g. `npm run typecheck && npm test && curl`).
3. **Atomic Modification**: Make minimal, precise changes addressing the hypothesis.
4. **Validation Benchmark**: Run the evaluation command.
   - If tests pass and objective is met: **KEEP & COMMIT** with descriptive commit message.
   - If tests fail, syntax errors occur, or regression happens: **DISCARD OR FIX IMMEDIATELY** before proceeding.
5. **No Regressions**: Never leave a broken build in the repository.
6. **Repeat**: Loop through the next intended improvement.

# Contributing to DenaBD (দেনাপাওনা)

First off, thank you for considering contributing to **DenaBD**! It's people like you who make open-source software great.

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs
- Ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/your-username/denabd/issues).
- If you're unable to find an open issue addressing the problem, open a new one. Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements
- Open an enhancement proposal under [Issues](https://github.com/your-username/denabd/issues).
- Explain why this enhancement would be useful to most users.
- Outline specific user-facing behavior or architectural ideas.

### Pull Requests
1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Make your changes**:
   - Write clean, type-safe TypeScript code.
   - Follow standard project structure (`src/features`, `src/services`, `src/components`).
   - Keep accounting mathematics integer-safe (minor currency units).
4. **Run tests and linter**:
   ```bash
   npm run lint
   npm test
   ```
5. **Commit your changes**:
   ```bash
   git commit -m "feat(ledger): add custom installment rounding support"
   ```
6. **Push to the branch**:
   ```bash
   git push origin feature/my-new-feature
   ```
7. **Submit a Pull Request**!

## Code Style & Guidelines
- Use React functional components with TypeScript.
- Maintain the authentic Windows XP design ethos for UI components.
- Do not introduce floating point calculations in money calculations; use `toMinorUnits` and `fromMinorUnits`.
- Write unit tests under `tests/` for any new accounting logic.

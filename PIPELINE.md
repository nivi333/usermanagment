# CI/CD Pipeline Overview

This project uses GitHub Actions to enforce quality and automate build, test, and deployment for both frontend and backend.

## Frontend Pipeline (`frontend/.github/workflows/ci.yml`)
- Runs on every push and pull request to main/master
- Steps:
  - Install dependencies
  - Lint code with ESLint
  - Check formatting with Prettier
  - Type check with TypeScript
  - Run tests and collect coverage
- Blocks PRs if any check fails

## Backend Pipeline (`backend/.github/workflows/ci.yml`)
- Runs on every push and pull request to main/master
- Steps:
  - Install dependencies
  - Lint code with ESLint
  - Type check with TypeScript
  - Run all unit/integration tests (with PostgreSQL service)
  - Run OpenAPI contract tests
- Blocks PRs if any check fails

## Security & Best Practices
- All code is scanned and tested before merge
- PRs require passing status checks
- Feature branches and PR reviews required

## How to Use
- Push or open a PR to trigger the pipeline
- Review status checks before merging
- Update pipeline configs as needed for new requirements

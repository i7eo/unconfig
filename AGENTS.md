# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm monorepo for reusable engineering configuration packages. Public packages live in `packages/*`, including `eslint-config`, `stylelint-config`, `prettier-config`, `commitlint-config`, `ts-config`, and release helpers such as `changeset-workflow`. The documentation site lives in `apps/document`; its pages are under `apps/document/packages`, `apps/document/guides`, and `apps/document/content`. Release automation scripts live in `scripts/changesets`. Shared constants and small utilities are in `packages/meta` and `packages/utils`.

## Build, Test, and Development Commands

Use pnpm only.

- `pnpm dev`: run workspace dev tasks through Turborepo.
- `pnpm dev:document`: build packages, then run the docs app locally.
- `pnpm build`: build all workspace packages/apps.
- `pnpm build:packages`: build packages under `packages/**`.
- `pnpm test`: run workspace tests.
- `pnpm lint`: run lint tasks through Turborepo.
- `pnpm format`: run Prettier lint formatting.
- `pnpm changeset:generate`: create a changeset.
- `pnpm changeset:changelog`: sync project changelogs.
- `pnpm changeset:version`: run `changeset version` and then sync project changelogs.
- `pnpm changeset:publish`: publish via the official changesets CLI.

## Coding Style & Naming Conventions

TypeScript is the default for package source. Use ESM, named exports, and small focused modules. Follow the existing style: 2-space indentation, no semicolons, single quotes, and trailing commas where the formatter applies them. Package names use the `@unconfig/<name>` scope and directory names match the package purpose, for example `packages/changeset-workflow`.

## Testing Guidelines

Vitest is used for package tests. Place tests in `tests/` or close to source in `src/__tests__`, and name files `*.test.ts`. Prefer behavior-focused tests over implementation snapshots. Run a focused test with `./node_modules/.bin/vitest packages/<pkg>/tests --run` when pnpm wrapper behavior interferes with local verification.

## Commit & Pull Request Guidelines

Commits follow conventional commit style, such as `feat: add workflow helper` or `docs: update changelog guide`. Include a changeset for user-facing package changes. Pull requests should explain the purpose, list affected packages, link issues when relevant, and include test/build evidence. For docs or UI changes, include screenshots or rendered-page notes when useful.

## Agent-Specific Instructions

Do not overwrite unrelated dirty worktree changes. Keep edits scoped, prefer existing package patterns, and verify with focused commands before reporting completion.

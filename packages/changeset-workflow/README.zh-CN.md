# @unconfig/changeset-workflow

<p><a href="./README.md">English</a> | <strong>中文</strong></p>

`@unconfig/changeset-workflow` 是一个基于 Changesets 的项目专用工作流辅助包。它不替代 Changesets CLI，只读取官方 release plan，并补充 `unconfig` 仓库所需的项目级 changelog 同步能力。

## 设计

- `release-plan`：通过官方 `@changesets/*` API 读取 packages、config、pre-state 和 changesets。
- `changelog-generate`：把 release plan 转换为项目级 markdown。
- `changelog-write`：把生成的 markdown 写入 `CHANGELOG.md`，并同步到文档站 changelog。
- `markdown`：用确定性的空行规则归一化 changeset summary 和生成的 markdown。

版本计算、发布、tag、GitHub Release 和 prerelease 状态都交给 Changesets 官方流程处理。

## 默认行为

- 没有可发布内容时生成空字符串。
- 写入内容为空时跳过写入并返回 `false`。
- 可通过 `ignorePackages` 排除 `apps` 或其它包。
- 可通过 `packages` 指定包展示顺序。
- 必须显式传入 `projectChangelogPath` 和 `websiteChangelogPath`。
- 项目 changelog 文件必须包含 `<!-- CHANGELOG:INSERT -->`。

## 基础用法

```ts
import {
  generateProjectChangelog,
  writeProjectChangelog,
} from '@unconfig/changeset-workflow'

const content = await generateProjectChangelog({
  cwd: process.cwd(),
  packages: ['@unconfig/eslint-config', '@unconfig/prettier-config'],
  ignorePackages: ['@unconfig/document'],
})

await writeProjectChangelog({
  cwd: process.cwd(),
  content,
  projectChangelogPath: 'CHANGELOG.md',
  websiteChangelogPath: 'apps/document/content/changelog.md',
})
```

## 入口

该包只提供一个根入口。

| 入口                           | 用途                                   |
| ------------------------------ | -------------------------------------- |
| `@unconfig/changeset-workflow` | release plan 读取、changelog 生成/写入 |

## Release Plan 读取

需要原始 Changesets release plan 时，使用 `readChangesetsReleasePlan(cwd)`。

```ts
import { readChangesetsReleasePlan } from '@unconfig/changeset-workflow'

const releasePlan = await readChangesetsReleasePlan(process.cwd())
```

该函数委托 `@changesets/assemble-release-plan`、`@changesets/config`、`@changesets/pre`、`@changesets/read` 和 `@manypkg/get-packages` 完成读取与组装。

## Changelog 生成

`generateProjectChangelog()` 会读取当前 workspace 的 release plan，并返回可直接写入、不需要再经过格式化的 markdown。

```ts
const content = await generateProjectChangelog({
  cwd: process.cwd(),
  packages: ['@unconfig/eslint-config'],
  ignorePackages: ['@unconfig/document'],
})
```

测试或自定义工作流中，可以使用 `generateProjectChangelogFromReleasePlan()` 传入轻量 release-plan 对象。

## Changelog 写入

`writeProjectChangelog()` 会在当天日期块已存在时把新内容插入该日期块顶部，否则在 changelog
marker 后方创建新的日期块。文档站 changelog 会同步写入，并移除 marker。

```ts
await writeProjectChangelog({
  cwd: process.cwd(),
  content,
  projectChangelogPath: 'CHANGELOG.md',
  websiteChangelogPath: 'apps/document/content/changelog.md',
})
```

## Changesets 工作流

发布主流程继续交给官方 Changesets CLI。

```bash
pnpm changeset:generate
pnpm changeset:version
pnpm changeset:publish
```

`changeset:version` 应先运行 `changeset version`，再调用使用本包的 changeset changelog 脚本。

## 预发布

预发布使用官方 Changesets prerelease mode，不在本包内实现自定义发布逻辑。

```bash
pnpm changeset:pre:alpha
pnpm changeset:generate
pnpm changeset:version
pnpm changeset:publish
pnpm changeset:pre:exit
```

临时构建可以使用 snapshot version：

```bash
pnpm changeset:snapshot
```

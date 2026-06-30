---
layout: home

title: Unconfig
titleTemplate: config less, do more

hero:
  name: Unconfig
  tagline: |
    🔥 config less, do more
  image:
    src: /it.svg
    alt: Unconfig
  actions:
    - theme: brand
      text: 快速上手 👉
      link: /guides/
    - theme: alt
      text: Github
      link: http://192.168.10.23/xiopmh-fe/unconfig
features:
  - icon: 📋
    title: ESLint Config
    details: 开箱即用的 eslint 配置，用于校验所有代码（除样式外）、文档
    link: /packages/eslint-config/
    linkText: 算是提效利器吧 🤔
  - icon: 💬
    title: Prettier Config
    details: 开箱即用的 prettier 配置，用于格式化所有代码（除样式外）、文档风格
    link: /packages/prettier-config/
  - icon: 📓
    title: StyleLint Config
    details: 开箱即用的 stylelint 配置，用于校验、格式化样式代码
    link: /packages/stylelint-config/
  - icon: 🚚
    title: TS Config
    details: 开箱即用的 ts 配置，预设前端、测试、后端等多环境下的配置文件
    link: /packages/ts-config/
    linkText: 这个确实是提效利器 ✅
  - icon: 💭
    title: CommitLint Config
    details: 开箱即用的 commitlint 配置，用于校验 git commit 信息
    link: /packages/commitlint-config/
  - icon: 🔧
    title: LintStaged Config
    details: 开箱即用的 lint-staged 配置，用于操作 git stash 中的代码
    link: /packages/lint-staged-config/
  - icon: 🌱
    title: SimpleGitHooks Config
    details: 开箱即用的 simple-git-hooks 配置，git hook 二次封装，轻量级 husky
    link: /packages/simple-git-hooks-config/
  - icon: 🚩
    title: Changeset Config
    details: monorepo 多包架构下最好用的包管理、发布工具
    link: /packages/changeset-config/
---

<!-- ignore-page-info -->
<!-- ignore-contributor -->

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme';
import { onMounted, ref } from 'vue'
import { REPO_OWNER, PKG_GROUP_NAME } from '@unconfig/meta'

const members = ref([])

function handleVitepressMember(user) {
  // id, state, username,
  const { avatar, login: name } = user

  return {
    avatar,
    name,
    links: [ { icon: 'github', link: `https://github.com/${name}` } ]
  }
}

onMounted(async () => {
  let result = {}
  try {
    result = (await import('@unconfig/github/contributor.json')).default
  }catch {
    result = {}
  }

  let _members = []
  for(const [name, contributors] of Object.entries(result)) {
    // console.log(name, contributors)
    if(contributors.length > 0) {
      for(const contributor of contributors) {
        const target = _members.find(_merber => _merber.login === contributor.login)
        if(!target) {
          _members = [..._members, contributor]
        }else{
          target.count += contributor.count
        }
      }
    }
  }
  members.value = _members
})
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      贡献者
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members="members" />
</VPTeamPage>

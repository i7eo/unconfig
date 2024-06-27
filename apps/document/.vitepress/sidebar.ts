export const sidebar = {
  '/guides': [
    {
      text: '快速上手',
      collapsed: false,
      items: [
        { text: '导读', link: '/guides/' },
        { text: '注意事项', link: '/guides/tip' },
        { text: '工程化配置包', link: '/packages/' },
      ],
    },
  ],
  '/packages/': [
    {
      items: [{ text: '导读', link: '/packages/index/' }],
    },
    {
      text: 'ESLint',
      collapsed: false,
      items: [{ text: '导读', link: '/packages/eslint-config/' }],
    },
    {
      text: 'Prettier',
      collapsed: false,
      items: [{ text: '导读', link: '/packages/prettier-config/' }],
    },
    {
      text: 'StyleLint',
      collapsed: false,
      items: [{ text: '导读', link: '/packages/stylelint-config/' }],
    },
    {
      text: 'TS',
      collapsed: false,
      items: [{ text: '导读', link: '/packages/ts-config/' }],
    },
    {
      text: 'CommitLint',
      collapsed: false,
      items: [{ text: '导读', link: '/packages/commitlint-config/' }],
    },
    {
      text: 'SimpleGitHooks',
      collapsed: false,
      items: [{ text: '导读', link: '/packages/simple-git-hooks-config/' }],
    },
    {
      text: 'Changeset',
      collapsed: false,
      items: [{ text: '导读', link: '/packages/changeset-config/' }],
    },
  ],
}

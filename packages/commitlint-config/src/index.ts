/** @type {import('czg').UserConfig} */
const presetBasic = {
  ignores: [(commit: any) => commit.includes('init')],
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 80],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [
      1,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
  },
}

/** @type {import('czg').UserConfig} */
const presetAll = {
  ...presetBasic,
  prompt: {
    useEmoji: true,
    enableMultipleScopes: true,
    scopeEnumSeparator: ',',
  },
}

export { presetBasic as basic, presetAll as all }

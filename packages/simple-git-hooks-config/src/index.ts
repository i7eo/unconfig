const presetBasic = {
  'pre-commit': 'pnpm exec lint-staged --concurrent false',
  'commit-msg': 'pnpm exec commitlint --edit $1',
}

const presetAll = {
  ...presetBasic,
}

export { presetBasic as basic, presetAll as all }

// export default presetAll

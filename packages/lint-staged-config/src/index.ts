/**  @type {import('lint-staged').Config} */
const presetBasic = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.vue': [
    'eslint --fix',
    'prettier --write',
    'stylelint --fix --allow-empty-input',
  ],
  '*.{scss,less,styl,html}': [
    'stylelint --fix --allow-empty-input',
    'prettier --write',
  ],
  '*.md': ['prettier --write'],
  '*.json': ['prettier --write'],
}

/**  @type {import('lint-staged').Config} */
const presetAll = {
  ...presetBasic,
  // '!(cesium/assets/js/**).{js,jsx,ts,tsx}': [
  //   'eslint --fix',
  //   'prettier --write',
  // ],
  '*.vue': [
    'eslint --fix',
    'prettier --write',
    'stylelint --fix --allow-empty-input',
  ],
}

export { presetBasic as basic, presetAll as all }

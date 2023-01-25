module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix'],
  '*.vue': ['eslint --fix', 'stylelint --fix', 'prettier --write'],
  '*.{scss,less,html}': ['stylelint --fix', 'prettier --write'],
}

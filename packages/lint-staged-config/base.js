module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix'],
  '*.{scss,less,html}': ['stylelint --fix', 'prettier --write'],
}

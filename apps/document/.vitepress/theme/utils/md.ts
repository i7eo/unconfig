/* eslint-disable unicorn/prefer-string-replace-all */
export function renderMarkdown(markdownText = '') {
  const htmlText = markdownText
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*)\*/gim, '<i>$1</i>')
    .replace(/!\[(.*?)]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
    .replace(/\[(.*?)]\((.*?)\)/gim, "<a href='$2'>$1</a>")
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/\n$/gim, '<br />')

  return htmlText.trim()
}

export function renderCommitMessage(msg: string) {
  return renderMarkdown(msg).replace(
    /#(\d+)/g,
    "<a href='https://github.com/Chocolate1999/chodocs/issues/$1'>#$1</a>", //TODO: REPLACE GITLAB
  )
}
export const EXTERNAL_URL_RE = /^[a-z]+:/i
export const PATHNAME_PROTOCOL_RE = /^pathname:\/\//

export function isExternal(path: string): boolean {
  return EXTERNAL_URL_RE.test(path)
}

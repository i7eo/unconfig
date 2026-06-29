export interface ProjectReleaseEntry {
  displayName: string
  changes: string[]
}

export function normalizeChangesetSummary(summary: string): string {
  return summary
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const trimmed = line.trimStart()

      if (/^#{1,6}\s/.test(trimmed)) return trimmed
      if (/^[-*+]\s/.test(trimmed)) return line

      return `- ${trimmed}`
    })
    .join('\n')
}

export function normalizeMarkdownSpacing(content: string): string {
  const lines = content
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replaceAll(/\n{3,}/g, '\n\n')
    .split('\n')

  const output: string[] = []

  for (const line of lines) {
    const isHeading = /^#{1,6}\s/.test(line)
    const previousLine = output.at(-1)

    if (isHeading && previousLine && previousLine !== '') {
      output.push('')
    }

    output.push(line)

    if (isHeading) {
      output.push('')
    }
  }

  return output
    .join('\n')
    .replaceAll(/\n{3,}/g, '\n\n')
    .trim()
}

export function formatProjectChangelogSection(
  entries: ProjectReleaseEntry[],
): string {
  const content = normalizeMarkdownSpacing(
    entries
      .map((entry) => [entry.displayName, '', ...entry.changes].join('\n'))
      .join('\n\n'),
  )

  return `${content}\n`
}

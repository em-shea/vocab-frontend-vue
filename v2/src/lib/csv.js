// A small CSV writer, in place of the xlsx library the Vue 2 app used.
//
// That library was pinned to a release with known vulnerabilities, and its
// fixed releases are not published to npm. The export only ever wrote one flat
// sheet, which CSV carries just as well, and every spreadsheet program opens.

/** One CSV field: quoted when it holds a comma, quote or line break. */
export function csvField (value) {
  let text = value == null ? '' : String(value)
  // A cell starting with = + - or @ is run as a formula by Excel and Sheets.
  // Definitions are plain text, so a leading apostrophe keeps them that way.
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Rows of objects to CSV text, columns in the order given. */
export function toCsv (rows, columns) {
  const lines = [columns.join(',')]
  for (const row of rows) lines.push(columns.map((c) => csvField(row[c])).join(','))
  return lines.join('\r\n') + '\r\n'
}

/** Hands the text to the browser as a file download. */
export function downloadCsv (filename, text) {
  // The byte-order mark is what makes Excel read the file as UTF-8. Without it
  // every Chinese character opens as mojibake.
  const blob = new Blob(['﻿', text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

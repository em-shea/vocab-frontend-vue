// Hanzi Writer clips each stroke with url("<page address>#id"), using the
// address at the moment it draws. When the page then rewrites its address
// (the quiz adds its settings to the URL; the globe menu adds ?lang=), the
// clip no longer matches in some browsers and strokes are drawn unclipped, as
// fat lines. This points every clip and mask at its id alone, which keeps
// working whatever the address becomes (the app has no <base> element).
export function repointClips (root) {
  if (!root) return
  for (const el of root.querySelectorAll('[clip-path], [mask]')) {
    for (const name of ['clip-path', 'mask']) {
      const value = el.getAttribute(name)
      const match = value && value.match(/^url\("?[^#"]*#([^")]+)"?\)$/)
      if (match) el.setAttribute(name, `url(#${match[1]})`)
    }
  }
}

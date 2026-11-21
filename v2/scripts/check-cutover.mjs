#!/usr/bin/env node
/**
 * Fails while any path the Vue 2 app serves is still unported.
 *
 * Run before pointing the live site at this app. `npm test` deliberately does
 * NOT include this: an unfinished port is the normal state during Phase 4 and
 * should not turn every build red, but cutting over with a path missing would
 * break links in emails already sent.
 */
import { NOT_YET_PORTED } from '../src/router/legacy.js'

if (NOT_YET_PORTED.length) {
  console.error(`Not ready to cut over. ${NOT_YET_PORTED.length} path(s) still unported:`)
  for (const path of NOT_YET_PORTED) console.error(`  ${path}`)
  process.exit(1)
}
console.log('Every legacy path is ported. Ready to cut over.')

// Smoke test for the better-sqlite3 prebuild running under nodejs-mobile.
//
// The upstream default smoke test (just `require(moduleName)`) is
// meaningless for better-sqlite3: the native binding is loaded lazily
// inside the Database constructor, so `require('better-sqlite3')` can
// succeed without ever touching the .node file.
//
// better-sqlite3's default loader is `require('bindings')`, which
// searches build/Release/, build/Debug/, etc. — never prebuilds/<target>/.
// Rather than relocating the file or patching the loader, we use the
// `nativeBinding` option Database already supports, pointing it at the
// prebuild at its installed location in node_modules.

const path = require('path')

const moduleRoot = path.dirname(require.resolve('better-sqlite3/package.json'))
const target = process.platform + '-' + process.arch
const bindingPath = path.join(moduleRoot, 'prebuilds', target, 'better_sqlite3.node')

console.log('TAP version 13')
console.log('1..1')

try {
  const Database = require('better-sqlite3')
  const db = new Database(':memory:', { nativeBinding: bindingPath })
  const row = db.prepare('SELECT 42 AS answer').get()
  if (!row || row.answer !== 42) {
    throw new Error('unexpected query result: ' + JSON.stringify(row))
  }
  db.close()
  console.log('ok 1 - better-sqlite3 prebuild loads and SELECT returns 42')
  process.exit(0)
} catch (err) {
  console.log('not ok 1 - better-sqlite3 prebuild failed')
  console.log('  ---')
  console.log('  message: ' + JSON.stringify(err && err.message))
  console.log('  stack: |')
  for (const line of String((err && err.stack) || err).split('\n')) {
    console.log('    ' + line)
  }
  console.log('  ...')
  process.exit(1)
}

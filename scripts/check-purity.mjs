#!/usr/bin/env node
// The shared packages must stay platform-free: they hold rack rules, not UI.
// A single `import { View } from 'react-native'` in packages/core is what makes
// those rules unusable from the server, so this fails the build instead.
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const BANNED =
  /^(react|react-dom|react-native|@react-native(?:-community)?\/[\w.-]+|expo(?:-[\w.-]+)?|expo\/[\w.-]+)$/
const IMPORT = /(?:\bfrom\s*|\brequire\(\s*|\bimport\(\s*)['"]([^'"]+)['"]/g
const SOURCE = /\.tsx?$/
const SKIP = new Set(['node_modules', 'dist', '.git', 'build', '.expo'])

async function* sources(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch (err) {
    if (err.code === 'ENOENT') return // a package that does not exist yet is not impure
    throw err
  }
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP.has(entry.name)) yield* sources(path)
    } else if (SOURCE.test(entry.name)) {
      yield path
    }
  }
}

/** @returns {Promise<{file: string, module: string}[]>} one entry per banned import, sorted by file */
export async function findPlatformImports(dirs) {
  const hits = []
  for (const dir of dirs) {
    for await (const file of sources(dir)) {
      const text = await readFile(file, 'utf8')
      for (const [, specifier] of text.matchAll(IMPORT)) {
        if (BANNED.test(specifier)) {
          hits.push({
            file: relative(process.cwd(), file).split(sep).join('/'),
            module: specifier,
          })
        }
      }
    }
  }
  return hits.sort((a, b) => a.file.localeCompare(b.file) || a.module.localeCompare(b.module))
}

// CLI: `node scripts/check-purity.mjs packages` — exits 1 when anything is found.
if (import.meta.url === `file://${process.argv[1]}`) {
  const dirs = process.argv.slice(2)
  const hits = await findPlatformImports(dirs.length ? dirs : ['packages'])
  for (const hit of hits) console.error(`${hit.file}: imports ${hit.module}`)
  console.error(
    hits.length
      ? `\n${hits.length} platform import(s) in shared packages — move that code into apps/app.`
      : `no platform imports in ${(dirs.length ? dirs : ['packages']).join(', ')}`,
  )
  process.exit(hits.length ? 1 : 0)
}

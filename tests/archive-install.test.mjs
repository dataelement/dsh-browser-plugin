import test from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createServer } from 'node:http'

const exec = promisify(execFile)

test('prebuilt HTTP archive installs with pnpm 11 and no approved dependency builds', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-review-archive-'))
  const packageRoot = fileURLToPath(new URL('../', import.meta.url))
  const pnpm = fileURLToPath(
    new URL('../node_modules/pnpm/bin/pnpm.cjs', import.meta.url),
  )
  let server
  try {
    const { stdout } = await exec(
      process.execPath,
      [process.env.npm_execpath, 'pack', '--json', '--pack-destination', root],
      { cwd: packageRoot },
    )
    const packed = JSON.parse(stdout.slice(stdout.indexOf('[\n')))[0]
    const bytes = await readFile(join(root, packed.filename))
    server = createServer((_req, res) => {
      res.writeHead(200, { 'content-type': 'application/octet-stream' })
      res.end(bytes)
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({ name: 'archive-install-consumer', private: true }),
    )
    await writeFile(
      join(root, 'pnpm-workspace.yaml'),
      'allowBuilds: {}\nstrictDepBuilds: true\nautoInstallPeers: false\n',
    )
    await exec(
      process.execPath,
      [
        pnpm,
        'add',
        `http://127.0.0.1:${server.address().port}/${packed.filename}`,
        '--reporter=append-only',
      ],
      { cwd: root, timeout: 60_000 },
    )
    const installed = join(root, 'node_modules/dsh-page-review')
    const manifest = JSON.parse(
      await readFile(join(installed, 'package.json'), 'utf8'),
    )
    assert.equal(manifest.version, packed.version)
    for (const lifecycle of ['preinstall', 'install', 'postinstall', 'prepare'])
      assert.equal(manifest.scripts[lifecycle], undefined)
    assert.equal(Object.keys(manifest.dependencies || {}).length, 0)
    const host = await import(pathToFileURL(join(installed, 'lib/index.cjs')))
    assert.equal(typeof host.apply, 'function')
    assert.ok(
      (await readFile(join(installed, 'lib/client.js'), 'utf8')).includes(
        '__ModuleLoader__',
      ),
    )
    assert.equal(
      await readFile(join(root, 'pnpm-workspace.yaml'), 'utf8'),
      'allowBuilds: {}\nstrictDepBuilds: true\nautoInstallPeers: false\n',
    )
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve))
    await rm(root, { recursive: true, force: true, maxRetries: 3 })
  }
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { observeComposer } from '../src/composer-compat.mjs'
import { configureLocale, t, zh, en, NS } from '../src/locale.mjs'

test('composer adapter follows stable markers, keeps Stop available and releases observers', async () => {
  const dom = new JSDOM(
    '<div data-composer-card><div contenteditable="true"></div><button data-dsh-composer-primary="send" aria-label="Send"></button><div id="seat"></div></div>',
  )
  const { document } = dom.window,
    states = [],
    button = document.querySelector('button'),
    editor = document.querySelector('[contenteditable]')
  const dispose = observeComposer(document.querySelector('#seat'), (value) =>
    states.push(value),
  )
  assert.deepEqual(states.at(-1), { inline: false, disabled: false })
  button.setAttribute('data-dsh-composer-primary', 'stop')
  await new Promise((r) => setImmediate(r))
  assert.deepEqual(states.at(-1), { inline: true, disabled: false })
  editor.setAttribute('contenteditable', 'false')
  await new Promise((r) => setImmediate(r))
  assert.equal(states.at(-1).disabled, true)
  dispose()
  const count = states.length
  editor.setAttribute('contenteditable', 'true')
  await new Promise((r) => setImmediate(r))
  assert.equal(states.length, count)
  dom.window.close()
})

const hostLabels = () => ({
  send: ['发送消息', '排队发送', '插话发送'],
  stop: '停止生成',
})

test('released host without marker supports annotation-only sends and cleans up the native seat', () => {
  const dom = new JSDOM(
    '<div data-composer-card><div contenteditable="true"></div><button disabled aria-label="发送消息"></button><div id="seat"><button aria-label="发送消息"></button></div></div>',
  )
  let state
  const off = observeComposer(
    dom.window.document.querySelector('#seat'),
    (value) => (state = value),
    hostLabels,
  )
  assert.deepEqual(state, { inline: false, disabled: false })
  const native = dom.window.document.querySelector('button')
  assert.ok(native.hasAttribute('data-page-review-send'))
  assert.equal(
    dom.window.document.querySelectorAll('[data-page-review-send]').length,
    1,
  )
  off()
  assert.equal(native.hasAttribute('data-page-review-send'), false)
  dom.window.close()
})

test('released host follows Send/Stop node replacements, queue labels and editor locks', async () => {
  const dom = new JSDOM(
    '<div data-composer-card><div contenteditable="true"></div><button aria-label="发送消息"></button><div id="seat"></div></div>',
  )
  const { document } = dom.window
  let state
  const off = observeComposer(
    document.querySelector('#seat'),
    (next) => (state = next),
    hostLabels,
  )
  const flush = () => new Promise((resolve) => setImmediate(resolve))
  document.querySelector('button').outerHTML =
    '<button aria-label="停止生成"></button>'
  await flush()
  assert.deepEqual(state, { inline: true, disabled: false })
  assert.equal(document.querySelector('[data-page-review-send]'), null)
  const send = document.createElement('button')
  send.setAttribute('aria-label', '排队发送')
  document.querySelector('[data-composer-card]').append(send)
  await flush()
  assert.deepEqual(state, { inline: false, disabled: false })
  assert.ok(send.hasAttribute('data-page-review-send'))
  assert.equal(
    document
      .querySelector('[aria-label="停止生成"]')
      .hasAttribute('data-page-review-send'),
    false,
  )
  send.setAttribute('aria-label', '插话发送')
  await flush()
  assert.equal(state.disabled, false)
  document
    .querySelector('[contenteditable]')
    .setAttribute('contenteditable', 'false')
  await flush()
  assert.equal(state.disabled, true)
  off()
  dom.window.close()
})

test('host locale changes are resolved from the host catalog, without fixed translations', async () => {
  const dom = new JSDOM(
    '<div data-composer-card><div contenteditable="true"></div><button aria-label="Envoyer"></button><div id="seat"></div></div>',
  )
  let state
  const labels = { send: ['Envoyer'], stop: 'Arrêter' }
  const off = observeComposer(
    dom.window.document.querySelector('#seat'),
    (next) => (state = next),
    () => labels,
  )
  assert.equal(state.disabled, false)
  labels.send = ['Send message']
  labels.stop = 'Stop generating'
  dom.window.document
    .querySelector('button')
    .setAttribute('aria-label', 'Send message')
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(state.disabled, false)
  off()
  dom.window.close()
})

test('unknown or ambiguous controls fail closed and explicit markers take precedence', () => {
  for (const buttons of [
    '<button aria-label="Unknown"></button>',
    '<button aria-label="发送消息"></button><button aria-label="发送消息"></button>',
    '<button data-dsh-composer-primary="unknown" aria-label="发送消息"></button>',
  ]) {
    const dom = new JSDOM(
      `<div data-composer-card><div contenteditable="true"></div>${buttons}<div id="seat"></div></div>`,
    )
    let state
    const off = observeComposer(
      dom.window.document.querySelector('#seat'),
      (next) => (state = next),
      hostLabels,
    )
    assert.equal(state.disabled, true)
    assert.equal(
      dom.window.document.querySelector('[data-page-review-send]'),
      null,
    )
    off()
    dom.window.close()
  }
})

test('both locale catalogs have matching keys; active locale changes are read at call time', () => {
  assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort())
  let active = 'en',
    registered = false
  configureLocale({
    effect: (fn) => fn(),
    locale: {
      register: (namespace, dicts) => {
        assert.equal(namespace, NS)
        assert.ok(dicts.zh && dicts.en)
        registered = true
        return () => {}
      },
      bind: () => (key) => (active === 'en' ? en : zh)[key],
    },
  })
  assert.ok(registered)
  assert.equal(t('browser'), 'Browser')
  active = 'zh'
  assert.equal(t('browser'), '浏览器')
})

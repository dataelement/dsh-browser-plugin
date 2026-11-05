/**
 * Prefer the explicit composer marker when available. Released hosts also expose
 * accessible Send/Queue/Steer/Stop names from their public conversation locale.
 * Read those names from the host (never hard-code translations or CSS hashes).
 * Only the identified Send control is covered; Stop is always left available.
 */
export function observeComposer(seat, onChange, labels = () => ({})) {
  const card = seat?.closest('[data-composer-card]')
  if (!card) return () => {}
  let covered
  const cover = (button) => {
    if (covered === button) return
    covered?.removeAttribute('data-page-review-send')
    covered = button
    covered?.setAttribute('data-page-review-send', '')
  }
  const update = () => {
    let primary = card.querySelector('button[data-dsh-composer-primary]')
    let kind = primary?.getAttribute('data-dsh-composer-primary')
    if (!primary) {
      const { send = [], stop } = labels()
      const buttons = [...card.querySelectorAll('button[aria-label]')].filter(
        (button) => !seat.contains(button),
      )
      const sends = buttons.filter((button) =>
        send.includes(button.getAttribute('aria-label')),
      )
      const stops = buttons.filter(
        (button) => stop && button.getAttribute('aria-label') === stop,
      )
      // A running turn can expose both Send and a separate Stop control.
      if (sends.length === 1) {
        primary = sends[0]
        kind = 'send'
      } else if (sends.length === 0 && stops.length === 1) {
        primary = stops[0]
        kind = 'stop'
      }
    }
    const known = kind === 'send' || kind === 'stop'
    cover(known && kind === 'send' ? primary : undefined)
    const editor = card.querySelector('[contenteditable]')
    onChange({
      inline: kind === 'stop',
      disabled: !known || editor?.getAttribute('contenteditable') !== 'true',
    })
  }
  update()
  const observer = new seat.ownerDocument.defaultView.MutationObserver(update)
  observer.observe(card, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      'contenteditable',
      'data-dsh-composer-primary',
      'aria-label',
    ],
  })
  return () => {
    observer.disconnect()
    cover(undefined)
  }
}

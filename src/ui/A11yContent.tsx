import { BookText } from './BookText'

/**
 * Always in the DOM, never visible. Screen readers and search engines get the
 * whole portfolio as ordinary text with ordinary links — including when the
 * WebGL canvas refuses to start.
 */
export function A11yContent() {
  return (
    <>
      <a
        href="#book-text"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-black focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
      >
        Skip to the text version of this portfolio
      </a>
      <div id="book-text" className="sr-only">
        <h1>Shereya B — portfolio</h1>
        <p>
          An interactive 3D book. If you are using a screen reader, or have JavaScript or WebGL turned off, the
          complete text follows.
        </p>
        <BookText idPrefix="a11y" />
      </div>
    </>
  )
}

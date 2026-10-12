import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Fallback } from './Fallback'

/**
 * If the 3D layer dies — a driver fault, a lost context, an out-of-memory
 * frame — the reader still gets the whole portfolio. A throwing render inside
 * React otherwise unmounts the entire tree and leaves a blank page, which is
 * the one failure mode a portfolio can never afford.
 */
export class BookErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('The 3D book could not start; showing the static edition.', error, info.componentStack)
  }

  render() {
    if (this.state.failed) return <Fallback />
    return this.props.children
  }
}

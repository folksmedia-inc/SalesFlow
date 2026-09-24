import type { ReactNode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from './store'
import { ThemeProvider } from './ThemeProvider'

/** Composes every app-wide provider in one place. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </ReduxProvider>
  )
}

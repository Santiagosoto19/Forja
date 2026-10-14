import { useContext } from 'react'
import { AppStateContext } from './AppState.jsx'

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState debe usarse dentro de AppStateProvider')
  return ctx
}

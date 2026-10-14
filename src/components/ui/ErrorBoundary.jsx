import { Component } from 'react'
import Button from './Button.jsx'
import Card from './Card.jsx'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    const message = error?.message || String(error)

    return (
      <div className="app-shell flex min-h-dvh items-center justify-center px-4 py-8">
        <Card className="w-full max-w-lg p-6">
          <p className="text-sm font-semibold text-danger">Error</p>
          <h1 className="mt-1 text-2xl font-bold text-title">Algo salió mal</h1>
          <p className="mt-3 text-sm text-secondary">{message}</p>
          <Button
            className="mt-6"
            onClick={() => {
              this.setState({ error: null })
              window.location.assign('/')
            }}
          >
            Recargar
          </Button>
        </Card>
      </div>
    )
  }
}

import Button from './Button.jsx'
import Card from './Card.jsx'

export default function SetupNeon({ error, onRetry }) {
  return (
    <div className="app-shell flex min-h-dvh items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl p-6">
        <p className="text-sm font-semibold text-primary">Forja</p>
        <h1 className="mt-1 text-2xl font-bold text-title">Falta conectar Neon</h1>
        <p className="mt-3 text-sm text-secondary">
          La app guarda rutinas, sesiones y el perfil en PostgreSQL. Sin{' '}
          <code className="rounded bg-canvas px-1 py-0.5 text-title">DATABASE_URL</code> no
          podemos arrancar los datos.
        </p>
        {error ? (
          <p className="mt-3 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-secondary">
          <li>
            Crea un proyecto gratis en{' '}
            <a
              className="font-semibold text-primary underline"
              href="https://neon.tech"
              target="_blank"
              rel="noreferrer"
            >
              neon.tech
            </a>
            .
          </li>
          <li>
            Copia la connection string (URI) y pégala en <code className="text-title">.env</code> en
            la raíz del repo:
          </li>
        </ol>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-canvas p-3 text-xs text-title">
{`DATABASE_URL=postgresql://USER:PASSWORD@HOST/dbname?sslmode=require
PORT=3001`}
        </pre>
        <p className="mt-4 text-sm text-secondary">
          Reinicia <code className="text-title">npm run dev</code> y abre{' '}
          <code className="text-title">http://localhost:5173</code> o{' '}
          <code className="text-title">http://127.0.0.1:5173</code>.
        </p>
        {onRetry ? (
          <Button className="mt-6" onClick={onRetry}>
            Reintentar conexión
          </Button>
        ) : null}
      </Card>
    </div>
  )
}

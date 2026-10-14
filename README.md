# Forja

## Qué es

Forja es una app de entrenamiento: perfil, rutina, sesiones y peso. Es una SPA con API local.

No hay membresías, socios ni pagos. `schemaVersion` es 1. La racha y la asistencia salen de sesiones completadas; los PRs salen de las series.

## Stack

React 19, Vite 8, Tailwind 4, Express 5 y Vitest 5. SQLite con el módulo nativo `node:sqlite`. Neon (PostgreSQL) es opcional.

## Requisitos

Node.js que incluya `node:sqlite`.

## Arranque

```bash
npm install
cp .env.example .env
npm run dev
```

Sin `DATABASE_URL` usa SQLite. La app queda en http://127.0.0.1:5173 y la API en http://127.0.0.1:3001 (también escucha en `::1`). Vite hace proxy de `/api` hacia el puerto 3001.

Solo la API: `npm run server`.

## Variables de entorno

Las de `.env.example`:

- `DATABASE_URL` vacía: SQLite. Con valor: Neon.
- `PORT=3001`
- `SQLITE_PATH` vacío: `data/rutina.db`
- `EXERCISES_JSON_PATH` vacío: el import descarga el JSON.
- `EXERCISES_JSON_URL`: si se omite, el script usa `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json`

## Scripts

- `npm run dev` — API + Vite
- `npm run server` — solo la API
- `npm run build` — `vite build`
- `npm run preview` — `vite preview`
- `npm test` — `vitest run`
- `npm run import:exercises` — descarga `data/exercises.json` (gitignored) y hace upsert en la base

## Datos

Por defecto SQLite en `data/rutina.db`. `/data/` no se versiona. Con `DATABASE_URL`, el mismo import usa PostgreSQL.

El seed Push/Pull/Legs entra en `GET /api/state`. El dataset externo no entra en ese state: va a la tabla `exercises` con `source=dataset` e ids `ext_<id>`, consultable en `GET /api/exercises?q=&muscle=&limit=` (también acepta `offset`; el límite por defecto del adapter es 40).

No clones vídeos ni imágenes; las URLs apuntan a GitHub raw. El import no borra ejercicios seed ni custom.

El JSON del dataset [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) es MIT; miniaturas y GIFs son © [Gym visual](https://gymvisual.com/) y no se redistribuyen en este repo.

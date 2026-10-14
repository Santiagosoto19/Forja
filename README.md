# GymTech · Rutina Gym

App de entrenamiento estilo fitness dark/cyberpunk. SPA + API local. Stack: React 19, Vite, Tailwind, Express, Vitest. El estado (perfil, ejercicios de rutina, sesiones y logs de peso) vive en SQLite (`data/rutina.db`) por defecto, o en Neon si defines `DATABASE_URL`. `schemaVersion` de la app es `1`.

No es un CRM: **no hay membresías, socios ni pagos**. La racha y la asistencia son sesiones completadas. Los PRs se derivan de las series.

## Arranque

```bash
npm install
cp .env.example .env
npm run dev
```

Sin `DATABASE_URL` la API usa SQLite. La API queda en [http://127.0.0.1:3001](http://127.0.0.1:3001) y la app en [http://127.0.0.1:5173](http://127.0.0.1:5173). Vite hace proxy de `/api`.

Abre **http://127.0.0.1:5173** (preferible en LibreWolf). El HMR apunta a `127.0.0.1`.

Solo la API: `npm run server`.

## PWA

Tema oscuro (`theme_color` `#0A0A0A`). Manifest en `public/manifest.webmanifest` (nombre GymTech / Rutina Gym, `display: standalone`). Tras `npm run build` + `npm run preview` puedes instalarla en el móvil. El service worker solo se registra en producción y falla en silencio si el navegador lo bloquea (LibreWolf).

## Catálogo externo de ejercicios

El seed PPL local se queda en `GET /api/state`. El dataset de [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) **no** se mete en el state (son ~1324 filas). Vive en la tabla `exercises` con `source=dataset` e ids `ext_<id>` y se consulta con `GET /api/exercises?q=&muscle=&limit=`.

No clones videos ni imágenes al repo. Las URLs apuntan a GitHub raw.

```bash
npm run import:exercises
```

Eso descarga `data/exercises.json` (ignorado por git) y hace upsert en SQLite `data/rutina.db` **sin borrar** seed ni ejercicios custom.

Con Neon, define `DATABASE_URL` y corre el mismo comando: el script usa PostgreSQL en lugar de SQLite.

### Clonar el dataset a mano (opcional)

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/hasaneyldrm/exercises-dataset.git /tmp/exercises-dataset
cd /tmp/exercises-dataset
git sparse-checkout set data/exercises.json
```

Luego puedes importar con:

```bash
EXERCISES_JSON_PATH=/tmp/exercises-dataset/data/exercises.json npm run import:exercises
```

El JSON del dataset es MIT; las miniaturas y GIFs son © [Gym visual](https://gymvisual.com/). No redistribuimos esos medios en este repo.

## Neon (opcional)

Crea un proyecto en [neon.tech](https://neon.tech), pega la connection string en `.env` y reinicia:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST/dbname?sslmode=require
PORT=3001
```

Después importa el catálogo: `DATABASE_URL=... npm run import:exercises`.

Sin `DATABASE_URL` no hace falta cuenta cloud.

## Tests y build

```bash
npm test
npm run build
```

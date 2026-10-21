# Huellitas en casa · Next.js fullstack

Aplicación de adopción en Next.js App Router. Conserva el diseño original, sus colores, imágenes editoriales, navegación flotante y catálogo de mascotas.

## Desarrollo local

- Node.js 20.9 o posterior.
- `npm install`
- `npm run dev` y abrir <http://localhost:3000>.
- `npm run lint` y `npm run build` para revisar el proyecto.

## Funcionalidad

- Inicio y catálogo en `/` y `/huellitas`.
- Las fichas públicas muestran nombre, especie, raza, edad, género, tamaño, salud, descripción e imagen.
- En `/huellitas`, las opciones de especie llegan desde `GET /api/pets`; la búsqueda por nombre o raza también se ejecuta en el servidor.
- El formulario público envía solicitudes de adopción a `POST /api/adoptions`.
- El dashboard privado en `/admin` permite crear, editar, pausar y reactivar mascotas, además de aprobar o rechazar solicitudes.
- Los campos de cada mascota se validan en el servidor. La imagen se registra como una URL pública en `pets.image_url`; no se sube el archivo a Supabase Storage.
- Los endpoints de escritura y los datos de mascotas pausadas requieren una sesión de administrador.

## Supabase

1. En el SQL Editor del proyecto ejecutá `supabase/schema.sql`. Crea las tablas, índices y reglas RLS; también añade `image_url` y vuelve opcional el antiguo `image_path` si habías ejecutado el esquema anterior.
2. En el `.env.local` existente configurá `SUPABASE_URL` y `SUPABASE_SECRET_KEY` junto con `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_SECRET`. No reemplaces el archivo completo si ya tiene tus credenciales de administrador.
3. Reiniciá Next.js. Entrá a `/admin`, cargá cada mascota y pegá una URL HTTPS pública directa a su imagen. El catálogo y los filtros consultan la API, que lee y filtra en Supabase.

La app usa la clave `secret` solamente desde las rutas de Next.js en el servidor. La clave `publishable` no hace falta porque el navegador no conecta directamente con Supabase. No prefijes `SUPABASE_SECRET_KEY` con `NEXT_PUBLIC_` ni la publiques en Git.

Si migrás desde la configuración anterior de Storage, las fichas antiguas todavía pueden resolver su `image_path` mientras la imagen siga en el bucket `pet-images`. Las nuevas fichas guardan `image_url`; podés editar las antiguas desde el admin para pasarles una URL pública y dejar de depender del bucket.

## Despliegue

El proyecto está preparado para desplegarse en Vercel o en otro proveedor compatible con Next.js. Al conectar el repositorio, cargá en la configuración de entorno de producción las variables `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_SECRET`, aplicá `supabase/schema.sql` en Supabase y desplegá la rama `main`. Las credenciales de administrador son independientes de la cuenta de Supabase y se usan para iniciar sesión en `/admin`.

Para generar un `ADMIN_SECRET` fuerte localmente en Node.js podés usar `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. No uses la contraseña de base de datos de Supabase como contraseña de administrador.

## Origen

El repositorio original contiene el frontend en `frontend-app` (React 18, Vite, React Router y Tailwind). Las carpetas `frontend` y `backend` solo incluyen archivos de texto; no hay implementación Java del backend. Esta versión migra la experiencia visual a Next.js y expone los flujos de catálogo, solicitudes y administración como rutas API propias.

# Huellitas en casa · Next.js fullstack

Versión independiente del frontend original de adopción, migrada a Next.js App Router. Mantiene la composición que tenía el diseño: portada fotográfica con navegación naranja, bloque azul de presentación con fotos superpuestas, mascotas en filas alternadas, huellas decorativas y cierre ilustrado. Conserva la paleta `#1F485C` y `#F39C12`, el logo y las fotografías originales. Los ajustes se enfocan en legibilidad, espaciado, navegación móvil, accesibilidad y consistencia entre tamaños de pantalla.

## Requisitos y desarrollo

- Node.js 20.9 o posterior.
- `npm install`
- `npm run dev` y abrir <http://localhost:3000>.
- `npm run build` para compilar; `npm start` ejecuta la versión compilada.

## Funcionalidad

- Inicio con mascotas destacadas y catálogo en `/huellitas`, con búsqueda y filtros por especie.
- Fichas con información de mascota y formulario para enviar interés de adopción.
- Publicación de mascotas desde la navegación.
- Panel privado de administración en `/admin`, con aprobación o rechazo de solicitudes.
- API de Next.js: `GET/POST /api/pets` y `GET/POST /api/adoptions`.
- Datos semilla en `data/pets.json`; las solicitudes se guardan en `data/adoptions.json`.
- Imágenes originales reutilizadas desde `public/images`.

## Supabase

El proyecto ya tiene un adaptador opcional para que las rutas `/api/pets` y `/api/adoptions` lean y escriban en Supabase cuando estén configuradas; sin credenciales, siguen usando JSON local para desarrollo. El catálogo envía especie y búsqueda a la API, que aplica esos filtros en el servidor.

1. Ejecutá `supabase/schema.sql` en el SQL Editor del proyecto. Crea `pets`, `adoption_applications` y el bucket público `pet-images`.
2. Copiá `.env.example` a `.env.local` y completá `SUPABASE_URL` y `SUPABASE_SECRET_KEY`. La clave secreta solo se usa en las rutas del servidor; nunca la expongas como variable `NEXT_PUBLIC_*`.
3. Ejecutá `npm run seed:supabase` para subir las cuatro fotos iniciales al Storage y guardar sus registros en PostgreSQL.
4. Reiniciá Next.js. Desde entonces las mascotas, fotos y solicitudes usan Supabase.

El script de seed se detiene si `pets` ya contiene registros, para no duplicarlos. Las imágenes del catálogo se resuelven desde Storage; las imágenes de identidad y diseño siguen siendo assets del frontend.

La API usa archivos JSON solo como fallback de desarrollo cuando Supabase no está configurado. La clave secreta de Supabase omite RLS, así que mantenela únicamente en el servidor y no la agregues al cliente; ver [seguridad de datos de Supabase](https://supabase.com/docs/guides/database/secure-data) y [políticas RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

Para ingresar a `/admin`, usá el correo y la contraseña definidos en `.env.local`. La copia local ya incluye credenciales de desarrollo generadas para este proyecto; el archivo está excluido de Git. Al desplegar, configurá `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_SECRET` como variables de entorno privadas.

## Análisis del repositorio de origen

El repositorio contiene el frontend en `frontend-app` (React 18, Vite, React Router y Tailwind). Las carpetas `frontend` y `backend` solo incluyen archivos de texto; no hay implementación Java del backend. El frontend original combinaba pantallas con datos de ejemplo y llamadas a un API desplegado aparte para autenticación, registro y adopciones. Esta migración conserva la experiencia visual y el flujo público de adopción con API local; no traslada los paneles autenticados que dependían de aquel servicio.

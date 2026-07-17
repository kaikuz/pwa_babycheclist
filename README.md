# 🏡 Camino a casa

PWA privada para dos personas para organizar la llegada del bebé: checklist
compartida en tiempo real, calendario de eventos (parto, citas, medicación,
trámites) y carpeta de documentos (plan de parto, informes…).

- **Frontend:** Vite + React + TypeScript + Tailwind CSS
- **Backend:** Supabase (Auth con email+contraseña, Postgres, Storage, Realtime)
- **Hosting:** Vercel

---

## Cómo ponerla en marcha (paso a paso, sin saber programar)

### 1. Crea el proyecto de Supabase

1. Entra en [supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Pulsa **New project**, ponle nombre (p. ej. `camino-a-casa`), elige una
   contraseña de base de datos (guárdala) y la región de Europa.
3. Cuando termine de crearse, ve a **Project Settings → API** y copia dos
   cosas que necesitarás luego:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon public key** (una clave larga)

### 2. Ejecuta las migraciones

1. En el menú lateral de Supabase, abre **SQL Editor**.
2. Abre cada archivo de `supabase/migrations/` **en orden numérico**
   (`001_init.sql`, `002_seed.sql`, `003_...sql`, y los que se vayan
   añadiendo), copia TODO su contenido, pégalo en el editor y pulsa **Run**.

Con esto ya tienes las tablas, la seguridad (RLS), el bucket de documentos y
la checklist precargada.

> **Si el proyecto ya está en uso** (segunda o siguiente vez que tocas
> Supabase): no hace falta repetir las migraciones anteriores. Basta con
> ejecutar **solo** la migración nueva que no hayas aplicado todavía (por
> ejemplo `004_calendar.sql`, que añade el calendario de eventos). Cada
> migración nueva está pensada para
> sumarse a los datos existentes sin borrar ni renombrar nada — vuestros
> ítems marcados (`item_checks`) y los ítems propios que hayáis añadido no
> se tocan. Si dudas de si ya la ejecutaste, no pasa nada: están escritas
> para poder correrse dos veces sin duplicar datos.

### 3. Añade vuestros dos emails

1. En el menú lateral, abre **Table Editor** → tabla `allowed_users`.
2. Pulsa **Insert → Insert row** y escribe tu email. Repite con el de tu pareja.

Solo esos dos emails podrán entrar. Cualquier otra persona verá
"Esta app es privada".

### 4. Configura el login (email + contraseña, sin correos)

1. Ve a **Authentication → Sign In / Providers** → **Email** y déjalo así:
   - **Enable Email provider**: activado.
   - **Confirm email**: DESACTIVADO. Esto es lo importante: así crear la
     contraseña es instantáneo y la app no envía ningún correo (ni hay
     límites de envío que esperar).
   - Desactiva cualquier otro proveedor.
2. Si ya habíais entrado antes con enlace mágico: ve a
   **Authentication → Users** y borra esos usuarios antiguos. Así cada uno
   puede volver a registrarse desde la app, esta vez eligiendo contraseña
   (botón "¿Primera vez? Crear mi contraseña" en la pantalla de entrada).

Aunque cualquiera podría crearse una cuenta, no le serviría de nada: si su
email no está en `allowed_users`, verá "Esta app es privada" y las reglas
de la base de datos le impiden leer o escribir cualquier dato.

### 5. Comprueba el bucket de documentos

La migración ya crea el bucket privado `docs` con sus políticas. Para
verificarlo: **Storage** → debería aparecer `docs` como *Private*.

Si por lo que sea no existe, créalo a mano (**New bucket**, nombre `docs`,
SIN marcar "Public") y pega estas políticas en el **SQL Editor**:

```sql
create policy "docs: allowlist select"
  on storage.objects for select to authenticated
  using (bucket_id = 'docs' and exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "docs: allowlist insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'docs' and exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "docs: allowlist delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'docs' and exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));
```

### 6. Despliega en Vercel

1. Sube este repositorio a tu cuenta de GitHub (si estás leyendo esto en
   GitHub, ya está hecho ✅).
2. Entra en [vercel.com](https://vercel.com), crea una cuenta con GitHub y
   pulsa **Add New → Project** → importa este repositorio.
3. Antes de darle a Deploy, abre **Environment Variables** y añade estas dos
   (con los valores que copiaste en el paso 1):
   - `VITE_SUPABASE_URL` → la Project URL
   - `VITE_SUPABASE_ANON_KEY` → la anon public key
4. Pulsa **Deploy**. Al terminar tendrás tu URL (p. ej.
   `https://camino-a-casa.vercel.app`).

### 7. Instálala en el iPhone

1. Abre la URL en **Safari**.
2. Toca el botón **Compartir** (el cuadrado con la flecha).
3. Toca **Añadir a pantalla de inicio**.

Ya tienes "Camino a casa" como una app más, a pantalla completa. La primera
vez, entra con tu email y crea tu contraseña con el botón "¿Primera vez?
Crear mi contraseña"; después la sesión queda guardada y no tendrás que
volver a escribirla casi nunca.

### 8. Sube el plan de parto

Entra en la pestaña **Documentos**, elige el PDF, ponle título "Plan de
parto", categoría **Parto**, y súbelo. Desde ese momento cualquiera de los
dos puede abrirlo desde el móvil en el paritorio. 🤱

---

## Desarrollo local

```bash
cp .env.example .env      # y rellena las dos variables
npm install
npm run dev               # http://localhost:5173
```

Otros comandos: `npm run build` (compila), `npm run icons` (regenera los
iconos de `/public`).

## Estructura

```
src/
  components/   UI: checklist, tab bar, formularios, skeletons…
  context/      Auth (sesión + allowlist) y toasts
  hooks/        useChecklist (datos + realtime + optimistic), useDocuments
  lib/          cliente supabase, tipos, formateo
  pages/        Login, Privada, Lista, Documentos
supabase/migrations/
  001_init.sql  esquema + RLS + storage + realtime
  002_seed.sql  secciones e ítems de serie
```

## Cómo funciona la privacidad

- Login con email y contraseña de Supabase Auth (sin correos de
  verificación; la sesión persiste en el dispositivo).
- La tabla `allowed_users` contiene los dos emails permitidos.
- **Row Level Security**: todas las políticas de lectura/escritura (tablas y
  Storage) exigen que el email del token JWT esté en `allowed_users`. Aunque
  alguien consiga la anon key o inicie sesión con otro email, no puede leer
  ni escribir nada.
- Los documentos viven en un bucket privado y se abren con URLs firmadas que
  caducan a los 60 minutos.

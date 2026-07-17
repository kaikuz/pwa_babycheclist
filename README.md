# 🍼 Canastilla

PWA privada para dos personas para organizar la llegada del bebé: checklist
compartida en tiempo real y carpeta de documentos (plan de parto, informes…).

- **Frontend:** Vite + React + TypeScript + Tailwind CSS
- **Backend:** Supabase (Auth con magic link, Postgres, Storage, Realtime)
- **Hosting:** Vercel

---

## Cómo ponerla en marcha (paso a paso, sin saber programar)

### 1. Crea el proyecto de Supabase

1. Entra en [supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Pulsa **New project**, ponle nombre (p. ej. `canastilla`), elige una
   contraseña de base de datos (guárdala) y la región de Europa.
3. Cuando termine de crearse, ve a **Project Settings → API** y copia dos
   cosas que necesitarás luego:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon public key** (una clave larga)

### 2. Ejecuta las dos migraciones

1. En el menú lateral de Supabase, abre **SQL Editor**.
2. Abre el archivo `supabase/migrations/001_init.sql` de este repositorio,
   copia TODO su contenido, pégalo en el editor y pulsa **Run**.
3. Repite lo mismo con `supabase/migrations/002_seed.sql`.

Con esto ya tienes las tablas, la seguridad (RLS), el bucket de documentos y
la lista de la canastilla precargada.

### 3. Añade vuestros dos emails

1. En el menú lateral, abre **Table Editor** → tabla `allowed_users`.
2. Pulsa **Insert → Insert row** y escribe tu email. Repite con el de tu pareja.

Solo esos dos emails podrán entrar. Cualquier otra persona verá
"Esta app es privada".

### 4. Configura el login por enlace mágico

1. Ve a **Authentication → Sign In / Providers** y comprueba que **Email**
   está activado (viene activado de serie). Desactiva cualquier otro proveedor.
2. Ve a **Authentication → URL Configuration**:
   - En **Site URL** pon la URL que te dará Vercel en el paso 6
     (p. ej. `https://canastilla.vercel.app`).
   - En **Redirect URLs** añade esa misma URL.
   - Si quieres probar en tu ordenador antes, añade también
     `http://localhost:5173`.

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
   `https://canastilla.vercel.app`). Vuelve al paso 4 y ponla en Supabase si
   no lo hiciste ya.

### 7. Instálala en el iPhone

1. Abre la URL en **Safari**.
2. Toca el botón **Compartir** (el cuadrado con la flecha).
3. Toca **Añadir a pantalla de inicio**.

Ya tienes "Canastilla" como una app más, a pantalla completa. Para entrar,
escribe tu email y toca el enlace que te llega al correo.

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

- Login sin contraseñas: Supabase envía un enlace mágico al email.
- La tabla `allowed_users` contiene los dos emails permitidos.
- **Row Level Security**: todas las políticas de lectura/escritura (tablas y
  Storage) exigen que el email del token JWT esté en `allowed_users`. Aunque
  alguien consiga la anon key o inicie sesión con otro email, no puede leer
  ni escribir nada.
- Los documentos viven en un bucket privado y se abren con URLs firmadas que
  caducan a los 60 minutos.

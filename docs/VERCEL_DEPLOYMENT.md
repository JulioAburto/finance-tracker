# Desplegar en Vercel y crear credenciales

> Guía operativa para publicar Finance Tracker desde GitHub y provisionar su
> única cuenta de acceso.

Última revisión: 2026-07-31.

## Resultado esperado

Al terminar tendrás:

- El repositorio conectado a un proyecto de Vercel.
- La aplicación conectada a Supabase Postgres mediante variables privadas.
- Las migraciones aplicadas a la base usada en producción.
- Una única cuenta de acceso, sin registro público.
- Login obligatorio antes de consultar o modificar información financiera.

La URL de Vercel no es privada solo porque no la compartas. El login de la
aplicación es la protección principal del entorno de producción.

## Antes de comenzar

Necesitas:

- Una cuenta de GitHub conectada con Vercel.
- El repositorio de Finance Tracker en GitHub.
- Un proyecto de Supabase accesible.
- Node.js y pnpm instalados localmente.
- PowerShell para ejecutar los ejemplos de esta guía.

No publiques ni confirmes en Git:

```txt
.env.local
DATABASE_URL
AUTH_SECRET
Contraseña de acceso
Credenciales o tokens de Supabase, GitHub o Vercel
```

## Paso 1: comprobar el proyecto local

Instala las dependencias y ejecuta las validaciones:

```powershell
pnpm install
pnpm format:check
pnpm test -- --runInBand
pnpm lint
pnpm build
```

Si un comando falla, corrige el problema antes de desplegar. Revisa también el
estado de Git:

```powershell
git status --short
git diff --check
```

Confirma que `.env.local` no aparezca entre los archivos que se subirán.

## Paso 2: obtener la conexión de Supabase

En el dashboard de Supabase:

1. Abre el proyecto que utilizará la aplicación.
2. Selecciona **Connect**.
3. Busca la cadena del **Transaction pooler**.
4. Comprueba que use el puerto `6543` y termine en `/postgres`.
5. Sustituye el marcador de contraseña con la contraseña real de la base.

La forma esperada es:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST]:6543/postgres"
```

El transaction pooler es apropiado para tráfico serverless y no admite
prepared statements. El cliente del proyecto ya usa `prepare: false` y exige
TLS.

Si la contraseña contiene caracteres reservados como `@`, `:`, `/`, `?` o `#`,
debes codificarla para una URL antes de insertarla en la cadena.

## Paso 3: crear las variables locales

Si todavía no existe, crea `.env.local` desde el ejemplo:

```powershell
Copy-Item .env.example .env.local
```

Agrega la `DATABASE_URL` obtenida en el paso anterior.

### Generar `AUTH_SECRET`

`AUTH_SECRET` protege la sesión de Auth.js. No es la contraseña con la que
iniciarás sesión.

Genera un valor criptográficamente aleatorio:

```powershell
[Convert]::ToBase64String(
  [Security.Cryptography.RandomNumberGenerator]::GetBytes(48)
)
```

Copia el resultado en `.env.local`:

```env
AUTH_SECRET="[VALOR_GENERADO]"
```

Conserva el valor en un gestor de contraseñas. No uses `NEXT_PUBLIC_`, no lo
reutilices en otros proyectos y no lo pegues en conversaciones o capturas.

El archivo local debe contener estas dos claves, con valores reales:

```env
DATABASE_URL="[CONEXION_DE_SUPABASE]"
AUTH_SECRET="[SECRETO_ALEATORIO]"
```

## Paso 4: preparar la base de producción

Los comandos de Drizzle leen `DATABASE_URL` desde `.env.local`. Antes de
continuar, verifica que esa URL corresponda al proyecto de Supabase que usará
Vercel.

Aplica las migraciones:

```powershell
pnpm db:migrate
```

No uses `pnpm db:push` como sustituto en una base con datos importantes.

### Seed opcional

No ejecutes el seed si la base ya contiene tus datos o si no quieres
transacciones de demostración. En una base vacía, puedes cargar los catálogos y
datos iniciales documentados con:

```powershell
pnpm db:seed
```

El seed no crea credenciales de acceso.

## Paso 5: crear las credenciales de login

El correo y la contraseña los eliges tú. No existen credenciales
predeterminadas.

Ejecuta en PowerShell:

```powershell
$env:AUTH_USER_EMAIL = "tu-correo@example.com"
$env:AUTH_USER_NAME = "Tu nombre"
$env:AUTH_USER_PASSWORD = Read-Host "Contraseña nueva (12-128 caracteres)" -MaskInput

try {
  pnpm auth:create-user
} finally {
  Remove-Item Env:AUTH_USER_EMAIL
  Remove-Item Env:AUTH_USER_NAME
  Remove-Item Env:AUTH_USER_PASSWORD
}
```

Reemplaza los valores de ejemplo del correo y el nombre. En la tercera línea,
el texto entre comillas es solo la etiqueta del prompt: PowerShell esperará que
escribas la contraseña después y la ocultará. No escribas la contraseña dentro
del comando.

Requisitos y comportamiento:

- La contraseña debe tener entre 12 y 128 caracteres.
- El correo se normaliza a minúsculas.
- La contraseña se almacena como un hash `scrypt`, nunca como texto plano.
- El script rechaza una segunda cuenta con un correo diferente.
- Ejecutarlo de nuevo con el mismo correo cambia la contraseña e invalida las
  sesiones anteriores.
- Las variables `AUTH_USER_*` son temporales. No las agregues a `.env.local` ni
  a Vercel.

Guarda el correo y la contraseña elegidos en un gestor de contraseñas. Estas
son las credenciales que utilizarás en `/login`.

### Dónde se almacena la cuenta

El script escribe la cuenta en `app_users`, dentro de la base Supabase Postgres
indicada por `DATABASE_URL`. Guarda el correo, nombre, hash `scrypt` de la
contraseña, estado, intentos fallidos y versión de sesión; nunca guarda la
contraseña en texto plano.

La sesión se mantiene como un JWT en una cookie segura. La tabla conserva
`session_version` para invalidar sesiones cuando se reemplaza la contraseña. En
este MVP las tablas financieras no tienen `user_id`: la única cuenta activa
autoriza el acceso al dataset global.

## Paso 6: subir la versión revisada a GitHub

1. Revisa los cambios con `git status` y `git diff`.
2. Agrega únicamente los archivos revisados al área de preparación.
3. Comprueba el diff preparado con `git diff --cached`.
4. Crea el commit.
5. Sube el commit a la rama que usarás como producción, normalmente `main`.

Ejemplo para los últimos dos pasos:

```powershell
git commit -m "feat: prepare application for deployment"
git push origin main
```

No ejecutes esos comandos hasta revisar qué archivos están preparados. Vercel
solo puede desplegar código que ya existe en GitHub.

## Paso 7: importar el repositorio en Vercel

Como GitHub ya está conectado con Vercel:

1. Abre el dashboard de Vercel.
2. Selecciona **Add New > Project**.
3. Busca el repositorio de Finance Tracker y selecciona **Import**.
4. Conserva **Next.js** como Framework Preset.
5. Usa `.` como Root Directory si la aplicación está en la raíz del
   repositorio.
6. Mantén los comandos detectados por Vercel; el build del proyecto es
   `pnpm build`.
7. Antes de seleccionar **Deploy**, agrega las variables del siguiente paso.

La rama de producción normalmente será `main`. Los pushes posteriores a esa
rama crearán nuevos deployments de producción automáticamente.

## Paso 8: configurar variables en Vercel

Agrega estas variables al entorno **Production**:

| Nombre         | Valor                                          |
| -------------- | ---------------------------------------------- |
| `DATABASE_URL` | La conexión del transaction pooler de Supabase |
| `AUTH_SECRET`  | El mismo secreto configurado para este entorno |

Reglas importantes:

- No agregues `AUTH_USER_EMAIL`, `AUTH_USER_NAME` ni `AUTH_USER_PASSWORD`.
- No uses el prefijo `NEXT_PUBLIC_` para ninguna de estas variables.
- No necesitas exponer claves de Supabase al navegador; la aplicación consulta
  PostgreSQL desde el servidor.
- Un cambio de variables solo afecta deployments nuevos. Después de modificar
  una variable, crea un **Redeploy**.

Si utilizarás Preview Deployments, también necesitarán `DATABASE_URL` y
`AUTH_SECRET` en el entorno **Preview**. Reutilizar la base de producción en un
preview permite que ese preview lea y modifique datos reales; evita hacer
pruebas destructivas o utiliza una base separada.

## Paso 9: desplegar

1. Selecciona **Deploy**.
2. Espera que la instalación, compilación y publicación terminen sin errores.
3. Abre el deployment y revisa **Build Logs** si falla.
4. Si agregaste o corregiste variables después del primer intento, ejecuta
   **Redeploy** para que sean incluidas.

No configures `pnpm db:migrate` como parte automática del build. Las migraciones
deben revisarse y aplicarse deliberadamente antes del deployment que las
necesita.

## Paso 10: activar protección adicional

En el proyecto de Vercel:

1. Abre **Settings > Deployment Protection**.
2. Activa **Standard Protection** con Vercel Authentication para proteger
   previews y URLs de deployment cuando tu plan lo permita.
3. Si tu plan admite **All Deployments**, puedes proteger también todos los
   dominios como una segunda barrera.

En el plan Hobby, Standard Protection no protege el dominio de producción. Por
eso debes conservar siempre el login propio de la aplicación aunque no
compartas la URL.

## Paso 11: verificar el deployment

Haz estas comprobaciones en una ventana privada:

1. Abre la URL de producción.
2. Confirma que `/dashboard` redirija a `/login` sin una sesión.
3. Intenta una contraseña incorrecta y comprueba que no revele detalles.
4. Inicia sesión con el correo y la contraseña creados en el paso 5.
5. Comprueba dashboard, transacciones, categorías, reglas y configuración.
6. Cierra sesión y confirma que las páginas protegidas vuelvan a redirigir al
   login.
7. Abre `/api/health`: debe responder `401` sin sesión y `200` con una sesión y
   una conexión saludable a PostgreSQL.
8. Revisa los Runtime Logs de Vercel y confirma que no contengan credenciales,
   montos, notas ni la URL completa de la base.

## Actualizaciones posteriores

Para una actualización normal:

1. Trabaja y valida el cambio localmente.
2. Genera y revisa una migración si cambió el esquema.
3. Aplica la migración deliberadamente antes del código que la requiere.
4. Sube el commit a GitHub.
5. Vercel desplegará automáticamente la rama correspondiente.
6. Verifica el deployment y sus logs.

Revertir un deployment en Vercel no revierte migraciones de PostgreSQL.

## Recuperación y rotación

### Cambiar la contraseña

Vuelve a ejecutar `pnpm auth:create-user` con el mismo correo y una contraseña
nueva. Asegúrate de que `.env.local` apunte a la base correcta. Las sesiones
anteriores quedarán invalidadas.

### Rotar `AUTH_SECRET`

1. Genera un valor nuevo.
2. Actualízalo en Vercel.
3. Ejecuta un Redeploy.
4. Actualiza tu copia local segura si corresponde.

Rotar `AUTH_SECRET` cierra efectivamente las sesiones existentes porque sus
cookies dejan de ser válidas.

### Rotar la contraseña de Supabase

Actualiza `DATABASE_URL` en `.env.local` y Vercel, y luego ejecuta un Redeploy.
No muestres la URL anterior o nueva en logs.

## Problemas frecuentes

### `MissingSecret`

Falta `AUTH_SECRET` en el entorno del deployment o no se volvió a desplegar
después de agregarlo.

### `relation "app_users" does not exist`

La migración no fue aplicada a la misma base configurada en `DATABASE_URL`.

### `password authentication failed`

Revisa usuario, contraseña, host, puerto y codificación URL de caracteres
especiales en `DATABASE_URL`.

### El login rechaza credenciales correctas

- Confirma que usas el mismo correo con el que ejecutaste el script.
- Comprueba que el script apuntó a la base de producción.
- Después de cinco intentos fallidos, espera 15 minutos o vuelve a ejecutar el
  script con el mismo correo para establecer una contraseña nueva.

### Vercel sigue usando una variable anterior

Los cambios de variables no modifican deployments existentes. Ejecuta un
Redeploy y verifica que la variable esté asignada al entorno correcto.

## Checklist final

- [ ] Validaciones locales aprobadas.
- [ ] `.env.local` fuera de Git.
- [ ] Migraciones aplicadas a la base correcta.
- [ ] Cuenta creada y contraseña guardada de forma segura.
- [ ] Código revisado y subido a GitHub.
- [ ] Repositorio importado en Vercel.
- [ ] `DATABASE_URL` y `AUTH_SECRET` configurados en Production.
- [ ] Deployment exitoso.
- [ ] Rutas protegidas verificadas en ventana privada.
- [ ] Login y logout verificados.
- [ ] Runtime Logs revisados sin secretos ni datos financieros.
- [ ] Deployment Protection configurado según el plan.

## Referencias oficiales

- [Desplegar repositorios Git con Vercel](https://vercel.com/docs/git)
- [Variables de entorno de Vercel](https://vercel.com/docs/environment-variables)
- [Deployment Protection de Vercel](https://vercel.com/docs/deployment-protection)
- [Conectar una aplicación a Supabase Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Auth.js](https://authjs.dev/)

Para configuración y troubleshooting local, consulta
[`SETUP_NOTES.md`](./SETUP_NOTES.md).

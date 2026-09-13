# Publicación de eStok

El frontend se publica en https://estokrd.web.app. La API indicada es
http://38.247.133.70:8096 y sus rutas empiezan por `/api`. El frontend de
producción ahora utiliza `https://38.247.133.70/api` mediante el proxy descrito
en [deployment/README.md](deployment/README.md). Debe instalarse y habilitarse
ese proxy con un certificado válido antes de publicar el frontend actualizado.

## Requisito pendiente: HTTPS de la API

El navegador bloquea peticiones desde Firebase HTTPS hacia una API HTTP.
CORS no elimina este bloqueo. Antes de utilizar login/registro en producción:

1. Publicar la API con un certificado HTTPS válido, directamente o mediante un
   proxy inverso que reenvíe al puerto 8096. Hace falta configurar el servidor y
   el certificado correspondiente a su dirección pública.
2. Cambiar `apiBaseUrl` en `frontend/src/environments/environment.ts` por la URL
   HTTPS pública, terminada en `/api`, y volver a compilar/publicar.
3. Ejecutar el backend con `ASPNETCORE_ENVIRONMENT=Production` y comprobar que
   `AllowedOrigins` incluya exactamente `https://estokrd.web.app`.
   Si se configura mediante variables, usar `AllowedOrigins__0`.

La cookie de renovación usa HttpOnly, Secure y SameSite=None en producción
para permitir el acceso entre sitios. Algunos navegadores bloquean cookies de
terceros incluso con estos atributos; en ese caso se necesita servir la API
bajo el mismo sitio mediante un proxy o dominios propios compartidos.

## Frontend

Desde `frontend`, ejecutar `firebase deploy --only hosting` con la cuenta y
proyecto adecuados. El predeploy ejecuta `npm run build`; Firebase publica
`dist/estok-web/browser`. La carpeta `public` queda como entrada de recursos;
se excluyen los compilados JS/CSS y el index copiados previamente allí.
La reescritura a `/index.html` permite abrir directamente `/login` y `/register`.

## Comprobaciones después de publicar

- `/` muestra el landing; sus botones abren `/login` y `/register`.
- OPTIONS a `/api/auth/login` con Origin `https://estokrd.web.app`, método POST
  y header content-type devuelve el origen exacto y permite credenciales.
- Un origen no autorizado no recibe permiso CORS.
- Registro/login, renovación y logout funcionan desde el navegador con HTTPS.

Los cambios locales no actualizan automáticamente la API ni Firebase.

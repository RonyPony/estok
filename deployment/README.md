# Entrada HTTPS para producción

Arquitectura: Firebase HTTPS → https://38.247.133.70 (443) → API local HTTP (8096).
El frontend de producción ya apunta a `https://38.247.133.70/api`.
El frontend de desarrollo conserva su configuración independiente.

## Preparar el servidor

1. Instalar Caddy en el mismo servidor que ejecuta el backend.
2. Obtener un certificado de una autoridad pública que incluya la dirección IP
   `38.247.133.70` en su SAN, y establecer las variables `ESTOK_TLS_CERT` y
   `ESTOK_TLS_KEY` con las rutas absolutas al certificado PEM (cadena completa)
   y su clave privada PEM. Restringir el acceso a la clave a la cuenta del servicio.
   Un certificado autofirmado no permite el acceso normal desde los navegadores.
3. Mantener el backend en `127.0.0.1:8096`, con entorno `Production`.
   En IIS, configurar el binding HTTP correspondiente; en Kestrel, usar
   `ASPNETCORE_URLS=http://127.0.0.1:8096`.
4. Abrir el puerto TCP 443 y reservarlo para Caddy. Si IIS u otro servidor ya
   ocupa 443, configurar allí el certificado y el proxy equivalente, o asignar
   un binding que no entre en conflicto antes de iniciar Caddy.
5. Ejecutar `caddy validate --config Caddyfile --adapter caddyfile` y luego
   `caddy run --config Caddyfile --adapter caddyfile` desde esta carpeta.
   Registrar Caddy como servicio según el sistema operativo y mantenerlo activo.
6. Automatizar la renovación del certificado con su proveedor. Este Caddyfile
   carga un certificado externo: no lo emite ni renueva. Tras reemplazar los
   archivos, recargar Caddy mediante `caddy reload --config Caddyfile --force`.

Alternativa con dominio propio: apuntar un registro A al servidor, reemplazar
la dirección del bloque por ese dominio y quitar la directiva `tls`. Caddy
puede obtener y renovar automáticamente el certificado del dominio si sus
validaciones públicas son accesibles (puertos 80/443). Cambiar también la URL
del frontend por ese dominio HTTPS antes de compilar.

## Comprobar y publicar

Abrir `https://38.247.133.70/api/health` y verificar que el certificado sea válido.
Comprobar CORS con Origin `https://estokrd.web.app` y las rutas de autenticación.
Publicar el backend actualizado y, desde `frontend`, ejecutar
`firebase deploy --only hosting` (incluye compilación previa).
Probar login, renovación y logout en el navegador.

La cookie de renovación usa Secure y SameSite=None en Production, incluso si
el salto interno desde Caddy es HTTP. No habilitar el entorno Development en
el servidor público. Los navegadores que bloquean cookies de terceros pueden
requerir servir frontend y API bajo un mismo sitio para renovar la sesión.

No se ha instalado Caddy ni un certificado en el servidor remoto desde este
proyecto. Cambiar el código no habilita por sí solo HTTPS en el servidor.

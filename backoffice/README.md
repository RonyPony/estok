# eStok Backoffice

Aplicación Angular 22 independiente de `frontend/`. Usa la misma API .NET y una autorización administrativa global. No comparte la sesión ni los roles de los negocios.

## Arranque

Desde la raíz del repositorio, aplica primero la migración `BackofficeAdministration` a la base de datos de destino:

```powershell
dotnet ef database update --project backend/src/eStok.Infrastructure --startup-project backend/src/eStok.Api
```

Después, configura los IDs de usuarios autorizados en el servidor. La cuenta debe estar activa, pero no necesita pertenecer a un negocio. Ningún propietario o administrador de negocio obtiene este acceso automáticamente.

Si necesitas una cuenta administrativa independiente, configura `BackofficeBootstrap__Email` y `BackofficeBootstrap__Password` en el entorno del proceso y ejecuta:

```powershell
dotnet run --project backend/src/eStok.Api -- --create-backoffice-admin
```

El comando crea una cuenta sin negocio y muestra su ID. No modifica cuentas existentes. Retira las variables de aprovisionamiento después de usarlo. La contraseña debe cumplir la política de Identity: al menos 10 caracteres, mayúsculas, minúsculas, números y un carácter especial. No guardes la contraseña en archivos versionados.

Configura mediante variables de entorno, user-secrets o la configuración del despliegue:

```text
Backoffice__Enabled=true
Backoffice__AdministratorUserIds__0=ID_DE_LA_CUENTA_ADMINISTRATIVA
Backoffice__AllowPermanentDeletion=true
Backoffice__AllowSessionCleanup=true
```

Los dos últimos ajustes son independientes y opcionales; sus valores predeterminados son `false`. Para varios administradores usa índices `__1`, `__2`, etc. Al retirar un ID de la configuración o desactivar la cuenta, las solicitudes administrativas posteriores se rechazan. La configuración se vuelve a comprobar por petición; los cambios en variables de entorno requieren reiniciar el proceso.

Arranca la API con su flujo habitual y, en otra terminal:

```powershell
cd backoffice
npm ci
npm start
```

Abre http://localhost:4300. El proxy de desarrollo reenvía `/api` a `http://localhost:5080`. Su destino se configura en `proxy.conf.json`. Para validar la compilación usa `npm run build`.

## Configuración en ejecución

`public/appsettings.json` se carga antes de iniciar Angular. En producción se sirve como `/appsettings.json`; puede cambiarse sin recompilar y se lee nuevamente al recargar la página.

| Variable           | Uso                                                    |
| ------------------ | ------------------------------------------------------ |
| `applicationName`  | Nombre de la aplicación y título de la página          |
| `apiBaseUrl`       | URL base administrativa, por defecto `/api/backoffice` |
| `pageSize`         | Registros por página: entre 1 y 100                    |
| `requestTimeoutMs` | Tiempo máximo de espera de las solicitudes             |
| `locale`           | Formato de presentación de fechas                      |
| `timeZone`         | Zona horaria de presentación de fechas                 |

Este archivo es público: nunca debe contener contraseñas, claves JWT o cadenas SQL. Si la API está en otro origen, agrega el origen exacto del backoffice a `AllowedOrigins` del backend y usa HTTPS en producción. El proxy de mismo origen evita esa configuración adicional.

En el backend, la sección `Backoffice` también controla `SessionMinutes` (5–60), `ActivityWindowMinutes` (1–1440) y `SessionRetentionDays` (30–3650).

## Módulos y operación

- **Resumen:** cuentas activas, actividad reciente, negocios activos, inactivos, membresías pendientes, papelera y total de acciones auditadas.
- **Cuentas:** búsqueda, activación y desactivación global, última actividad, detalles y enlaces a membresías y auditoría.
- **Negocios:** datos de revisión, estado global y enlace a sus membresías. Activar un negocio no activa automáticamente las cuentas ni las membresías.
- **Activaciones:** todas las entidades actuales con `IsActive`: usuarios, negocios, membresías, roles, clientes, productos, categorías, almacenes y métodos de pago.
- **Papelera:** todos los tipos actuales que heredan `SoftDeletableEntity`: clientes, productos y categorías. Muestra fecha y autor del borrado. Restaurar conserva el estado de activación anterior; los registros principales eliminados deben restaurarse primero.
- **Auditoría:** historial de los negocios y de la plataforma, filtrado por usuario, negocio, acción y fechas, con paginación en el servidor. Los cambios administrativos exigen motivo y confirmación del ID. Se conservan valores de estado anteriores y nuevos, sin copiar contraseñas ni tokens.
- **Base de datos:** conteos de todas las tablas mapeadas por EF, incluidos datos de Identity, conteos de borrado lógico, migraciones pendientes y limpieza por lotes de hasta 1.000 sesiones vencidas más allá de la retención. No expone una consola SQL. Backups, restauraciones completas, reconstrucción de índices y ejecución de migraciones continúan en el flujo de operación de SQL Server/despliegue.

Los borrados definitivos se bloquean si cualquier clave foránea referencia el registro, incluso si el dependiente está eliminado lógicamente. No hay cascadas ni eliminación de ventas, pagos, stock, movimientos o auditorías. Cada restauración, cambio de activación y purga se confirma en la misma transacción que su auditoría.

La última actividad comienza a recopilarse al desplegar esta versión. Un valor vacío significa que todavía no se ha observado actividad; no permite reconstruir el pasado. Cuenta peticiones autenticadas exitosas y limita las escrituras a aproximadamente una por minuto. «Actividad reciente» no significa que exista una conexión abierta.

La sesión administrativa se conserva únicamente en memoria y vence automáticamente. Recargar la página exige autenticarse otra vez. Cerrar sesión borra el token del navegador; un token previamente copiado mantiene su validez hasta el vencimiento, salvo revocación del permiso administrativo, desactivación, bloqueo o cambio del sello de seguridad de Identity.

## Docker

El servicio `estok-backoffice` forma parte de `docker-compose.yml`, en el puerto configurado por `BACKOFFICE_PORT` (4300). `.env.example` contiene las variables de activación administrativa. El archivo público de ajustes se monta como solo lectura y Nginx reenvía la API al servicio `estok-api`.

```powershell
docker compose up --build -d
```

Salida de compilación: `dist/estok-backoffice/browser`. Cualquier hosting alternativo debe servir `index.html` para las rutas de Angular y deshabilitar el caché de `appsettings.json`. El backoffice no se ha publicado en un hosting externo como parte de este cambio.

## Validaciones

Las pruebas nuevas del backend cubren autorización administrativa, separación de permisos de negocio, activación, actividad, papelera, auditoría y mantenimiento sobre SQLite relacional. La migración generada apunta a SQL Server. Ejecuta también las migraciones y las pruebas de operación en un entorno SQL Server de ensayo antes de desplegar sobre datos reales.

# eStok

Base de un SaaS multiempresa para pequeños negocios. Monolito modular con API .NET 10, EF Core y SQL Server; cliente Angular 22 standalone, Angular Material y Signals.

## Arquitectura

El backoffice administrativo independiente está en `backoffice/`. Consulta [su guía de arranque y configuración](backoffice/README.md) y [el análisis de backend y frontend](backoffice/ANALISIS.md). Incluye cuentas, negocios, activaciones, papelera, actividad, auditoría global y mantenimiento de sesiones con conteos de tablas.

```text
backend/
  eStok.sln
  src/
    eStok.Domain/          Entidades y reglas independientes del framework
    eStok.Application/     Casos de uso, DTOs, validadores y abstracciones
    eStok.Infrastructure/  EF Core, Identity, JWT, inicialización de empresas
    eStok.Api/             Controllers, autorización y middleware HTTP
  tests/
    eStok.UnitTests/
    eStok.IntegrationTests/
frontend/
  src/app/
    core/                 Sesión, guards, interceptors y configuración
    shared/               UI, selectores, directivas y formato
    layout/               Acceso y espacio de trabajo adaptable
    features/             Casos de uso organizados por funcionalidad
```

Las referencias siguen Onion: Application → Domain; Infrastructure → Application; Api → Application e Infrastructure para la composición. Domain no depende de EF, Identity ni HTTP. Application usa la abstracción de DbContext con LINQ/EF, sin repositorio genérico, MediatR, CQRS ni unidad de trabajo adicional.

## Aislamiento y seguridad

- `ApplicationUser` es global; `BusinessUser` relaciona usuarios y empresas. El JWT selecciona la empresa. Los DTOs CRUD no aceptan `BusinessId`.
- Filtros globales y condiciones explícitas restringen consultas. Las escrituras verifican el tenant original persistido. Claves foráneas compuestas impiden relaciones entre empresas.
- Los permisos se verifican contra la membresía y rol activos en cada petición. Angular solo controla la presentación.
- Identity administra contraseñas y bloqueo por intentos fallidos. JWT de 20 minutos. Refresh tokens aleatorios de 30 días, hash SHA-256 persistido, rotación y cookie HttpOnly SameSite Strict. Access token solo en memoria del navegador.
- Registro, ventas, cancelaciones, pagos, transferencias y conversiones usan transacciones serializables. Secuencias y stock tienen control de concurrencia. Un conflicto devuelve 409 y exige reintentar; no se repiten automáticamente escrituras financieras.
- Movimientos, pagos y auditoría son históricos inmutables. Clientes y productos usan borrado lógico. Auditoría registra entidad, acción, usuario y fecha; no captura secretos ni copias completas de datos personales.
- El registro crea roles, almacén principal, métodos de pago, configuración y secuencias. No se crean cuentas de demostración.

## Arranque con Docker

Requisitos: Docker Engine/Desktop con contenedores Linux y Compose; recursos suficientes para SQL Server.

1. Copia `.env.example` a `.env` y reemplaza contraseña SQL y clave JWT por valores locales seguros.
2. Ejecuta desde la raíz:

```sh
docker compose up --build -d
```

Compose espera SQL Server, ejecuta la migración en un proceso independiente y arranca API y frontend. Interfaz: http://localhost:4200. Salud API: http://localhost:5080/api/health.

Esta configuración es para desarrollo local. Para publicar, configura HTTPS, proxy confiable, cookie Secure, secretos externos, una cuenta SQL con privilegios mínimos, backups y orígenes específicos. No publiques la cuenta `sa` del ejemplo.

## Desarrollo local

### Windows con SQL Server LocalDB

La configuración `Development` usa `(localdb)\MSSQLLocalDB`, base `estok`,
con autenticación de Windows. No necesita la instancia remota configurada para
producción. Con .NET 10, SQL Server LocalDB y Node 24 instalados:

```powershell
SqlLocalDB start MSSQLLocalDB
cd backend
dotnet tool restore
dotnet restore
dotnet run --project src/eStok.Api -- --migrate
dotnet run --project src/eStok.Api
```

En otra terminal, desde `frontend`, ejecuta `npm ci` y `npm start`.
El frontend abre en http://localhost:4200 y usa `/api` mediante el proxy al
puerto 5080. El backoffice se instala por separado con `npm ci` desde
`backoffice` y se inicia con `npm start -- --port 4300`.
Si acabas de instalar Node, abre una terminal nueva para actualizar el PATH;
en PowerShell también puedes usar `npm.cmd`.

Las migraciones crean el esquema, no restauran datos ni crean cuentas de
demostración. Los registros nuevos siguen el flujo de activación del proyecto.

### Impuestos en ventas y presupuestos

Al crear cada documento, el usuario puede sumar el impuesto al precio o
asumirlo dentro del precio. La segunda opción calcula el impuesto por línea
como `(importe - descuento) * tasa / (100 + tasa)`, redondeado a dos decimales,
y no lo vuelve a sumar al total. Por ejemplo, 100 con 18% incluido se cobra
a 100 y desglosa 15,25 de impuesto. La ganancia excluye ese impuesto.

`PricesIncludeTax` se conserva en el documento y al convertir un presupuesto
en venta. El subtotal y el descuento conservan la base del precio introducido;
el resumen y el PDF identifican expresamente cuándo incluyen impuestos.
Los documentos existentes y las solicitudes sin esta opción mantienen el
impuesto adicional. Aplica `DocumentPricesIncludeTax` antes de arrancar la API.

### Opción con Docker para la base de datos

Requisitos: .NET SDK 10 y Node LTS 24 (compatible con Angular 22). Las versiones exactas de npm están en `package-lock.json`.

```sh
docker compose up -d estok-db
cd backend
dotnet tool restore
dotnet restore
dotnet user-secrets init --project src/eStok.Api
dotnet user-secrets set "Jwt:Key" "YOUR_RANDOM_KEY_AT_LEAST_32_BYTES" --project src/eStok.Api
dotnet user-secrets set "ConnectionStrings:Database" "Server=localhost,1433;Database=estok;User Id=sa;Password=YOUR_LOCAL_PASSWORD;Encrypt=True;TrustServerCertificate=True" --project src/eStok.Api
dotnet ef database update --project src/eStok.Infrastructure --startup-project src/eStok.Api
dotnet run --project src/eStok.Api
```

En otra terminal:

```sh
cd frontend
npm ci
npm start
```

API: puerto 5080. Angular: puerto 4200. `proxy.conf.json` reenvía `/api` a la API, conservando el mismo origen para la cookie. Swagger está disponible en `/swagger` solo en Development.

`src/environments/environment.ts` y su reemplazo de desarrollo centralizan `apiBaseUrl`. Branding en `core/config/branding.ts`. El tema y tokens están en `src/styles.scss`. Se reutilizan encabezados, tablas paginadas, formularios, tarjetas, importes, badges, diálogos y selectores con búsqueda diferida. Features se cargan de forma perezosa; no se almacenan JWT en localStorage.

## Migraciones

`InitialCreate` ya está incluida. Para reproducirla sobre una solución sin migraciones:

```sh
dotnet ef migrations add InitialCreate --project src/eStok.Infrastructure --startup-project src/eStok.Api --output-dir Persistence/Migrations
dotnet ef database update --project src/eStok.Infrastructure --startup-project src/eStok.Api
```

Para cambios posteriores usa otro nombre. También se puede ejecutar `dotnet run --project src/eStok.Api -- --migrate` o el servicio `estok-migrate`.

## Verificación

```sh
cd backend
dotnet restore
dotnet build
dotnet test
cd ../frontend
npm install
npm run build
```

Las pruebas de integración usan ASP.NET TestServer y SQLite relacional aislado: registro, autenticación, permisos, dos tenants, SKU, stock, cancelación idempotente, pagos y presupuestos. No sustituyen pruebas de carga/concurrencia y ejecución de migraciones en SQL Server. En el entorno de implementación no estaban instalados Docker ni SQL Server, por lo que no se afirma haber ejecutado los contenedores o la migración en SQL Server.

## Flujo inicial

Registra una empresa; crea cliente y producto; registra stock desde Inventario; crea una venta; registra pagos desde su detalle; revisa cuentas por cobrar. Los presupuestos conservan precios y se convierten una sola vez en venta. El propietario puede crear integrantes y asignar roles. La configuración controla moneda, zona horaria, prefijos y política de stock.

## Alcance y evolución

Incluye autenticación, empresas, roles predefinidos, permisos, clientes y direcciones, productos y categorías, almacenes, stock y movimientos, ventas, pagos, cuentas por cobrar, presupuestos, dashboard, equipo y configuración.

Gastos, proveedores y compras quedan para la siguiente fase, según el alcance permitido. También quedan pendientes el flujo de invitación para usuarios ya existentes, recuperación de contraseña por correo, selector entre múltiples empresas, notificaciones remotas y reembolsos. La cancelación de una venta con pagos se rechaza para evitar borrar ingresos; requiere el futuro flujo de reembolso. Los formularios actuales son una base funcional, no una implementación de todas las variantes de edición y reportes avanzados de la especificación.

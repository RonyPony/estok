# Análisis del proyecto y diseño del backoffice

## Arquitectura revisada

El backend es un monolito modular .NET 10 con capas Domain, Application, Infrastructure y Api. La persistencia es EF Core/SQL Server; Identity maneja usuarios globales. Los servicios de Application implementan clientes, productos, inventario, ventas, pagos, presupuestos, configuración y reportes. Los controladores verifican permisos por solicitud. Las pruebas existentes usan SQLite y TestServer.

El frontend existente es Angular 22 standalone, con Signals, Angular Material, rutas diferidas, guards e interceptores. Su sesión selecciona un negocio y sus pantallas operan dentro de él. Sus módulos son autenticación, clientes y direcciones, productos y categorías, inventario y almacenes, ventas, presupuestos, pagos, cuentas por cobrar, equipo, configuración y dashboard. No contenía una superficie de administración global.

El nuevo `backoffice/` es otra aplicación Angular con dependencias, configuración, compilación y contenedor independientes. Mantiene el frontend operativo sin mezclar sus archivos ni su sesión. Las rutas administrativas usan `/api/backoffice`; la interfaz consume respuestas paginadas y limitadas a campos de revisión.

## Hallazgos que determinan el diseño

1. El registro persiste `ApplicationUser.IsActive`, `Business.IsActive` y `BusinessUser.IsActive` como falsos. El acceso requiere los tres activos y un rol activo. Por eso hay enlaces entre la cuenta, el negocio, la membresía y el rol, y cada cambio se revisa individualmente.
2. Los roles Owner/Administrator son propios de cada negocio. Reutilizarlos para el backoffice rompería el aislamiento entre empresas. La administración global se concede exclusivamente mediante IDs configurados en el servidor y un token administrativo sin `business_id`.
3. Los filtros globales combinan negocio y borrado lógico. El backoffice necesita consultas explícitas sin esos filtros; las escrituras administrativas usan un método interno separado. Las escrituras ordinarias conservan las verificaciones de tenant original y tenant actual.
4. Las entidades con `IsDeleted`, `DeletedAt` y `DeletedBy` son Customer, Product y ProductCategory. No se encontraron otros flags equivalentes en las entidades persistidas. La lista administrativa se obtiene del modelo EF para cubrir automáticamente los tipos que hereden la misma base. Agregar otra convención de borrado requiere incorporarla explícitamente y probarla.
5. Los históricos InventoryMovement, Payment y AuditLog son inmutables. Las relaciones usan `DeleteBehavior.Restrict`. El borrado definitivo conserva esas restricciones y no borra dependientes en cascada. La restauración verifica que los padres con borrado lógico estén restaurados.
6. La auditoría original es por negocio y solo registra modificaciones de entidades tenant. Se agregó un historial global para cambios administrativos, aprovisionamiento, inicios de sesión y mantenimiento. Ambas fuentes se consultan juntas sin reescribir el histórico anterior. El borrado lógico nuevo se distingue como `SoftDeleted`; el antiguo puede aparecer como `Modified`.
7. No existía un dato de última actividad. Se agregó `ApplicationUser.LastActivityAt`, actualizado al iniciar sesión y tras solicitudes autenticadas exitosas, con actualización limitada a una por minuto. El dato previo al despliegue sigue siendo desconocido.
8. La base utiliza migraciones e inicializadores durante el arranque. La migración nueva agrega la columna de actividad, la tabla de auditoría global y sus índices, sin eliminar datos ni modificar las tablas comerciales.

## Seguridad y límites operativos

El acceso administrativo está deshabilitado inicialmente. La configuración contiene los IDs permitidos; el login comprueba la contraseña, bloqueo y estado de la cuenta. Cada solicitud verifica además el alcance administrativo, el ID configurado y el sello de seguridad de Identity. Un token normal del negocio no autoriza el backoffice; un token del backoffice no autoriza las operaciones de un negocio.

Los listados nunca serializan directamente ApplicationUser: omiten hashes de contraseña, sellos de seguridad y tokens. Tampoco se permite consultar arbitrariamente tablas mediante el endpoint de registros. Los conteos de mantenimiento abarcan las tablas mapeadas, pero no exponen sus contenidos.

El borrado definitivo y la limpieza tienen habilitadores independientes del servidor, motivo obligatorio y confirmación. Las acciones se ejecutan de forma serializable y su auditoría forma parte de la transacción. La limpieza retira solo sesiones cuyo vencimiento supera la retención; el lote máximo es 1.000.

El módulo de mantenimiento implementa observación del esquema, conteos y limpieza de sesiones. La operación avanzada de SQL Server —backups, restauración de bases, índices y migraciones— permanece fuera de la interfaz. Los conteos exactos recorren cada tabla: en bases grandes pueden necesitar una ventana de operación o una evolución hacia métricas aproximadas.

## Observaciones previas ajenas al cambio

- El `appsettings.json` existente contiene credenciales y una clave JWT en el repositorio. Deben trasladarse a secretos del entorno y rotarse mediante el procedimiento operativo correspondiente; este cambio no altera esos valores ni expone sus contenidos en la documentación.
- El README original describe funcionalidades que siguen pendientes, entre ellas recuperación de contraseña por correo, invitaciones a cuentas existentes y reembolsos. El backoffice no incorpora esos flujos.
- Los datos anteriores no permiten diferenciar con certeza una cuenta «pendiente de aprobación» de una cuenta desactivada: ambas usan `IsActive=false`. La interfaz las identifica como inactivas y evita inventar un estado de aprobación.
- Las acciones realizadas mediante SQL externo no pasan por la auditoría de la aplicación. Un historial forense de operaciones directas requiere auditoría de SQL Server y permisos de operación apropiados.

## Puesta en marcha

Consultar `README.md` de esta carpeta para aplicar la migración, aprovisionar la cuenta administrativa, configurar el acceso y arrancar la aplicación. La preparación de código y migración no implica haber aplicado cambios a una base de datos real ni haber publicado el backoffice.

# EstokWeb

## Registro pendiente de revisión

El registro público guarda el usuario, el negocio y la vinculación de su
propietario con `IsActive = false`. La API responde con
`{ status: "pending_review", message: "..." }`, sin tokens ni cookie de sesión.
El formulario muestra la confirmación de revisión y contacto por correo, sin
abrir el panel. No envía correos automáticamente.

Después de revisar los datos, el operador debe activar el usuario
(`AspNetUsers.IsActive`), el negocio (`Businesses.IsActive`) y la vinculación
del propietario (`BusinessUsers.IsActive`) mediante el procedimiento interno
de administración, y contactar al cliente. No hay un endpoint público para
activar cuentas. El login exige los tres estados activos; ante credenciales
correctas de una cuenta inactiva, devuelve `ACCOUNT_INACTIVE` y muestra el aviso.
La renovación de sesión y el acceso autenticado también verifican la activación.

Este flujo corresponde al alta pública de un cliente y su negocio. La gestión
de colaboradores desde un negocio ya activo conserva su flujo administrativo.
Los registros existentes no cambian de estado. Publica backend y frontend
juntos: el registro ya no devuelve una sesión.

## Dominio de destino del landing

Configura `siteBaseUrl` en `src/environments/environment.ts` (producción) y
`src/environments/environment.development.ts` (desarrollo). El valor inicial es
`https://38.247.133.70:8097`. Los botones de inicio de sesión y creación de cuenta
abren ese dominio, en la misma pestaña, conservando `/login` y `/register`.
El logo del encabezado conserva el enlace al inicio del landing.

Estas variables de Angular se incorporan al compilar: después de cambiar el
dominio de producción, ejecuta `npm run build` y publica la nueva compilación.
`apiBaseUrl` configura la API por separado.

El símbolo original de eStok está en `public/logo.svg`; `public/favicon.svg`
contiene su versión simplificada para tamaños pequeños. Ambos se publican en
la raíz y el logo se comparte con las demás pantallas mediante `branding`.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

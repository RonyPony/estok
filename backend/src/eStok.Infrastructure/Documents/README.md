# Documentos comerciales

Las ventas y los presupuestos generan su PDF en el backend y lo guardan en
`Documents`, dentro de la misma transacción de la operación. Las descargas
requieren el permiso de consulta correspondiente y se limitan a la empresa
autenticada. Los documentos antiguos se generan en su primera descarga.

Las facturas conservan el PDF emitido. Al editar las notas o la vigencia de un
presupuesto, se actualiza su PDF. Cambiar la identidad de la empresa no modifica
automáticamente las facturas anteriores.

La fuente Noto Sans se incluye como recurso del ensamblado, por lo que no se
necesitan fuentes instaladas en Windows o Linux. Se incrusta completa para evitar
la pérdida visual de acentos en el subconjunto generado por PDFsharp 6.2.

Fuente: https://github.com/notofonts/noto-fonts/blob/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf
Licencia: `Fonts/LICENSE` (SIL Open Font License).

Antes de publicar, aplicar la migración `CommerceDocumentsAndCashSales` con el
procedimiento habitual del proyecto. La sesión persistente requiere HTTPS con
certificado válido; consultar `deployment/README.md` en la raíz del repositorio.

Para generar muestras de verificación durante las pruebas, establecer
`ESTOK_PDF_TEST_OUTPUT` a un directorio local y ejecutar `dotnet test`.

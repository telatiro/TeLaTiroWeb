# Guía de Conexión: Formularios TeLaTiro -> Google Sheets y Gmail

Con esta configuración, cada vez que un cliente pulse **"Enviar Solicitud"** en la web:
1. Se guardará **automáticamente una nueva fila en tu Google Sheets** en tiempo real con todos los datos.
2. Te llegará un **correo electrónico inmediato a `telatiro.pruebas@gmail.com`** con la ficha del cliente.

---

## 🚀 Paso 1: Crear la Hoja de Google Sheets

1. Entra en tu cuenta de Google con `telatiro.pruebas@gmail.com` e ingresa a [sheets.google.com](https://sheets.google.com).
2. Crea una **Hoja de cálculo en blanco** y nómbrala arriba a la izquierda como: **`TeLaTiro - Solicitudes de Clientes`**.
3. (Opcional) Puedes poner estos nombres en la primera fila (Fila 1) para las columnas:
   - **A:** `Fecha y Hora`
   - **B:** `Nombre y Apellidos`
   - **C:** `Teléfono / WhatsApp`
   - **D:** `Email`
   - **E:** `Plan Contratado`
   - **F:** `Sector / CP`
   - **G:** `Dirección Completa`
   - **H:** `Franja Horaria`
   - **I:** `Días de Recogida`
   - **J:** `Forma de Pago`
   - **K:** `Recomendado por (Plan Amigo)`
   - **L:** `Fecha Estimada de Inicio`
   - **M:** `Observaciones`
   - **N:** `Estado` (ej. *Pendiente / Contactado / Activo*)

---

## ⚙️ Paso 2: Pegar el Script de Apps Script

1. En el menú superior de tu Google Sheet, haz clic en **Extensiones** $\rightarrow$ **Apps Script**.
2. Borra todo el código que aparezca en el editor y **pega exactamente este código**:

```javascript
/**
 * TeLaTiro - Webhook para Google Sheets y Alertas por Email (Doble Envío: Empresa + Cliente)
 * 1. Guarda la solicitud en Google Sheets
 * 2. Envía alerta a telatiro.pruebas@gmail.com
 * 3. Envía confirmación automática al email del CLIENTE
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // 1. Si la hoja está vacía, creamos los encabezados
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha y Hora",
        "Nombre y Apellidos",
        "Teléfono / WhatsApp",
        "Email",
        "Plan Contratado",
        "Sector / CP",
        "Dirección Completa",
        "Franja Horaria",
        "Días de Recogida",
        "Forma de Pago",
        "Recomendado por (Plan Amigo)",
        "Fecha Estimada de Inicio",
        "Observaciones",
        "Estado"
      ]);
      // Formato negrita y fondo verde para la fila de cabecera
      sheet.getRange("A1:N1").setFontWeight("bold").setBackground("#D1EBE0").setFontColor("#13402E");
    }

    var fechaActual = Utilities.formatDate(new Date(), "Europe/Madrid", "dd/MM/yyyy HH:mm:ss");
    
    // 2. Añadir la fila con los datos del cliente
    sheet.appendRow([
      fechaActual,
      data.name || "-",
      data.phone || "-",
      data.email || "-",
      data.planName || data.plan || "-",
      data.zip || "-",
      data.address || "-",
      data.timeSlot || "-",
      data.days || "-",
      data.paymentMethod || "-",
      data.referral || "No",
      data.startDate || "-",
      data.notes || "-",
      "Nuevo / Pendiente"
    ]);

    // 3. Enviar notificación interna a TeLaTiro
    var emailTeLaTiro = "telatiro.pruebas@gmail.com";
    var asuntoInterno = "🔔 ¡Nueva Solicitud de Recogida! - " + (data.name || "Cliente") + " (" + (data.planName || data.plan || "Plan") + ")";
    
    var htmlInterno = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; padding: 20px;">
        <div style="background-color: #25815F; padding: 15px; border-radius: 8px; color: white; text-align: center;">
          <h2 style="margin: 0;">TeLaTiro • Nueva Solicitud Recibida</h2>
        </div>
        
        <h3 style="color: #25815F; border-bottom: 2px solid #E8F5EF; padding-bottom: 5px; margin-top: 20px;">Datos del Cliente</h3>
        <p><strong>👤 Nombre:</strong> ${data.name || "-"}</p>
        <p><strong>📞 Teléfono:</strong> <a href="tel:${data.phone}">${data.phone || "-"}</a> | <a href="https://wa.me/34${data.phone}">Abrir WhatsApp</a></p>
        <p><strong>✉️ Email:</strong> ${data.email || "-"}</p>
        <p><strong>📍 Dirección:</strong> ${data.address || "-"}</p>
        <p><strong>📮 Zona / CP:</strong> ${data.zip || "-"}</p>
        
        <h3 style="color: #25815F; border-bottom: 2px solid #E8F5EF; padding-bottom: 5px; margin-top: 20px;">Servicio Seleccionado</h3>
        <p><strong>📦 Plan:</strong> <span style="background: #E8F5EF; color: #13402E; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${data.planName || data.plan || "-"}</span></p>
        <p><strong>⏰ Franja Horaria:</strong> ${data.timeSlot || "-"}</p>
        <p><strong>📅 Días de Recogida:</strong> ${data.days || "-"}</p>
        <p><strong>💳 Forma de Pago:</strong> ${data.paymentMethod || "-"}</p>
        <p><strong>🚀 Fecha Inicio:</strong> ${data.startDate || "-"}</p>
        <p><strong>🎁 Plan Amigo (Recomendado por):</strong> ${data.referral || "Ninguno"}</p>
        <p><strong>📝 Observaciones:</strong> ${data.notes || "Sin observaciones"}</p>

        <div style="margin-top: 25px; padding: 12px; background-color: #F8FAF9; border-radius: 6px; font-size: 12px; color: #666; text-align: center;">
          Esta solicitud ya se ha guardado automáticamente en tu hoja de Google Sheets.
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: emailTeLaTiro,
      subject: asuntoInterno,
      htmlBody: htmlInterno
    });

    // 4. Enviar confirmación automática al CLIENTE (si proporcionó su email)
    if (data.email && data.email.indexOf("@") !== -1) {
      var asuntoCliente = "✅ Hemos recibido tu solicitud en TeLaTiro - " + (data.planName || "Recogida de Basura");
      var htmlCliente = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; padding: 25px;">
          <div style="background-color: #25815F; padding: 18px; border-radius: 8px; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 22px;">¡Gracias por confiar en TeLaTiro!</h2>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #E8F5EF;">Servicio Premium de Recogida de Basura a Domicilio</p>
          </div>
          
          <p style="margin-top: 20px; font-size: 15px;">Hola <strong>${data.name || "vecino/a"}</strong>,</p>
          <p>Hemos recibido correctamente tu solicitud de alta. A continuación tienes el resumen de tu servicio:</p>
          
          <div style="background-color: #F8FAF9; border: 1px solid #E8F5EF; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 6px 0;"><strong>📦 Plan elegido:</strong> ${data.planName || data.plan || "-"}</p>
            <p style="margin: 6px 0;"><strong>📍 Dirección:</strong> ${data.address || "-"}</p>
            <p style="margin: 6px 0;"><strong>⏰ Turno asignado:</strong> ${data.timeSlot || "-"}</p>
            <p style="margin: 6px 0;"><strong>📅 Días de recogida:</strong> ${data.days || "-"}</p>
            <p style="margin: 6px 0;"><strong>💳 Forma de pago:</strong> ${data.paymentMethod || "-"}</p>
            <p style="margin: 6px 0;"><strong>🚀 Fecha estimada de inicio:</strong> <strong>${data.startDate || "-"}</strong></p>
            ${data.referral ? `<p style="margin: 6px 0; color: #25815F;"><strong>🎁 Plan Amigo:</strong> Descuento de 5 € en tu 2ª mensualidad por recomendación (${data.referral})</p>` : ''}
          </div>

          <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px; margin: 15px 0; font-size: 13px; color: #92400E;">
            ⏰ <strong>Recordatorio de puntualidad:</strong> Por favor, ten preparadas tus bolsas en tu felpudo, pomo o puerta <strong>a las 09:00 h (turno mañana) o a las 16:00 h (turno tarde)</strong> para que el recogedor no tenga esperas al iniciar la ruta.
          </div>
          
          <p style="font-size: 14px;">Nuestro equipo contactará contigo en breve por WhatsApp o teléfono para confirmar los detalles de acceso al portal y dar comienzo al servicio.</p>
          
          <div style="margin-top: 25px; border-top: 1px solid #eee; padding-top: 15px; text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 4px 0;"><strong>TeLaTiro Servicios Privados S.L.</strong></p>
            <p style="margin: 4px 0;">WhatsApp / Atención al cliente: <a href="https://wa.me/34600000000" style="color: #25815F; text-decoration: none;">+34 600 000 000</a></p>
          </div>
        </div>
      `;

      MailApp.sendEmail({
        to: data.email,
        subject: asuntoCliente,
        htmlBody: htmlCliente
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Haz clic en el icono de **Guardar** (el disquete 💾 o `Ctrl + S`).

---

## 🌐 Paso 3: Implementar y Obtener tu URL de Webhook

1. Arriba a la derecha, haz clic en el botón azul **Implementar** $\rightarrow$ **Nueva implementación**.
2. En el engranaje ⚙️ (Seleccionar tipo), elige **Aplicación web**.
3. Rellena lo siguiente:
   - **Descripción:** `TeLaTiro Webhook`
   - **Ejecutar como:** `Yo (telatiro.pruebas@gmail.com)`
   - **Quién tiene acceso:** **`Cualquier persona`** *(¡Muy importante para que la web pueda enviar los datos!)*
4. Pulsa en **Implementar**.
5. Google te pedirá **"Autorizar acceso"**:
   - Pulsa en **Autorizar acceso**.
   - Elige tu cuenta `telatiro.pruebas@gmail.com`.
   - Si sale una pantalla de aviso de Google, pulsa en **Configuración avanzada** (abajo a la izquierda) $\rightarrow$ **Ir a (no seguro)** $\rightarrow$ **Permitir**.
6. Copia la **URL de la aplicación web** que te genera (empieza por `https://script.google.com/macros/s/.../exec`).

---

## 🔗 Paso 4: Pegar la URL en la Web

Pégala en el archivo `js/app.js` en la variable `googleSheetWebhookUrl`, o facilítamela por aquí y te la dejo conectada al instante.

¡Y listo! A partir de ese momento, cada solicitud completada aparecerá en tu hoja de Google Sheets y en tu buzón de Gmail en menos de 2 segundos.

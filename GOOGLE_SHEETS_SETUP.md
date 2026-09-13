# 📋 Código Maestro Unificado para Google Apps Script (TeLaTiro)

Este archivo contiene el **código completo y definitivo** que une:
1. **Webhook `doPost`**: Recibe las solicitudes del formulario web, las guarda en Google Sheets, envía el correo al cliente y te envía la alerta interna a `info@telatiro.es`.
2. **Generador de Rutas `generarRutaDiaria`**: Filtra por día (5 días, 3 días L-X-V, 2 días M-J, y Puntuales), ordena las 7 columnas y genera el enlace directo a Google Maps en `F1`.

---

```/**
 * ============================================================================
 * 🚚 TeLaTiro - CÓDIGO MAESTRO COMPLETO Y DEFINITIVO (Webhook + Rutas + Mapeo)
 * ============================================================================
 */

// 1. MENÚ SUPERIOR EN GOOGLE SHEETS
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🚚 TeLaTiro Rutas')
    .addItem('🔄 Generar Ruta de Hoy (Todos)', 'generarRutaDiaCompleto')
    .addItem('🌅 Generar Ruta Mañana (09-13h)', 'generarRutaManana')
    .addItem('🌇 Generar Ruta Tarde (16-20h)', 'generarRutaTarde')
    .addSeparator()
    .addItem('🧪 Probar Envío de Email / Autorizar', 'testEnviarEmail')
    .addToUi();
}

function generarRutaManana() {
  generarRutaDiaria("Mañana");
}

function generarRutaTarde() {
  generarRutaDiaria("Tarde");
}

function generarRutaDiaCompleto() {
  generarRutaDiaria("Todos");
}

// 2. FUNCIÓN DE PRUEBA Y AUTORIZACIÓN DIRECTA DE PERMISOS DE GMAIL
function testEnviarEmail() {
  var destinatarios = ["telatiro.pruebas@gmail.com", "info@telatiro.es"];
  for (var i = 0; i < destinatarios.length; i++) {
    try {
      MailApp.sendEmail({
        to: destinatarios[i],
        subject: "🔔 PRUEBA DIRECTA DE EMAIL - TeLaTiro",
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #25815F; border-radius: 10px;">
            <h2 style="color: #25815F;">¡Permisos de Email Autorizados con Éxito!</h2>
            <p>Si estás leyendo este correo en <strong>${destinatarios[i]}</strong>, significa que Google Apps Script ya tiene todos los permisos activos para enviar correos automáticos cuando un usuario o candidato rellene el formulario web.</p>
          </div>
        `
      });
      Logger.log("✅ Email de prueba enviado a: " + destinatarios[i]);
    } catch (e) {
      Logger.log("❌ Error con " + destinatarios[i] + ": " + e);
    }
  }
}

// CONFIGURACIÓN OFICIAL DE CUPOS DIARIOS POR TURNO (20 Plazas Mañana / 20 Plazas Tarde)
var MAX_SLOTS_MORNING = 20;   // Cupo máximo Turno Mañana (09:00 - 13:00 h)
var MAX_SLOTS_AFTERNOON = 20; // Cupo máximo Turno Tarde (16:00 - 20:00 h)

// 3. CONSULTA DE DISPONIBILIDAD EN TIEMPO REAL Y HEALTH CHECK (doGet)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Solicitudes") || ss.getSheetByName("Clientes") || ss.getSheetByName("Hoja 1") || ss.getSheets()[0];
    
    var bookedMorning = 0;
    var bookedAfternoon = 0;
    
    if (sheet && sheet.getLastRow() > 1) {
      var data = sheet.getDataRange().getValues();
      var headers = data[0].map(function(h) { return (h + "").toLowerCase().trim(); });
      
      var colTurno = -1;
      var colEstado = -1;
      for (var c = 0; c < headers.length; c++) {
        if (headers[c].indexOf("turno") !== -1 || headers[c].indexOf("franja") !== -1 || headers[c].indexOf("horario") !== -1) {
          colTurno = c;
        }
        if (headers[c].indexOf("estado") !== -1 || headers[c].indexOf("situación") !== -1 || headers[c].indexOf("situacion") !== -1) {
          colEstado = c;
        }
      }
      
      if (colTurno === -1) colTurno = 9;
      if (colEstado === -1) colEstado = 14;
      
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var turno = (row[colTurno] || "").toString().toLowerCase();
        var estado = (colEstado < row.length && row[colEstado] ? row[colEstado] : "").toString().toLowerCase();
        
        // Ignorar registros dados de baja, cancelados o pruebas
        if (estado.indexOf("baja") !== -1 || estado.indexOf("cancel") !== -1 || estado.indexOf("pausad") !== -1 || estado.indexOf("inactiv") !== -1 || estado.indexOf("prueba") !== -1) {
          continue;
        }
        
        if (turno.indexOf("mañana") !== -1 || turno.indexOf("09") !== -1) {
          bookedMorning++;
        } else if (turno.indexOf("tarde") !== -1 || turno.indexOf("16") !== -1) {
          bookedAfternoon++;
        }
      }
    }
    
    var availMorning = Math.max(0, MAX_SLOTS_MORNING - bookedMorning);
    var availAfternoon = Math.max(0, MAX_SLOTS_AFTERNOON - bookedAfternoon);
    var isMorningFull = (availMorning <= 0);
    var isAfternoonFull = (availAfternoon <= 0);
    var totalFull = (isMorningFull && isAfternoonFull);
    
    var responseObj = {
      status: "success",
      service: "TeLaTiro Capacity & Webhook",
      morning: {
        max: MAX_SLOTS_MORNING,
        booked: bookedMorning,
        available: availMorning,
        isFull: isMorningFull
      },
      afternoon: {
        max: MAX_SLOTS_AFTERNOON,
        booked: bookedAfternoon,
        available: availAfternoon,
        isFull: isAfternoonFull
      },
      totalAvailable: availMorning + availAfternoon,
      totalFull: totalFull,
      time: Utilities.formatDate(new Date(), "Europe/Madrid", "dd/MM/yyyy HH:mm:ss")
    };
    
    return ContentService.createTextOutput(JSON.stringify(responseObj))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "online",
      error: err.toString(),
      morning: { max: 20, booked: 0, available: 20, isFull: false },
      afternoon: { max: 20, booked: 0, available: 20, isFull: false },
      totalAvailable: 40,
      totalFull: false
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 4. WEBHOOK: RECIBIR SOLICITUDES, LISTA DE ESPERA Y CANDIDATURAS (doPost)
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (errJson) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var fechaActual = Utilities.formatDate(new Date(), "Europe/Madrid", "dd/MM/yyyy HH:mm:ss");
    var destinatariosAdmin = ["telatiro.pruebas@gmail.com", "info@telatiro.es"];

    // ========================================================================
    // CASO A: CANDIDATURA DE COLABORADORES Y EMPRESAS
    // ========================================================================
    if (data.formType === "colaborador" || data.formType === "recogedor" || data.tipo === "recogedor" || data.formType === "trabaja-con-nosotros" || data.profileType) {
      var candidatesSheet = ss.getSheetByName("Candidaturas") || ss.getSheetByName("Colaboradores") || ss.getSheetByName("Recogedores");
      if (!candidatesSheet) {
        candidatesSheet = ss.insertSheet("Candidaturas");
        candidatesSheet.appendRow([
          "Fecha", "Nombre / Razón Social", "Tipo Perfil", "Teléfono / WhatsApp", "Email", 
          "Zona / Municipio", "Disponibilidad", "Vehículo / Transporte", "Experiencia / Mensaje", "Estado"
        ]);
        candidatesSheet.getRange(1, 1, 1, 10)
          .setFontWeight("bold")
          .setBackground("#25815F")
          .setFontColor("#FFFFFF")
          .setHorizontalAlignment("center");
        candidatesSheet.setFrozenRows(1);
      }

      candidatesSheet.appendRow([
        fechaActual,
        data.name || "-",
        data.profileType || "Autónomo",
        data.phone || "-",
        data.email || "-",
        data.zone || "-",
        data.availability || "-",
        data.vehicle || "-",
        data.notes || "Sin comentarios",
        "Pendiente de Contactar"
      ]);

      var cleanPhoneColab = (data.phone || "").toString().replace(/[^0-9]/g, "");
      var emailColab = (data.email || "").toString().trim();
      var nombreColab = (data.name || "Candidato").toString().trim();

      var asuntoCandidatura = "👷 ¡Nueva Candidatura de Colaborador! - " + nombreColab + " (" + (data.zone || "Zona") + ")";
      var htmlCandidatura = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; padding: 20px;">
          <div style="background-color: #25815F; padding: 15px; border-radius: 8px; color: white; text-align: center;">
            <h2 style="margin: 0; color: white;">👷 TeLaTiro • Nueva Candidatura de Colaborador</h2>
          </div>
          
          <h3 style="color: #25815F; border-bottom: 2px solid #E8F5EF; padding-bottom: 5px; margin-top: 20px;">Datos del Profesional / Empresa</h3>
          <p><strong>👤 Nombre / Razón Social:</strong> ${nombreColab}</p>
          <p><strong>🏷️ Tipo de Perfil:</strong> <span style="background: #E8F5EF; color: #13402E; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${data.profileType || "Autónomo"}</span></p>
          <p><strong>📞 Teléfono:</strong> <a href="tel:${cleanPhoneColab}">${data.phone || "-"}</a></p>
          <p><strong>✉️ Email:</strong> <a href="mailto:${emailColab}">${emailColab || "-"}</a></p>
          <p><strong>📍 Zona / Municipio:</strong> ${data.zone || "-"}</p>
          <p><strong>⏰ Disponibilidad Horaria:</strong> ${data.availability || "-"}</p>
          <p><strong>🚲 Medio de Desplazamiento:</strong> ${data.vehicle || "-"}</p>
          <p><strong>📝 Experiencia / Comentarios:</strong> ${data.notes || "Sin observaciones adicionales"}</p>

          <div style="margin: 20px 0; display: flex; gap: 10px;">
            <a href="https://wa.me/34${cleanPhoneColab}?text=Hola%20${encodeURIComponent(nombreColab)}%2C%20te%20escribimos%20desde%20TeLaTiro%20en%20referencia%20a%20tu%20candidatura%20como%20colaborador" style="background-color: #25D366; color: white; padding: 10px 15px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">💬 Contactar por WhatsApp</a>
            <a href="tel:${cleanPhoneColab}" style="background-color: #25815F; color: white; padding: 10px 15px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block; margin-left: 8px;">📞 Llamar por Teléfono</a>
          </div>

          <div style="margin-top: 25px; padding: 12px; background-color: #F8FAF9; border-radius: 6px; font-size: 12px; color: #666; text-align: center;">
            Esta candidatura se ha registrado en la pestaña <strong>Candidaturas</strong> de tu Google Sheets.
          </div>
        </div>
      `;

      for (var i = 0; i < destinatariosAdmin.length; i++) {
        try {
          MailApp.sendEmail({
            to: destinatariosAdmin[i],
            subject: asuntoCandidatura,
            htmlBody: htmlCandidatura,
            name: "Bolsa de Empleo TeLaTiro"
          });
        } catch (errAdmin) {
          console.error("Error enviando alerta a " + destinatariosAdmin[i] + ": " + errAdmin);
        }
      }

      if (emailColab && emailColab.indexOf("@") !== -1) {
        try {
          MailApp.sendEmail({
            to: emailColab,
            subject: "✅ TeLaTiro - Hemos recibido tu solicitud para colaborar con nosotros",
            htmlBody: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; padding: 25px;">
                <div style="background-color: #25815F; padding: 18px; border-radius: 8px; color: white; text-align: center;">
                  <h2 style="margin: 0; font-size: 22px; color: white;">¡Gracias por tu interés en TeLaTiro!</h2>
                  <p style="margin: 5px 0 0 0; font-size: 13px; color: #E8F5EF;">Red de Colaboradores y Empresas de Asistencia</p>
                </div>
                <p style="margin-top: 20px;">Hola <strong>${nombreColab}</strong>,</p>
                <p>Hemos recibido correctamente tus datos en nuestra bolsa de colaboradores para la zona de <strong>${data.zone || "tu municipio"}</strong>.</p>
                <p>Nuestro equipo de operaciones revisará tu perfil y disponibilidad para coordinar contigo las rutas y opciones de colaboración.</p>
                <p style="font-size: 13px; color: #666; margin-top: 20px;">
                  Te contactaremos vía WhatsApp o teléfono en cuanto activemos nuevas rutas en tu sector.
                </p>
                <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888;">
                  TeLaTiro • <a href="https://telatiro.es" style="color: #25815F; text-decoration: none;">www.telatiro.es</a> • info@telatiro.es
                </div>
              </div>
            `,
            name: "TeLaTiro Equipo"
          });
        } catch (eCand) {
          console.warn("No se pudo enviar acuse al candidato:", eCand);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ "status": "success", "type": "recruiter" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ========================================================================
    // CASO B: LISTA DE ESPERA (Si el turno está completo o el usuario pide lista de espera)
    // ========================================================================
    var esListaEspera = (data.isWaitlist === true || data.isWaitlist === "true" || data.formType === "waitlist" || data.formType === "lista-espera");

    if (esListaEspera) {
      var waitlistSheet = ss.getSheetByName("Lista de Espera");
      var encabEspera = [
        "Fecha", "Nombre", "Teléfono", "Email", "Turno Deseado", "Plan Deseado",
        "Sector / CP", "Calle y Nº", "Piso / Puerta", "Estado", "Observaciones"
      ];

      if (!waitlistSheet) {
        waitlistSheet = ss.insertSheet("Lista de Espera");
        waitlistSheet.appendRow(encabEspera);
        waitlistSheet.getRange(1, 1, 1, encabEspera.length)
          .setFontWeight("bold")
          .setBackground("#D97706") // Tono ámbar/naranja para identificar lista de espera
          .setFontColor("#FFFFFF")
          .setHorizontalAlignment("center");
        waitlistSheet.setFrozenRows(1);
      }

      var calleViaWait = "";
      if (data.streetType && data.streetName) {
        calleViaWait = data.streetType + " " + data.streetName;
      } else if (data.streetName) {
        calleViaWait = data.streetName;
      } else if (data.address || data.rawAddress) {
        calleViaWait = data.address || data.rawAddress;
      } else {
        calleViaWait = "-";
      }

      var dirParsedWait = procesarDireccionYPuerta(calleViaWait, "", data.door || "");
      var calleFinalWait = dirParsedWait.calle;
      var pisoFinalWait = dirParsedWait.piso || "-";

      waitlistSheet.appendRow([
        fechaActual,
        data.name || "-",
        data.phone || "-",
        data.email || "-",
        data.timeSlot || "-",
        data.planName || data.plan || "-",
        data.zip || "-",
        calleFinalWait,
        pisoFinalWait,
        "En Espera (Prioridad)",
        data.notes || "Registro por turno completo (Capacidad 20 plazas)"
      ]);

      var cleanPhoneWait = (data.phone || "").toString().replace(/[^0-9]/g, "");
      var emailWait = (data.email || "").toString().trim();
      var nombreWait = (data.name || "Cliente").toString().trim();
      var turnoWait = data.timeSlot || "Turno";

      var asuntoAdminWait = "⏳ ¡Nuevo Registro en Lista de Espera! - " + nombreWait + " (" + turnoWait + ")";
      var htmlAdminWait = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; padding: 20px;">
          <div style="background-color: #D97706; padding: 15px; border-radius: 8px; color: white; text-align: center;">
            <h2 style="margin: 0; color: white;">⏳ TeLaTiro • Nuevo Registro en Lista de Espera</h2>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #FEF3C7;">Cupo de 20 plazas completado en el turno solicitado</p>
          </div>
          
          <h3 style="color: #D97706; border-bottom: 2px solid #FEF3C7; padding-bottom: 5px; margin-top: 20px;">Datos del Solicitante en Espera</h3>
          <p><strong>👤 Nombre:</strong> ${nombreWait}</p>
          <p><strong>📞 Teléfono:</strong> <a href="tel:${cleanPhoneWait}">${data.phone || "-"}</a></p>
          <p><strong>✉️ Email:</strong> <a href="mailto:${emailWait}">${emailWait || "-"}</a></p>
          <p><strong>📍 Calle y Nº:</strong> ${calleFinalWait}</p>
          <p><strong>🚪 Piso / Puerta:</strong> ${pisoFinalWait}</p>
          <p><strong>📮 Zona / CP:</strong> ${data.zip || "-"}</p>
          <p><strong>⏰ Turno Deseado:</strong> <span style="background: #FEF3C7; color: #92400E; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${turnoWait}</span></p>
          <p><strong>📦 Plan Deseado:</strong> ${data.planName || data.plan || "-"}</p>
          <p><strong>📝 Observaciones:</strong> ${data.notes || "Sin observaciones"}</p>

          <div style="margin: 20px 0; display: flex; gap: 10px;">
            <a href="https://wa.me/34${cleanPhoneWait}?text=Hola%20${encodeURIComponent(nombreWait)}%2C%20te%20escribimos%20desde%20TeLaTiro%20en%20referencia%20a%20tu%20plaza%20en%20Lista%20de%20Espera" style="background-color: #25D366; color: white; padding: 10px 15px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">💬 Contactar por WhatsApp</a>
            <a href="tel:${cleanPhoneWait}" style="background-color: #D97706; color: white; padding: 10px 15px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block; margin-left: 8px;">📞 Llamar por Teléfono</a>
          </div>

          <div style="margin-top: 25px; padding: 12px; background-color: #F8FAF9; border-radius: 6px; font-size: 12px; color: #666; text-align: center;">
            Este contacto se ha guardado en la pestaña <strong>Lista de Espera</strong> de tu Google Sheets.
          </div>
        </div>
      `;

      for (var w = 0; w < destinatariosAdmin.length; w++) {
        try {
          MailApp.sendEmail({
            to: destinatariosAdmin[w],
            subject: asuntoAdminWait,
            htmlBody: htmlAdminWait,
            name: "Lista de Espera TeLaTiro"
          });
        } catch (eWait) {
          console.error("Error enviando alerta espera a " + destinatariosAdmin[w] + ": " + eWait);
        }
      }

      if (emailWait && emailWait.indexOf("@") !== -1) {
        try {
          MailApp.sendEmail({
            to: emailWait,
            subject: "⏳ TeLaTiro - Confirmación de Registro en Lista de Espera Prioritaria",
            htmlBody: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; padding: 25px;">
                <div style="background-color: #25815F; padding: 18px; border-radius: 8px; color: white; text-align: center;">
                  <h2 style="margin: 0; font-size: 22px; color: white;">¡Estás en la Lista de Espera Prioritaria!</h2>
                  <p style="margin: 5px 0 0 0; font-size: 13px; color: #E8F5EF;">Servicio de Asistencia y Depósito de Basura</p>
                </div>
                <p style="margin-top: 20px;">Hola <strong>${nombreWait}</strong>,</p>
                <p>Hemos recibido correctamente tu solicitud para el <strong>${turnoWait}</strong> (${data.planName || data.plan || "Plan de Asistencia"}).</p>
                <p>Para garantizar una recogida 100% puntual y un servicio de máxima calidad, limitamos estrictamente cada turno a <strong>20 servicios diarios</strong>. Tu solicitud ha quedado registrada con <strong>prioridad de acceso número 1</strong>.</p>
                <div style="background-color: #F8FAF9; border: 1px solid #E8F5EF; border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <p style="margin: 4px 0;"><strong>📍 Tu Inmueble:</strong> ${calleFinalWait}${pisoFinalWait && pisoFinalWait !== "-" ? ", " + pisoFinalWait : ""}</p>
                  <p style="margin: 4px 0;"><strong>⏰ Turno Solicitado:</strong> ${turnoWait}</p>
                  <p style="margin: 4px 0;"><strong>📦 Plan:</strong> ${data.planName || data.plan || "-"}</p>
                </div>
                <p style="font-size: 13px; color: #666;">
                  En cuanto se libere una vacante en tu zona o ampliemos plazas en tu turno, nuestro equipo de coordinación contactará contigo por WhatsApp o teléfono para darte de alta de inmediato.
                </p>
                <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888;">
                  TeLaTiro Servicios Privados S.L. • <a href="https://telatiro.es" style="color: #25815F; text-decoration: none;">www.telatiro.es</a> • info@telatiro.es
                </div>
              </div>
            `,
            name: "TeLaTiro • Lista de Espera"
          });
        } catch (eCandWait) {
          console.warn("No se pudo enviar acuse a cliente en espera:", eCandWait);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ "status": "success", "type": "waitlist" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ========================================================================
    // CASO C: CLIENTES DE ASISTENCIA Y TRASLADO DE BASURA (SOLICITUDES DE ALTA)
    // ========================================================================
    var sheet = ss.getSheetByName("Solicitudes") || ss.getSheetByName("Clientes") || ss.getSheetByName("Hoja 1") || ss.getSheets()[0];
    if ((sheet.getName() === "Hoja de Ruta" || sheet.getName() === "Candidaturas" || sheet.getName() === "Colaboradores") && ss.getSheets().length > 1) {
      sheet = ss.getSheetByName("Solicitudes") || ss.getSheets()[0];
    }

    var encabezadosOficiales = [
      "Fecha", "Nombre", "Teléfono", "Email", "Plan", 
      "Días / Frecuencia", "Sector / CP", "Calle / Vía y Nº", "Piso / Puerta / Portal",
      "Turno / Franja", "Forma de Pago", "Fecha Estimada de Inicio", 
      "Recomendado por (Plan Amigo)", "Observaciones", "Estado"
    ];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(encabezadosOficiales);
      sheet.getRange(1, 1, 1, encabezadosOficiales.length)
        .setFontWeight("bold")
        .setBackground("#25815F")
        .setFontColor("#FFFFFF")
        .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var calleVia = "";
    if (data.streetType && data.streetName) {
      calleVia = data.streetType + " " + data.streetName;
    } else if (data.streetName) {
      calleVia = data.streetName;
    } else if (data.address || data.rawAddress) {
      calleVia = data.address || data.rawAddress;
    } else {
      calleVia = "-";
    }

    var pisoPuerta = (data.door || "").toString().trim();

    // PROCESAR Y ASEGURAR QUE EL NÚMERO DE PORTAL ESTÉ EN CALLE Y Nº Y NUNCA EN PISO/PUERTA
    var dirParsed = procesarDireccionYPuerta(calleVia, "", pisoPuerta);
    var calleFinal = dirParsed.calle;
    var pisoFinal = dirParsed.piso || "-";

    var fullAddress = data.address || (calleFinal + (pisoFinal && pisoFinal !== "-" ? ", " + pisoFinal : "") + ", " + (data.zip || "28523 Rivas-Vaciamadrid"));

    // MAPEO INTELIGENTE POR NOMBRE DE COLUMNA (Detecta automáticamente el orden de tu Google Sheets)
    var numCols = Math.max(sheet.getLastColumn(), encabezadosOficiales.length);
    var headers = sheet.getRange(1, 1, 1, numCols).getValues()[0].map(function(h) { return (h + "").toLowerCase().trim(); });

    function findCol(keywords, defaultIdx) {
      for (var c = 0; c < headers.length; c++) {
        for (var k = 0; k < keywords.length; k++) {
          if (headers[c].indexOf(keywords[k]) !== -1) {
            return c;
          }
        }
      }
      return defaultIdx;
    }

    var colFecha = findCol(["fecha"], 0);
    var colNombre = findCol(["nombre"], 1);
    var colTelefono = findCol(["teléfono", "telefono", "movil", "whatsapp"], 2);
    var colEmail = findCol(["email", "correo"], 3);
    var colPlan = findCol(["plan"], 4);
    var colDias = findCol(["días", "dias", "frecuencia", "servicios"], 5);
    var colSector = findCol(["sector", "código postal", "codigo postal", "cp"], 6);
    var colCalle = findCol(["calle y nº", "calle y no", "vía y nº", "via y no", "calle", "vía", "via", "dirección", "direccion", "domicilio"], 7);
    var colNumero = findCol(["número", "numero", "nº", "n°", "num", "portal/nº"], -1);
    var colPiso = findCol(["piso", "puerta", "portal", "escalera", "bloque"], 8);
    var colTurno = findCol(["turno", "franja", "horario"], 9);
    var colPago = findCol(["pago", "forma"], 10);
    var colInicio = findCol(["inicio", "fecha inicio", "fecha estimada", "comienzo"], 11);
    var colReferral = findCol(["recomendado", "amigo", "referral", "conoció", "conocio", "cómo nos"], 12);
    var colNotas = findCol(["observaciones", "notas", "comentarios"], 13);
    var colEstado = findCol(["estado", "situación", "situacion"], 14);

    var newRow = new Array(numCols);
    for (var r = 0; r < numCols; r++) newRow[r] = "-";

    newRow[colFecha] = fechaActual;
    newRow[colNombre] = data.name || "-";
    newRow[colTelefono] = data.phone || "-";
    newRow[colEmail] = data.email || "-";
    newRow[colPlan] = data.planName || data.plan || "-";
    newRow[colDias] = data.days || "-";
    newRow[colSector] = data.zip || "-";

    if (colNumero !== -1 && colNumero !== colCalle && colNumero !== colPiso) {
      newRow[colCalle] = calleFinal;
      newRow[colNumero] = dirParsed.numero || "-";
      newRow[colPiso] = pisoFinal;
    } else if (colPiso !== -1 && colPiso !== colCalle) {
      newRow[colCalle] = calleFinal;
      newRow[colPiso] = pisoFinal;
    } else {
      newRow[colCalle] = fullAddress;
    }

    newRow[colTurno] = data.timeSlot || "-";
    newRow[colPago] = data.paymentMethod || "-";
    newRow[colInicio] = data.startDate || "-";
    newRow[colReferral] = data.referral || "Ninguno / Web";
    newRow[colNotas] = data.notes || "Sin observaciones";
    if (colEstado < numCols) newRow[colEstado] = "Nuevo / Pendiente";

    sheet.appendRow(newRow);

    // Enviar alerta interna a TeLaTiro
    var asuntoInterno = "🔔 ¡Nueva Solicitud de Servicio! - " + (data.name || "Cliente") + " (" + (data.planName || data.plan || "Plan") + ")";
    
    var htmlInterno = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; padding: 20px;">
        <div style="background-color: #25815F; padding: 15px; border-radius: 8px; color: white; text-align: center;">
          <h2 style="margin: 0; color: white;">TeLaTiro • Nueva Solicitud Recibida</h2>
        </div>
        
        <h3 style="color: #25815F; border-bottom: 2px solid #E8F5EF; padding-bottom: 5px; margin-top: 20px;">Datos del Cliente</h3>
        <p><strong>👤 Nombre:</strong> ${data.name || "-"}</p>
        <p><strong>📞 Teléfono:</strong> <a href="tel:${data.phone}">${data.phone || "-"}</a></p>
        <p><strong>✉️ Email:</strong> <a href="mailto:${data.email}">${data.email || "-"}</a></p>
        <p><strong>📍 Calle y Nº:</strong> ${calleFinal}</p>
        <p><strong>🚪 Piso / Puerta:</strong> ${pisoFinal}</p>
        <p><strong>📮 Zona / CP:</strong> ${data.zip || "-"}</p>
        
        <div style="margin: 15px 0; display: flex; gap: 10px;">
          <a href="https://wa.me/34${(data.phone || '').toString().replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(data.name || '')}%2C%20nos%20ponemos%20en%20contacto%20desde%20TeLaTiro%20para%20confirmar%20tu%20solicitud" style="background-color: #25D366; color: white; padding: 10px 15px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">💬 Abrir WhatsApp</a>
          <a href="mailto:${data.email}?subject=TeLaTiro%20-%20Confirmación%20de%20tu%20servicio" style="background-color: #25815F; color: white; padding: 10px 15px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block; margin-left: 8px;">✉️ Escribir Email</a>
        </div>

        <h3 style="color: #25815F; border-bottom: 2px solid #E8F5EF; padding-bottom: 5px; margin-top: 20px;">Servicio Seleccionado</h3>
        <p><strong>📦 Plan:</strong> <span style="background: #E8F5EF; color: #13402E; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${data.planName || data.plan || "-"}</span></p>
        <p><strong>⏰ Franja Horaria:</strong> ${data.timeSlot || "-"}</p>
        <p><strong>📅 Días de Servicio:</strong> ${data.days || "-"}</p>
        <p><strong>💳 Forma de Pago:</strong> ${data.paymentMethod || "-"}</p>
        <p><strong>🚀 Fecha Estimada de Inicio:</strong> ${data.startDate || "-"}</p>
        <p><strong>🎁 Plan Amigo (Recomendado por):</strong> ${data.referral || "Ninguno"}</p>
        <p><strong>📝 Observaciones:</strong> ${data.notes || "Sin observaciones"}</p>

        <div style="margin-top: 25px; padding: 12px; background-color: #F8FAF9; border-radius: 6px; font-size: 12px; color: #666; text-align: center;">
          Esta solicitud ya se ha guardado automáticamente en tu hoja de Google Sheets.
        </div>
      </div>
    `;

    // Enviar alerta interna a cada administrador de TeLaTiro
    for (var k = 0; k < destinatariosAdmin.length; k++) {
      try {
        MailApp.sendEmail({
          to: destinatariosAdmin[k],
          subject: asuntoInterno,
          htmlBody: htmlInterno,
          name: (data.name ? data.name + " (Web TeLaTiro)" : "Formulario TeLaTiro")
        });
      } catch (errCliAdmin) {
        console.error("Error enviando alerta cliente a " + destinatariosAdmin[k] + ": " + errCliAdmin);
      }
    }

    // Enviar confirmación al CLIENTE
    if (data.email && data.email.indexOf("@") !== -1) {
      var asuntoCliente = "✅ Hemos recibido tu solicitud en TeLaTiro - " + (data.planName || "Asistencia y Depósito");
      var htmlCliente = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; padding: 25px;">
          <div style="background-color: #25815F; padding: 18px; border-radius: 8px; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 22px; color: white;">¡Gracias por confiar en TeLaTiro!</h2>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #E8F5EF;">Servicio Privado de Asistencia y Depósito de Basura a Domicilio</p>
          </div>
          
          <p style="margin-top: 20px; font-size: 15px;">Hola <strong>${data.name || "vecino/a"}</strong>,</p>
          <p>Hemos recibido correctamente tu solicitud de alta. A continuación tienes el resumen de tu servicio:</p>
          
          <div style="background-color: #F8FAF9; border: 1px solid #E8F5EF; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 6px 0;"><strong>📦 Plan elegido:</strong> ${data.planName || data.plan || "-"}</p>
            <p style="margin: 6px 0;"><strong>📍 Calle y Nº:</strong> ${calleFinal}</p>
            <p style="margin: 6px 0;"><strong>🚪 Piso / Puerta:</strong> ${pisoFinal}</p>
            <p style="margin: 6px 0;"><strong>⏰ Turno asignado:</strong> ${data.timeSlot || "-"}</p>
            <p style="margin: 6px 0;"><strong>📅 Días de servicio:</strong> ${data.days || "-"}</p>
            <p style="margin: 6px 0;"><strong>💳 Forma de pago:</strong> ${data.paymentMethod || "-"}</p>
            <p style="margin: 6px 0;"><strong>🚀 Fecha estimada de inicio:</strong> <strong>${data.startDate || "-"}</strong></p>
          </div>

          <p style="font-size: 13px; color: #666;">
            Nuestro equipo de coordinación contactará contigo por WhatsApp o llamada para verificar los detalles de acceso a tu portal o cancela y asignarte la ruta definitiva.
          </p>
          
          <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888;">
            TeLaTiro Servicios Privados S.L. • Rivas-Vaciamadrid<br>
            <a href="https://telatiro.es" style="color: #25815F; text-decoration: none;">www.telatiro.es</a> • info@telatiro.es
          </div>
        </div>
      `;

      MailApp.sendEmail({
        to: data.email,
        subject: asuntoCliente,
        htmlBody: htmlCliente,
        name: "TeLaTiro • Asistencia y Depósito",
        replyTo: "info@telatiro.es"
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 5. NORMALIZADOR INTELIGENTE DE DÍA DE LA SEMANA (Detecta Date, Texto o 'Hoy')
function normalizarDiaSemana(valor) {
  var diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  
  if (!valor || (valor + "").trim() === "") {
    return diasSemana[new Date().getDay()];
  }
  
  // Si Google Sheets pasa un objeto Date
  if (Object.prototype.toString.call(valor) === '[object Date]' || typeof valor.getDay === 'function') {
    return diasSemana[valor.getDay()];
  }
  
  var str = (valor + "").toLowerCase().trim();
  if (str.indexOf("lun") !== -1) return "Lunes";
  if (str.indexOf("mar") !== -1) return "Martes";
  if (str.indexOf("mi") !== -1) return "Miércoles";
  if (str.indexOf("jue") !== -1) return "Jueves";
  if (str.indexOf("vie") !== -1) return "Viernes";
  if (str.indexOf("sab") !== -1 || str.indexOf("sáb") !== -1) return "Sábado";
  if (str.indexOf("dom") !== -1) return "Domingo";
  if (str.indexOf("hoy") !== -1) return diasSemana[new Date().getDay()];
  
  return diasSemana[new Date().getDay()];
}

// 6. LIMPIEZA INTELIGENTE DE DIRECCIÓN PARA GOOGLE MAPS (Geolocalización Exacta con CP)
function limpiarDireccionParaMaps(dir) {
  if (!dir) return "Rivas-Vaciamadrid";
  var d = (dir + "").trim();
  
  // 1. Extraer el código postal de 5 dígitos si existe (28521, 28522, 28523, 28524, 28525)
  var cpMatch = d.match(/\b(2852[1-5])\b/);
  var cp = cpMatch ? cpMatch[1] : "28523";
  
  // 2. Quitar descripciones de sector añadidas por el desplegable del formulario
  d = d.replace(/\s*-\s*(covibar|almendros|pablo iglesias|sector central|rivas futura|casco antiguo|nuevos desarrollos|áreas de expansión|areas de expansion|zona este).*$/i, '');
  
  // 3. Quitar códigos postales y menciones de localidad repetidas en el cuerpo del texto
  d = d.replace(/\b2852[1-5]\b/g, '');
  d = d.replace(/\b(rivas[-\s]?vaciamadrid|madrid|españa|spain)\b/gi, '');
  
  // 4. Quitar detalles de puerta/piso precedidos de coma: ", 3º B", ", Portal 2", ", Bajo A" (pero preservando el número de la calle: ", 4" -> " 4")
  d = d.replace(/,\s*(portal|piso|pta|puerta|bloque|esc|escalera|bajo|ático|atico|letra|\d+[ºª°]|\d+\.[a-zA-Z]).*$/i, '');
  
  // Si no había coma, limpiar menciones internas de portal, piso, puerta
  d = d.replace(/\b(portal|piso|pta|puerta|bloque|esc|escalera)\s*[\w\d\.\-]+/gi, '');
  d = d.replace(/\b\d+\s*[\.\-][a-zA-Z]\b/g, '');
  d = d.replace(/\b\d+[ºª°]\s*[a-zA-Z]?\b/g, '');
  
  // 5. Corregir comas pegadas al número: "Juan Gris, 4" -> "Juan Gris 4"
  d = d.replace(/\s*,\s*(\d+)/g, ' $1');
  
  // 6. Expandir abreviaturas para que Google Maps las reconozca al 100%
  d = d.replace(/^c\/\s*/i, 'Calle ');
  d = d.replace(/^avda\.?\s*/i, 'Avenida ');
  d = d.replace(/^av\.?\s*/i, 'Avenida ');
  d = d.replace(/^pza\.?\s*/i, 'Plaza ');
  d = d.replace(/^pz\.?\s*/i, 'Plaza ');
  d = d.replace(/^pº\s*/i, 'Paseo ');
  d = d.replace(/^ps\.?\s*/i, 'Paseo ');
  d = d.replace(/^ctra\.?\s*/i, 'Carretera ');
  
  // 7. Limpiar comas, guiones o espacios dobles sobrantes al inicio y al final
  d = d.replace(/[,\s\-\–]+$/g, '').trim();
  d = d.replace(/^[,\s\-\–]+/g, '').trim();
  d = d.replace(/\s+/g, ' ').trim();
  
  // 8. Ensamblar dirección EXACTA con CP y Localidad para Google Maps
  return d + ", " + cp + " Rivas-Vaciamadrid, Madrid";
}

// 6.b PROCESADOR INTELIGENTE DE DIRECCIÓN Y PUERTA (Calle y Nº / Piso y Puerta)
function procesarDireccionYPuerta(calleRaw, numeroRaw, pisoRaw) {
  var calle = (calleRaw || "").toString().trim();
  var numero = (numeroRaw || "").toString().trim();
  var piso = (pisoRaw || "").toString().trim();
  
  if (piso === "-" || piso.toLowerCase() === "sin piso" || piso.toLowerCase() === "ninguno" || piso.toLowerCase() === "sin puerta") {
    piso = "";
  }
  if (numero === "-" || numero.toLowerCase() === "sin número" || numero.toLowerCase() === "sin numero") {
    numero = "";
  }

  // 1. Limpiar prefijos redundantes en número si viene en columna propia (ej: "Nº 4" -> "4")
  if (numero) {
    numero = numero.replace(/^(?:n[º°ª\.\/\-]?\s*|n[uú]mero\s*|num\.\s*|n\s*)/i, '').trim();
  }

  var numExtraido = "";

  // 2. Si la calle NO tiene dígitos todavía, extraer el número del campo piso o de número
  if (!/\d+/.test(calle)) {
    if (numero) {
      numExtraido = numero;
    } else if (piso) {
      var pisoSinPrefijo = piso.replace(/^(?:n[º°ª\.\/\-]?\s*|n[uú]mero\s*|num\.\s*|n\s*)/i, '');
      
      // Caso 1: Empieza por número seguido de separador o palabras de piso (ej: "4, 2º B", "4, 4B", "4 2º B", "18 - Bajo A", "12, Portal 2, 4B")
      var matchCompuesto = pisoSinPrefijo.match(/^(\d+)(?:\s*([a-zA-Z]))?\s*(?:[,\-\/\.]\s*|\s+(?:portal|bloque|esc|escalera|piso|pta|puerta|bajo|ático|atico|\d+[ºª°])\b)\s*(.*)$/i);
      if (matchCompuesto) {
        numExtraido = matchCompuesto[1] + (matchCompuesto[2] ? matchCompuesto[2].toUpperCase() : "");
        piso = (matchCompuesto[3] || "").trim();
      } else {
        // Caso 2: Empieza por número seguido de espacio y letra/piso (ej: "4 2B", "4 4 B", "4 B")
        var matchEspacio = pisoSinPrefijo.match(/^(\d+)\s+([a-zA-Z0-9ºª°\s\.\,\-]+)$/i);
        if (matchEspacio) {
          numExtraido = matchEspacio[1];
          piso = matchEspacio[2].trim();
        } else {
          // Caso 3: Es solo número o número con letra pegada (ej: "4", "18", "4B", "4A")
          var matchSoloNum = pisoSinPrefijo.match(/^(\d+)([a-zA-Z])?$/i);
          if (matchSoloNum) {
            numExtraido = matchSoloNum[1] + (matchSoloNum[2] ? matchSoloNum[2].toUpperCase() : "");
            piso = "";
          }
        }
      }
    }

    if (numExtraido) {
      var sep = (calle.endsWith(",") || calle.endsWith(".")) ? " " : ", ";
      calle = calle + sep + numExtraido;
    }
  } else {
    // La calle YA tiene número (ej. "Calle Juan Gris, 4" o "Av. Almendros 18")
    if (piso) {
      var matchCalleNum = calle.match(/\b(\d+)\b/);
      if (matchCalleNum) {
        var nCalle = matchCalleNum[1];
        var pisoSinPref = piso.replace(/^(?:n[º°ª\.\/\-]?\s*|n[uú]mero\s*|num\.\s*|n\s*)/i, '');
        if (pisoSinPref.trim() === nCalle) {
          // Si el campo piso era únicamente el mismo número repetido (ej. "4"), lo vaciamos
          piso = "";
        } else {
          // Si el campo piso repite el número de calle seguido de puntuación (ej: "4, 4B", "4, 4 B", "4, 2º B"), quitamos "4, "
          var escapeRegex = nCalle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var pat = new RegExp('^(?:n[º°ª\\.\\/\\-]?\\s*|n[uú]mero\\s*|num\\.\\s*|n\\s*)?' + escapeRegex + '\\s*[,\\-\\/\\.]+\\s*', 'i');
          piso = piso.replace(pat, '').trim();
        }
      }
    }
  }

  // Limpiar comas o guiones residuales al inicio/final de piso
  piso = piso.replace(/^[,\-\/\.\s]+/, '').replace(/[,\-\/\.\s]+$/, '').trim();

  // Limpiar formato de calle
  calle = calle.replace(/\s*,\s*,+/g, ',').replace(/\s+/g, ' ').trim();

  // Extraer número solo si se requiere para columna individual
  var numSolo = "";
  var matchNumEnCalle = calle.match(/\b(\d+(?:\s*[a-zA-Z])?)\b/);
  if (matchNumEnCalle) {
    numSolo = matchNumEnCalle[1];
  }

  return {
    calle: calle,
    numero: numSolo,
    piso: piso
  };
}

// 7. MOTOR DE OPTIMIZACIÓN GEOGRÁFICA POR CERCANÍA (Nearest Neighbor TSP)
var COORD_SECTORES = {
  "28523": { lat: 40.3542, lng: -3.5425 }, // Covibar / Almendros / Pablo Iglesias
  "28522": { lat: 40.3445, lng: -3.5241 }, // Sector Central / Rivas Futura
  "28521": { lat: 40.3283, lng: -3.5185 }, // Casco Antiguo
  "28524": { lat: 40.3685, lng: -3.5162 }, // Cristo de Rivas / Nuevos Desarrollos
  "28525": { lat: 40.3600, lng: -3.5200 }
};

function calcularDistanciaKm(p1, p2) {
  if (!p1 || !p2 || !p1.lat || !p2.lat) return 9999;
  var dLat = (p1.lat - p2.lat) * 111.32;
  var dLng = (p1.lng - p2.lng) * 40075 * Math.cos((p1.lat + p2.lat) * Math.PI / 360) / 360;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function obtenerCoordenadasDireccion(dirLimpia) {
  try {
    var res = Maps.newGeocoder().geocode(dirLimpia);
    if (res && res.status === "OK" && res.results && res.results.length > 0) {
      var loc = res.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }
  } catch(e) {
    console.warn("Geocodificación estimada por CP para: " + dirLimpia);
  }
  var cpMatch = dirLimpia.match(/\b(2852[1-5])\b/);
  var cp = cpMatch ? cpMatch[1] : "28523";
  return COORD_SECTORES[cp] || { lat: 40.3542, lng: -3.5425 };
}

function optimizarRutaPorCercania(paradas) {
  if (!paradas || paradas.length <= 1) return paradas;
  
  // 1. Obtener coordenadas de cada parada
  for (var i = 0; i < paradas.length; i++) {
    paradas[i].coord = obtenerCoordenadasDireccion(paradas[i].direccionLimpia);
  }
  
  // 2. Punto inicial: el más al oeste (menor longitud, entrada natural desde Madrid/Covibar)
  var noVisitados = paradas.slice();
  var mejorInicioIdx = 0;
  var minLng = noVisitados[0].coord.lng;
  
  for (var j = 1; j < noVisitados.length; j++) {
    if (noVisitados[j].coord.lng < minLng) {
      minLng = noVisitados[j].coord.lng;
      mejorInicioIdx = j;
    }
  }
  
  var rutaOptimizada = [noVisitados.splice(mejorInicioIdx, 1)[0]];
  
  // 3. Enlazar cada parada con su vecino más cercano disponible
  while (noVisitados.length > 0) {
    var puntoActual = rutaOptimizada[rutaOptimizada.length - 1];
    var vecinoMasCercanoIdx = 0;
    var distanciaMinima = calcularDistanciaKm(puntoActual.coord, noVisitados[0].coord);
    
    for (var k = 1; k < noVisitados.length; k++) {
      var d = calcularDistanciaKm(puntoActual.coord, noVisitados[k].coord);
      if (d < distanciaMinima) {
        distanciaMinima = d;
        vecinoMasCercanoIdx = k;
      }
    }
    
    rutaOptimizada.push(noVisitados.splice(vecinoMasCercanoIdx, 1)[0]);
  }
  
  return rutaOptimizada;
}

// 8. LÓGICA ESTRICTA DE FILTRADO POR DÍAS
function correspondeServicioHoy(plan, diasServicio, diaNombre) {
  var p = (plan || "").toString().toLowerCase().trim();
  var d = (diasServicio || "").toString().toLowerCase().trim();
  var dia = (diaNombre || "").toLowerCase().trim();
  
  if (p.indexOf("recogedor") !== -1 || p.indexOf("colaborador") !== -1 || p.indexOf("candidatura") !== -1) {
    return false;
  }

  var esLunes = dia === "lunes" || dia.indexOf("lun") !== -1;
  var esMartes = dia === "martes" || dia.indexOf("mar") !== -1;
  var esMiercoles = dia === "miércoles" || dia === "miercoles" || dia.indexOf("mi") !== -1;
  var esJueves = dia === "jueves" || dia.indexOf("jue") !== -1;
  var esViernes = dia === "viernes" || dia.indexOf("vie") !== -1;

  // 1. PLANES DE 5 DÍAS (Lunes a Viernes / Premium)
  if (p.indexOf("5 d") !== -1 || p.indexOf("5d") !== -1 || p.indexOf("premium") !== -1 || p.indexOf("chalet 5") !== -1 ||
      d.indexOf("lunes a viernes") !== -1 || d.indexOf("5 servicio") !== -1 || d.indexOf("5 recogida") !== -1 || d.indexOf("5 d") !== -1) {
    return esLunes || esMartes || esMiercoles || esJueves || esViernes;
  }

  // 2. PLANES DE 3 DÍAS (Lunes, Miércoles y Viernes / Plus)
  if (p.indexOf("3 d") !== -1 || p.indexOf("3d") !== -1 || p.indexOf("plus") !== -1 || p.indexOf("chalet 3") !== -1 || p.indexOf("estándar") !== -1 || p.indexOf("estandar") !== -1 ||
      d.indexOf("lunes, mi") !== -1 || d.indexOf("lunes,mi") !== -1 || d.indexOf("3 servicio") !== -1 || d.indexOf("3 recogida") !== -1 || d.indexOf("3 d") !== -1) {
    return esLunes || esMiercoles || esViernes;
  }

  // 3. PLANES DE 2 DÍAS (Martes y Jueves / Básico)
  if (p.indexOf("2 d") !== -1 || p.indexOf("2d") !== -1 || p.indexOf("básico") !== -1 || p.indexOf("basico") !== -1 || p.indexOf("chalet 2") !== -1 || p.indexOf("piso (24") !== -1 ||
      d.indexOf("martes y jueves") !== -1 || d.indexOf("martes, jue") !== -1 || d.indexOf("2 servicio") !== -1 || d.indexOf("2 recogida") !== -1 || d.indexOf("2 d") !== -1) {
    return esMartes || esJueves;
  }

  // 4. SERVICIO PUNTUAL (1 día)
  if (p.indexOf("puntual") !== -1 || d.indexOf("puntual") !== -1 || d.indexOf("hoy") !== -1 || p.indexOf("1 d") !== -1) {
    if (esLunes && (d.indexOf("lunes") !== -1 || d.indexOf("hoy") !== -1)) return true;
    if (esMartes && (d.indexOf("martes") !== -1 || d.indexOf("hoy") !== -1)) return true;
    if (esMiercoles && (d.indexOf("miércoles") !== -1 || d.indexOf("miercoles") !== -1 || d.indexOf("hoy") !== -1)) return true;
    if (esJueves && (d.indexOf("jueves") !== -1 || d.indexOf("hoy") !== -1)) return true;
    if (esViernes && (d.indexOf("viernes") !== -1 || d.indexOf("hoy") !== -1)) return true;
    return false;
  }

  // 5. Coincidencia directa por texto en días
  if (esLunes && d.indexOf("lunes") !== -1) return true;
  if (esMartes && d.indexOf("martes") !== -1) return true;
  if (esMiercoles && (d.indexOf("miércoles") !== -1 || d.indexOf("miercoles") !== -1)) return true;
  if (esJueves && d.indexOf("jueves") !== -1) return true;
  if (esViernes && d.indexOf("viernes") !== -1) return true;

  return false;
}

// 9. GENERADOR DE HOJA DE RUTA DIARIA (CALLE Y Nº EXACTO)
function generarRutaDiaria(turnoManual) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaClientes = ss.getSheetByName("Solicitudes") || ss.getSheetByName("Clientes") || ss.getSheets()[0];
  var hojaRuta = ss.getSheetByName("Hoja de Ruta");
  
  if (!hojaRuta) {
    SpreadsheetApp.getUi().alert("⚠️ Crea primero una pestaña llamada 'Hoja de Ruta'.");
    return;
  }
  
  var diaBruto = hojaRuta.getRange("B1").getValue();
  var diaSeleccionado = normalizarDiaSemana(diaBruto);
  hojaRuta.getRange("B1").setValue(diaSeleccionado);
  
  var turnoSeleccionado = turnoManual || hojaRuta.getRange("D1").getValue() || "Todos";
  if (turnoManual) {
    hojaRuta.getRange("D1").setValue(turnoManual);
  }
  
  var datos = hojaClientes.getDataRange().getValues();
  if (datos.length <= 1) {
    SpreadsheetApp.getUi().alert("No hay clientes registrados en la hoja de Solicitudes.");
    return;
  }

  var encabezados = datos[0].map(function(h) { return (h + "").toLowerCase().trim(); });
  
  function buscarIndice(palabrasClave, porDefecto) {
    for (var i = 0; i < encabezados.length; i++) {
      for (var k = 0; k < palabrasClave.length; k++) {
        if (encabezados[i].indexOf(palabrasClave[k]) !== -1) {
          return i;
        }
      }
    }
    return porDefecto;
  }
  
  var colNombre = buscarIndice(["nombre"], 1);
  var colTelefono = buscarIndice(["teléfono", "telefono", "whatsapp", "movil"], 2);
  var colPlan = buscarIndice(["plan"], 4);
  var colDias = buscarIndice(["días", "dias", "frecuencia", "nº de servicios"], 5);
  var colSector = buscarIndice(["sector", "código postal", "codigo postal", "cp"], 6);
  var colCalle = buscarIndice(["calle y nº", "calle y no", "vía y nº", "via y no", "calle", "vía", "via", "dirección", "direccion", "domicilio"], 7);
  var colNumero = buscarIndice(["número", "numero", "nº", "n°", "num", "portal/nº"], -1);
  var colPiso = buscarIndice(["piso", "puerta", "portal", "escalera", "bloque"], 8);
  var colFranja = buscarIndice(["franja", "turno", "horario"], 9);
  var colPago = buscarIndice(["pago", "forma"], 10);
  var colNotas = buscarIndice(["observaciones", "notas", "comentarios"], 13);
  var colEstado = buscarIndice(["estado", "situación", "situacion"], 14);
  
  // Limpiar completamente cualquier dato o checkbox anterior (filas 4 a fin de hoja)
  var maxFilas = hojaRuta.getMaxRows();
  if (maxFilas >= 4) {
    var rangoLimpiar = hojaRuta.getRange(4, 1, maxFilas - 3, 10);
    rangoLimpiar.clearContent();
    rangoLimpiar.clearFormat();
    try {
      rangoLimpiar.removeCheckboxes();
    } catch(errCb) {}
  }
  
  var paradasCandidatas = [];
  
  for (var i = 1; i < datos.length; i++) {
    var fila = datos[i];
    var nombre = (fila[colNombre] || "").toString().trim();
    var telefono = (fila[colTelefono] || "").toString().trim();
    var plan = (fila[colPlan] || "").toString().trim();
    var diasServicio = (fila[colDias] || "").toString().trim();
    var calleRaw = (fila[colCalle] || "").toString().trim();
    var numeroRaw = (colNumero !== -1 && colNumero < fila.length && fila[colNumero]) ? (fila[colNumero] + "").trim() : "";
    var pisoRaw = (colPiso !== -1 && colPiso < fila.length && fila[colPiso]) ? (fila[colPiso] + "").trim() : "";
    var sectorCp = (colSector !== -1 && colSector < fila.length && fila[colSector]) ? (fila[colSector] + "").trim() : "";
    var franja = (colFranja !== -1 && colFranja < fila.length && fila[colFranja]) ? (fila[colFranja] + "").trim() : "";
    var formaPago = (colPago !== -1 && colPago < fila.length && fila[colPago]) ? (fila[colPago] + "").trim() : "";
    var notas = (colNotas !== -1 && colNotas < fila.length && fila[colNotas]) ? (fila[colNotas] + "").trim() : "";
    var estado = (colEstado !== -1 && colEstado < fila.length && fila[colEstado]) ? (fila[colEstado] + "").toLowerCase().trim() : "";
    
    // Procesar inteligentemente calle, número y piso
    var parsed = procesarDireccionYPuerta(calleRaw, numeroRaw, pisoRaw);
    var calleYNumero = parsed.calle;
    var piso = parsed.piso;

    // Ignorar si no hay calle o es solo el municipio
    if (!calleYNumero || calleYNumero.length < 3 || calleYNumero.toLowerCase() === "rivas-vaciamadrid") {
      continue;
    }
    
    // FILTRO DE ESTADO: Solo descartar bajas, cancelados o pausados
    if (estado.indexOf("baja") !== -1 || estado.indexOf("cancel") !== -1 || estado.indexOf("pausad") !== -1 || estado.indexOf("inactiv") !== -1 || estado.indexOf("prueba") !== -1) {
      continue;
    }
    
    var tocaHoy = correspondeServicioHoy(plan, diasServicio, diaSeleccionado);
    
    var turnoCoincide = true;
    var franjaTexto = franja.toLowerCase();
    var turnoBuscar = (turnoSeleccionado + "").toLowerCase();
    
    if (turnoBuscar.indexOf("mañana") !== -1 && franjaTexto.indexOf("tarde") !== -1 && franjaTexto.indexOf("mañana") === -1) {
      turnoCoincide = false;
    } else if (turnoBuscar.indexOf("tarde") !== -1 && franjaTexto.indexOf("mañana") !== -1 && franjaTexto.indexOf("tarde") === -1) {
      turnoCoincide = false;
    }
    
    if (tocaHoy && turnoCoincide) {
      var detalleNotas = [];
      var esPuntual = plan.toLowerCase().indexOf("puntual") !== -1;
      var esEfectivo = formaPago.toLowerCase().indexOf("efectivo") !== -1 || formaPago.toLowerCase().indexOf("mano") !== -1;
      
      if (esPuntual && esEfectivo) {
        detalleNotas.push("💵 COBRAR 4,90€ EN EFECTIVO");
      }
      if (notas && notas !== "-" && notas.toLowerCase() !== "sin observaciones" && notas.toLowerCase() !== "ninguna") {
        detalleNotas.push(notas);
      }

      var direccionCompletaParaMaps = calleYNumero + (sectorCp ? ", " + sectorCp : "") + ", Rivas-Vaciamadrid";
      var dirLimpia = limpiarDireccionParaMaps(direccionCompletaParaMaps);

      var pisoVecinoTexto = nombre;
      if (piso && piso !== "-" && piso.toLowerCase() !== "sin piso") {
        pisoVecinoTexto = piso + " (" + nombre + ")";
      }

      paradasCandidatas.push({
        nombre: nombre,
        piso: piso,
        pisoVecino: pisoVecinoTexto,
        telefono: telefono,
        calle: calleYNumero,
        direccionLimpia: dirLimpia,
        franja: franja,
        notas: detalleNotas.join(" | ")
      });
    }
  }
  
  if (paradasCandidatas.length === 0) {
    SpreadsheetApp.getUi().alert("ℹ️ No hay servicios activos para el " + diaSeleccionado + " (" + turnoSeleccionado + ").");
    return;
  }
  
  // 🧭 ORDENAR PARADAS POR PROXIMIDAD GEOGRÁFICA (Ruta óptima sin zig-zags)
  var paradas = optimizarRutaPorCercania(paradasCandidatas);
  var direccionesParaMaps = [];
  
  // Escribir paradas en la tabla de Hoja de Ruta
  for (var j = 0; j < paradas.length; j++) {
    var p = paradas[j];
    var numFila = 4 + j;
    
    hojaRuta.getRange(numFila, 1).insertCheckboxes();    // Col A: Trasladado
    hojaRuta.getRange(numFila, 2).setValue(j + 1);       // Col B: Parada # (Secuencia optimizada)
    
    // Col C: Calle y Número con enlace directo individual a Google Maps
    var urlMapsIndividual = "https://maps.google.com/?q=" + encodeURIComponent(p.direccionLimpia);
    var richDir = SpreadsheetApp.newRichTextValue()
      .setText(p.calle)
      .setLinkUrl(urlMapsIndividual)
      .build();
    hojaRuta.getRange(numFila, 3).setRichTextValue(richDir); // Col C: Calle y Número
    
    hojaRuta.getRange(numFila, 4).setValue(p.pisoVecino); // Col D: Piso / Puerta (Vecino)
    hojaRuta.getRange(numFila, 5).setValue(p.franja);     // Col E: Turno
    hojaRuta.getRange(numFila, 6).setValue(p.telefono);   // Col F: Teléfono / WhatsApp
    hojaRuta.getRange(numFila, 7).setValue(p.notas);      // Col G: Notas de Acceso
    
    if (p.direccionLimpia && direccionesParaMaps.indexOf(p.direccionLimpia) === -1) {
      direccionesParaMaps.push(p.direccionLimpia);
    }
  }
  
  // GENERAR ENLACE OFICIAL COMPLETO A GOOGLE MAPS (Universal API: origin + waypoints ordenados + destination)
  if (direccionesParaMaps.length > 0) {
    var urlMaps = "";
    if (direccionesParaMaps.length === 1) {
      urlMaps = "https://maps.google.com/?q=" + encodeURIComponent(direccionesParaMaps[0]);
    } else if (direccionesParaMaps.length === 2) {
      urlMaps = "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(direccionesParaMaps[0]) + 
                "&destination=" + encodeURIComponent(direccionesParaMaps[1]);
    } else {
      // 3 o más paradas: origen + waypoints intermedios en orden de cercanía + destino final
      var origen = direccionesParaMaps[0];
      var destino = direccionesParaMaps[direccionesParaMaps.length - 1];
      var waypoints = direccionesParaMaps.slice(1, direccionesParaMaps.length - 1).join("|");
      
      urlMaps = "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(origen) + 
                "&destination=" + encodeURIComponent(destino) + 
                "&waypoints=" + encodeURIComponent(waypoints);
    }
    
    var richText = SpreadsheetApp.newRichTextValue()
      .setText("🗺️ ABRIR RUTA EN GOOGLE MAPS (" + direccionesParaMaps.length + " PARADAS)")
      .setLinkUrl(urlMaps)
      .build();
    hojaRuta.getRange("F1").setRichTextValue(richText);
  }
  
  SpreadsheetApp.getUi().alert("✅ Ruta optimizada por cercanía: " + paradas.length + " paradas para el " + diaSeleccionado + " (" + turnoSeleccionado + ").");
}
```

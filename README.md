# TeLaTiro - Plataforma Web Oficial

Sitio web corporativo y de contratación directa para **Te La Tiro**, empresa especializada en el servicio premium privado de recogida de bolsas de basura a domicilio.

---

## 🚀 Tarifas, Franjas Horarias y Formas de Pago

1. **Tarifas Oficiales y Frecuencias**:
   - **Pisos y Apartamentos**:
     - **Plan Piso (2 días)**: `24,90 € / mes` • *Martes y Jueves* (~1,55 € / bolsa)
     - **Plan Piso Plus (3 días)**: `29,90 € / mes` • *Lunes, Miércoles y Viernes* (~1,25 € / bolsa)
     - **Plan Piso Premium (5 días)**: `39,90 € / mes` • *Lunes a Viernes completo* (~0,99 € / bolsa)
   - **Casas y Chalets**:
     - **Plan Casa/Chalet (2 días)**: `34,90 € / mes` • *Martes y Jueves* (~2,18 € / bolsa)
     - **Plan Casa/Chalet Plus (3 días)**: `39,90 € / mes` • *Lunes, Miércoles y Viernes* (~1,66 € / bolsa)
     - **Plan Casa/Chalet Premium (5 días)**: `49,90 € / mes` • *Lunes a Viernes completo* (~1,25 € / bolsa)
   - **Plan Especial Comunidades de Propietarios (10+ Vecinos)**:
     - **5 € de descuento directo al mes para cada vecino** si en la misma finca, bloque o urbanización se suscriben 10 o más viviendas:
       - *Piso (2d)*: `19,90 € / mes` (~1,24 € / bolsa)
       - *Piso Plus (3d)*: `24,90 € / mes` (~1,03 € / bolsa)
       - *Piso Premium (5d)*: `34,90 € / mes` (~0,87 € / bolsa)
       - *Chalets (2d/3d/5d)*: `29,90 €` / `34,90 €` / `44,90 € / mes`
   - **Plan Amigo Vecinal (Recomendación)**:
     - **5 € de descuento para cada uno**: 5 € de descuento puntual en la 2ª mensualidad del nuevo vecino suscrito y 5 € de descuento en el próximo recibo del vecino que lo recomendó.
   - **Recogida Puntual**:
     - `4,90 € / recogida` • *1 día a elegir de Lunes a Viernes* (mismo día: máx. hasta las **11:00 h** para Mañana o hasta las **18:00 h** para Tarde)

2. **Formas de Pago**:
   - **Planes Mensuales (Suscripciones Pisos, Chalets y Comunidades)**: Pago mediante **Domiciliación bancaria (SEPA)** o **Tarjeta bancaria** (*no admite efectivo*).
   - **Recogida Puntual (4,90 €)**: Pago mediante **Tarjeta bancaria** o **Efectivo en mano** en el momento de la recogida (*no admite domiciliación bancaria*).

3. **2 Franjas Horarias Disponibles**:
   - **Turno de Mañana**: De `09:00 a 13:00 h` *(Bolsas preparadas a las **09:00 h**)*
   - **Turno de Tarde**: De `16:00 a 20:00 h` *(Bolsas preparadas a las **16:00 h**)*

4. **Condiciones Clave del Servicio**:
   - **Fecha de Inicio de Suscripciones Mensuales**:
     - Altas solicitadas **del 1 al 5 del mes**: El servicio comienza en el **mes en curso**.
     - Altas solicitadas **a partir del día 6 del mes**: El servicio dará comienzo el **día 1 del mes siguiente** por motivos de organización y asignación logística de rutas (pudiendo contratar *Recogidas Puntuales* si se necesitan servicios previos).
   - **Puntualidad en la Colocación**: Las bolsas deben estar depositadas en el lugar asignado (felpudo, pomo, cancela o puerta) **a las 09:00 h (turno mañana) o a las 16:00 h (turno tarde)**, ya que el recogedor puede estar en el domicilio justo al inicio de la franja.
   - **Capacidad**: Máximo de **2 bolsas de basura doméstica estándar** cerradas (**Hasta 50L cada bolsa**) por servicio.
   - **Tipo de Residuo**: Solo basura doméstica habitual (fracción resto/orgánica).

5. **Sin Permanencia**:
   - Cancela cuando tú quieras, con total libertad.

---

## 🗺️ Cobertura y Rutas Ampliables

- El sistema organiza las rutas por sectores y admite cualquier código postal o municipio para verificación y solicitud directa.

---

## 📁 Estructura del Proyecto

```
telatiro-web/
├── index.html              # Estructura principal con fotos reales y formulario
├── css/
│   └── styles.css          # Estilos corporativos, animaciones y clases fotográficas
├── js/
│   └── app.js              # Lógica interactiva, selector de fotos, WhatsApp y validación
├── manifest.json           # Configuración PWA
├── assets/
│   ├── hero-mockup.jpg     # Foto original entrega en puerta
│   ├── brand-mockup.jpg    # Foto original bolsa en felpudo y repartidor
│   ├── logo.svg            # Logotipo corporativo TeLaTiro SVG
│   └── door-tag.svg        # Colgador de puerta corporativo SVG
└── README.md               # Documentación general
```

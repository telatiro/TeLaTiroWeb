/**
 * TeLaTiro - Lógica Interactiva y Experiencia de Usuario
 * Servicio Premium de Recogida de Basura a Domicilio
 * Zona de Cobertura Activa: Rivas-Vaciamadrid
 */

document.addEventListener('DOMContentLoaded', () => {
  initPWA();
  initHeader();
  initMobileMenu();
  initFaqAccordion();
  initAudienceTabs();
  initPricingTabs();
  initFormCategoryTabs();
  initBookingForm();
  initRecruiterForm();
  initCoverageChecker();
  initPlanSelectors();
  initHeroPhotoSwitcher();
});

/**
 * Registro de Service Worker para PWA (Instalación de App en Android e iOS)
 */
function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('TeLaTiro Service Worker activo:', reg.scope))
        .catch(err => console.log('Error al registrar Service Worker:', err));
    });
  }
}

// Configuración Global, Sectores de Rivas y Tarifas Oficiales
const CONFIG = {
  phone: '+34 600 000 000',
  whatsappNumber: '34600000000', // Reemplazar con el número real de WhatsApp de TeLaTiro
  email: 'telatiro.pruebas@gmail.com',
  googleSheetWebhookUrl: 'https://script.google.com/macros/s/AKfycbyyTWpM-fDyh68h3Z0_Rk50MHxd9rSu3wVm3dFWZsbdR1On-O8FBFlrU7EM2RotUoirDg/exec',
  sectors: {
    '28521': {
      cp: '28521',
      name: 'Casco Antiguo y Zona Este',
      description: 'Casco Antiguo y zona este de Vaciamadrid.',
      keywords: ['28521', 'casco antiguo', 'casco', 'este', 'vaciamadrid']
    },
    '28522': {
      cp: '28522',
      name: 'Sector Central y Rivas Futura',
      description: 'Sector Central y la zona comercial de Rivas Futura.',
      keywords: ['28522', 'sector central', 'futura', 'rivas futura', 'central']
    },
    '28523': {
      cp: '28523',
      name: 'Covibar, Almendros y Pablo Iglesias',
      description: 'Avenida de los Almendros, urbanización Pablo Iglesias, barrio de Covibar y La Partija.',
      keywords: ['28523', 'almendros', 'avenida de los almendros', 'pablo iglesias', 'covibar', 'partija', 'la partija']
    },
    '28524': {
      cp: '28524 / 28525',
      name: 'Nuevos Desarrollos e Industrial',
      description: 'Nuevos desarrollos urbanísticos, zonas industriales y áreas de expansión reciente.',
      keywords: ['28524', '28525', 'nuevos desarrollos', 'industrial', 'expansion', 'desarrollos', 'poligono']
    }
  },
  plans: {
    piso_2d: {
      name: 'Plan Piso (2 días)',
      category: 'pisos',
      price: '24,90 €',
      period: '/ mes',
      costPerBag: '¡Solo 1,55 € por bolsa recogida!',
      frequency: 'Recogidas semanales: Martes y Jueves (2 días)',
      days: 'Martes y Jueves',
      details: '2 recogidas semanales • Martes y Jueves • Domiciliación SEPA o Tarjeta (no efectivo)'
    },
    piso_plus: {
      name: 'Plan Piso Plus (3 días)',
      category: 'pisos',
      price: '29,90 €',
      period: '/ mes',
      costPerBag: '¡Solo 1,25 € por bolsa recogida!',
      frequency: 'Recogidas semanales: Lunes, Miércoles y Viernes (3 días)',
      days: 'Lunes, Miércoles y Viernes',
      details: '3 recogidas semanales • Lunes, Miércoles y Viernes • Domiciliación SEPA o Tarjeta (no efectivo)'
    },
    piso_premium: {
      name: 'Plan Piso Premium (5 días)',
      category: 'pisos',
      price: '39,90 €',
      period: '/ mes',
      costPerBag: '¡Solo 0,99 € por bolsa (menos de 1€)!',
      frequency: 'Recogidas semanales: Lunes a Viernes completo (5 días)',
      days: 'Lunes a Viernes',
      details: '5 recogidas semanales • Lunes a Viernes • Domiciliación SEPA o Tarjeta (no efectivo)'
    },
    chalet_2d: {
      name: 'Plan Casa/Chalet (2 días)',
      category: 'chalets',
      price: '34,90 €',
      period: '/ mes',
      costPerBag: '¡Solo 2,18 € por bolsa recogida!',
      frequency: 'Recogidas semanales: Martes y Jueves (2 días)',
      days: 'Martes y Jueves',
      details: '2 recogidas semanales • Martes y Jueves • Domiciliación SEPA o Tarjeta (no efectivo)'
    },
    chalet_plus: {
      name: 'Plan Casa/Chalet Plus (3 días)',
      category: 'chalets',
      price: '39,90 €',
      period: '/ mes',
      costPerBag: '¡Solo 1,66 € por bolsa recogida!',
      frequency: 'Recogidas semanales: Lunes, Miércoles y Viernes (3 días)',
      days: 'Lunes, Miércoles y Viernes',
      details: '3 recogidas semanales • Lunes, Miércoles y Viernes • Domiciliación SEPA o Tarjeta (no efectivo)'
    },
    chalet_premium: {
      name: 'Plan Casa/Chalet Premium (5 días)',
      category: 'chalets',
      price: '49,90 €',
      period: '/ mes',
      costPerBag: '¡Solo 1,25 € por bolsa recogida!',
      frequency: 'Recogidas semanales: Lunes a Viernes completo (5 días)',
      days: 'Lunes a Viernes',
      details: '5 recogidas semanales • Lunes a Viernes • Domiciliación SEPA o Tarjeta (no efectivo)'
    },
    puntual: {
      name: 'Recogida Puntual',
      category: 'puntual',
      price: '4,90 €',
      period: '/ recogida',
      costPerBag: 'Servicio individual puntual',
      frequency: 'Servicio puntual de 1 día',
      days: 'Lunes a Viernes (a elegir)',
      details: '1 servicio puntual • Hasta 2 bolsas • Tarjeta o Efectivo en mano'
    }
  }
};

/**
 * 1. Cabecera con efecto de desplazamiento (Glass Header)
 */
function initHeader() {
  const header = document.getElementById('mainHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/**
 * 2. Menú Móvil
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const closeBtn = document.getElementById('mobileMenuClose');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuBackdrop = document.getElementById('mobileMenuBackdrop');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.remove('translate-x-full');
    if (menuBackdrop) menuBackdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.add('translate-x-full');
    if (menuBackdrop) menuBackdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (menuBackdrop) menuBackdrop.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/**
 * 3. Acordeón de Preguntas Frecuentes (FAQ)
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const content = otherItem.querySelector('.faq-content');
        if (content) content.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        const content = item.querySelector('.faq-content');
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/**
 * 4. Pestañas de Audiencia (Profesionales, Mayores, Chalets, Comunidades)
 */
function initAudienceTabs() {
  const tabBtns = document.querySelectorAll('.audience-tab-btn');
  const tabContents = document.querySelectorAll('.audience-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.add('hidden'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.remove('hidden');
      }
    });
  });
}

/**
 * 4.b Pestañas de Categoría de Tarifas (Pisos y Chalets)
 */
function initPricingTabs() {
  const tabBtns = document.querySelectorAll('[data-pricing-target]');
  const containerPisos = document.getElementById('pricing-pisos');
  const containerChalets = document.getElementById('pricing-chalets');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-pricing-target');
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (containerPisos) containerPisos.classList.toggle('hidden', targetId !== 'pricing-pisos');
      if (containerChalets) containerChalets.classList.toggle('hidden', targetId !== 'pricing-chalets');
    });
  });
}

/**
 * 4.c Pestañas de Categoría en el Formulario de Reserva (Pisos, Chalets, Puntual)
 */
function switchFormCategory(categoryKey) {
  const catBtns = document.querySelectorAll('.form-category-tab');
  const groupPisos = document.getElementById('form-group-pisos');
  const groupChalets = document.getElementById('form-group-chalets');
  const groupPuntual = document.getElementById('form-group-puntual');

  catBtns.forEach(btn => {
    const isTarget = btn.getAttribute('data-form-category') === categoryKey;
    if (isTarget) {
      btn.className = 'form-category-tab font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all bg-[#E8F5EF] text-[#25815F] border border-[#25815F]/30';
    } else {
      btn.className = 'form-category-tab font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all text-gray-600 hover:text-gray-900 border border-transparent';
    }
  });

  if (groupPisos) groupPisos.classList.toggle('hidden', categoryKey !== 'pisos');
  if (groupChalets) groupChalets.classList.toggle('hidden', categoryKey !== 'chalets');
  if (groupPuntual) groupPuntual.classList.toggle('hidden', categoryKey !== 'puntual');

  const activeGroup = categoryKey === 'pisos' ? groupPisos : (categoryKey === 'chalets' ? groupChalets : groupPuntual);
  if (activeGroup) {
    const currentChecked = activeGroup.querySelector('input[type="radio"]:checked');
    if (!currentChecked) {
      const defaultRadio = activeGroup.querySelector('input[type="radio"]');
      if (defaultRadio) {
        defaultRadio.checked = true;
        updateOrderSummary(defaultRadio.value);
      }
    } else {
      updateOrderSummary(currentChecked.value);
    }
  }
}

function initFormCategoryTabs() {
  const catBtns = document.querySelectorAll('.form-category-tab');
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-form-category');
      switchFormCategory(cat);
    });
  });
}

/**
 * 5. Sincronización de selección de Planes con el Formulario
 */
function initPlanSelectors() {
  const selectPlanButtons = document.querySelectorAll('[data-select-plan]');
  const formPlanRadios = document.querySelectorAll('input[name="service_plan"]');

  selectPlanButtons.forEach(button => {
    button.addEventListener('click', () => {
      const planKey = button.getAttribute('data-select-plan');
      const planInfo = CONFIG.plans[planKey] || CONFIG.plans.piso_plus;

      if (planInfo.category) {
        switchFormCategory(planInfo.category);
      }

      const radio = document.querySelector(`input[name="service_plan"][value="${planKey}"]`);
      if (radio) {
        radio.checked = true;
      }

      updateOrderSummary(planKey);

      const formSection = document.getElementById('solicitar');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  formPlanRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        updateOrderSummary(radio.value);
      }
    });
  });
}

/**
 * 6. Actualizar las formas de pago permitidas según el plan
 */
function updatePaymentOptions(planKey) {
  const paymentSelect = document.getElementById('clientPayment');
  const paymentNotice = document.getElementById('paymentNotice');
  const summaryPayment = document.getElementById('summaryPaymentMethods');

  if (!paymentSelect) return;

  const currentVal = paymentSelect.value;

  if (planKey === 'puntual') {
    // Recogida puntual: Tarjeta o Efectivo en mano
    paymentSelect.innerHTML = `
      <option value="Tarjeta bancaria (Débito / Crédito)" ${currentVal.includes('Tarjeta') || !currentVal ? 'selected' : ''}>Tarjeta bancaria</option>
      <option value="Efectivo en mano (en la recogida)" ${currentVal.includes('Efectivo') ? 'selected' : ''}>Efectivo en mano</option>
    `;
    if (currentVal.includes('Domiciliación') || !currentVal) {
      paymentSelect.value = 'Tarjeta bancaria (Débito / Crédito)';
    }
    if (paymentNotice) {
      paymentNotice.innerHTML = `<i class="fa-solid fa-circle-info text-[#25815F]"></i> Para la <strong>recogida puntual</strong> el pago se realiza mediante <strong>Tarjeta o Efectivo en mano</strong> (la domiciliación bancaria no está disponible en servicios puntuales).`;
    }
    if (summaryPayment) {
      summaryPayment.textContent = 'Pago: Tarjeta o Efectivo';
    }
  } else {
    // Todos los planes mensuales (Pisos y Chalets): Domiciliación SEPA o Tarjeta
    paymentSelect.innerHTML = `
      <option value="Domiciliación bancaria (SEPA)" ${currentVal.includes('Domiciliación') || !currentVal ? 'selected' : ''}>Domiciliación bancaria (SEPA)</option>
      <option value="Tarjeta bancaria (Débito / Crédito)" ${currentVal.includes('Tarjeta') ? 'selected' : ''}>Tarjeta bancaria</option>
    `;
    if (currentVal.includes('Efectivo') || !currentVal) {
      paymentSelect.value = 'Domiciliación bancaria (SEPA)';
    }
    if (paymentNotice) {
      paymentNotice.innerHTML = `<i class="fa-solid fa-circle-info text-[#25815F]"></i> Para los <strong>planes mensuales</strong> el pago se realiza mediante <strong>Domiciliación bancaria o Tarjeta</strong> (el pago en efectivo <em>no</em> está admitido en planes mensuales).`;
    }
    if (summaryPayment) {
      summaryPayment.textContent = 'Pago: Domiciliación o Tarjeta';
    }
  }
}

/**
 * 7. Actualizar las opciones de frecuencia/días según el plan y la hora actual
 */
function updateDayOptions(planKey) {
  const daysSelect = document.getElementById('clientDays');
  const timeSlotSelect = document.getElementById('clientTimeSlot');
  const punctualNotice = document.getElementById('punctualTimeNotice');
  if (!daysSelect) return;

  const now = new Date();
  const currentDayIndex = now.getDay();
  const currentHour = now.getHours();
  const isPastEveningDeadline = currentHour >= 18;

  if (planKey === 'piso_2d' || planKey === 'chalet_2d') {
    // 2 días por semana: Fijo Martes y Jueves
    daysSelect.innerHTML = `
      <option value="2 Recogidas semanales: Martes y Jueves" selected>2 Recogidas semanales: Martes y Jueves</option>
    `;
    daysSelect.value = '2 Recogidas semanales: Martes y Jueves';
    if (timeSlotSelect) {
      for (let opt of timeSlotSelect.options) opt.disabled = false;
    }
    if (punctualNotice) punctualNotice.classList.add('hidden');

  } else if (planKey === 'piso_plus' || planKey === 'chalet_plus') {
    // 3 días por semana: Fijo Lunes, Miércoles y Viernes
    daysSelect.innerHTML = `
      <option value="3 Recogidas semanales: Lunes, Miércoles y Viernes" selected>3 Recogidas semanales: Lunes, Miércoles y Viernes</option>
    `;
    daysSelect.value = '3 Recogidas semanales: Lunes, Miércoles y Viernes';
    if (timeSlotSelect) {
      for (let opt of timeSlotSelect.options) opt.disabled = false;
    }
    if (punctualNotice) punctualNotice.classList.add('hidden');

  } else if (planKey === 'piso_premium' || planKey === 'chalet_premium') {
    // 5 días por semana: Fijo Lunes a Viernes completo
    daysSelect.innerHTML = `
      <option value="5 Recogidas semanales: Lunes a Viernes (L, M, X, J, V)" selected>5 Recogidas semanales: Lunes a Viernes</option>
    `;
    daysSelect.value = '5 Recogidas semanales: Lunes a Viernes (L, M, X, J, V)';
    if (timeSlotSelect) {
      for (let opt of timeSlotSelect.options) opt.disabled = false;
    }
    if (punctualNotice) punctualNotice.classList.add('hidden');

  } else if (planKey === 'puntual') {
    // Recogida puntual: 1 día a elegir de Lunes a Viernes con regla de 2 horas
    let optionsHtml = '';
    const weekdays = [
      { name: 'Lunes', index: 1 },
      { name: 'Martes', index: 2 },
      { name: 'Miércoles', index: 3 },
      { name: 'Jueves', index: 4 },
      { name: 'Viernes', index: 5 }
    ];

    let firstAvailableDay = '';

    weekdays.forEach(day => {
      const isToday = currentDayIndex === day.index;
      if (isToday) {
        if (isPastEveningDeadline) {
          optionsHtml += `<option value="${day.name} (Hoy)" disabled>${day.name} (Hoy - Cerrado tras las 18:00 h)</option>`;
        } else {
          if (!firstAvailableDay) firstAvailableDay = `${day.name} (Hoy)`;
          optionsHtml += `<option value="${day.name} (Hoy)" selected>${day.name} (Hoy)</option>`;
        }
      } else {
        if (!firstAvailableDay && !optionsHtml.includes('selected')) {
          firstAvailableDay = day.name;
          optionsHtml += `<option value="${day.name}" selected>${day.name}</option>`;
        } else {
          optionsHtml += `<option value="${day.name}">${day.name}</option>`;
        }
      }
    });

    daysSelect.innerHTML = optionsHtml;

    if (daysSelect.selectedOptions.length === 0 || daysSelect.selectedOptions[0].disabled) {
      for (let opt of daysSelect.options) {
        if (!opt.disabled) {
          opt.selected = true;
          break;
        }
      }
    }

    updatePunctualNoticeAndSlots();
  }
}

/**
 * Control del aviso dinámico y de las franjas horarias permitidas en recogida puntual
 */
function updatePunctualNoticeAndSlots() {
  const planRadio = document.querySelector('input[name="service_plan"]:checked');
  if (!planRadio || planRadio.value !== 'puntual') return;

  const daysSelect = document.getElementById('clientDays');
  const timeSlotSelect = document.getElementById('clientTimeSlot');
  const punctualNotice = document.getElementById('punctualTimeNotice');
  if (!daysSelect || !timeSlotSelect) return;

  const now = new Date();
  const currentHour = now.getHours();

  const isPastEveningDeadline = currentHour >= 18;
  const isPastMorningDeadline = currentHour >= 11;

  const selectedDayValue = daysSelect.value;
  const isTodaySelected = selectedDayValue.includes('Hoy');

  const morningOption = timeSlotSelect.querySelector('option[value*="Mañana"]');
  const afternoonOption = timeSlotSelect.querySelector('option[value*="Tarde"]');

  if (isTodaySelected) {
    if (isPastEveningDeadline) {
      if (morningOption) morningOption.disabled = true;
      if (afternoonOption) afternoonOption.disabled = true;
      if (punctualNotice) {
        punctualNotice.className = 'text-xs p-3 rounded-xl border bg-red-50 text-red-800 border-red-200 block mt-2';
        punctualNotice.innerHTML = `<i class="fa-solid fa-clock text-red-600 mr-1.5"></i> <strong>Hora tope superada para hoy:</strong> Las solicitudes para el mismo día deben realizarse antes de las <strong>11:00 h</strong> (para turno de mañana) o antes de las <strong>18:00 h</strong> (para turno de tarde), con 2 horas de antelación al fin del turno. Por favor selecciona otro día hábil.`;
      }
    } else if (isPastMorningDeadline) {
      if (morningOption) morningOption.disabled = true;
      if (afternoonOption) {
        afternoonOption.disabled = false;
        afternoonOption.selected = true;
      }
      if (punctualNotice) {
        punctualNotice.className = 'text-xs p-3 rounded-xl border bg-amber-50 text-amber-900 border-amber-200 block mt-2';
        punctualNotice.innerHTML = `<i class="fa-solid fa-circle-info text-amber-600 mr-1.5"></i> Para recogida <strong>hoy</strong>, el Turno de Mañana ha finalizado su periodo de solicitud (hora tope: <strong>11:00 h</strong>, 2h antes de las 13:00 h). Solo está disponible el <strong>Turno de Tarde (16:00 - 20:00 h)</strong> con solicitudes abiertas hasta las <strong>18:00 h</strong> (2h antes de las 20:00 h).`;
      }
    } else {
      if (morningOption) morningOption.disabled = false;
      if (afternoonOption) afternoonOption.disabled = false;
      if (punctualNotice) {
        punctualNotice.className = 'text-xs p-3 rounded-xl border bg-emerald-50 text-emerald-900 border-emerald-200 block mt-2';
        punctualNotice.innerHTML = `<i class="fa-solid fa-clock text-emerald-600 mr-1.5"></i> Solicitud para <strong>hoy</strong> disponible: Turno de Mañana (hora tope: <strong>11:00 h</strong>, 2h antes de las 13:00 h) y Turno de Tarde (hora tope: <strong>18:00 h</strong>, 2h antes de las 20:00 h).`;
      }
    }
  } else {
    // Si es otro día distinto de hoy, todas las franjas están abiertas
    if (morningOption) morningOption.disabled = false;
    if (afternoonOption) afternoonOption.disabled = false;
    if (punctualNotice) {
      punctualNotice.className = 'text-xs p-3 rounded-xl border bg-gray-50 text-gray-700 border-gray-200 block mt-2';
      punctualNotice.innerHTML = `<i class="fa-solid fa-circle-info text-[#25815F] mr-1.5"></i> <strong>Aviso de horario en recogida puntual:</strong> Si deseas recogida para el mismo día, la hora tope de solicitud es hasta las <strong>11:00 h</strong> (Turno Mañana) o hasta las <strong>18:00 h</strong> (Turno Tarde), con un mínimo de 2 horas de antelación al fin del turno.`;
    }
  }
}

/**
 * Obtener información de la fecha de inicio del servicio según el día del mes
 * Regla de negocio: Si se solicita del 1 al 5 del mes, comienza en el mes actual.
 * Si se solicita a partir del día 6 (día > 5), el servicio comenzará el día 1 del mes siguiente
 * debido a la organización y asignación logística de rutas.
 */
function getServiceStartDateInfo(planKey) {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const currentMonthIndex = now.getMonth();
  const currentMonthName = months[currentMonthIndex];
  
  const nextMonthIndex = (currentMonthIndex + 1) % 12;
  const nextMonthName = months[nextMonthIndex];

  if (planKey === 'puntual') {
    return {
      isPunctual: true,
      startDateText: 'Día seleccionado en solicitud',
      badgeText: 'Servicio Inmediato',
      modalText: 'Para el día laborable indicado en tu solicitud',
      modalSubtext: 'Nos pondremos en contacto contigo para coordinar la recogida.',
      noticeHtml: ''
    };
  }

  if (dayOfMonth <= 5) {
    return {
      isPunctual: false,
      isCurrentMonth: true,
      dayOfMonth,
      currentMonthName,
      nextMonthName,
      startDateText: 'Este mismo mes',
      badgeText: 'Inicio: Este mismo mes',
      modalText: 'Este mismo mes',
      modalSubtext: 'Alta tramitada entre el día 1 y el día 5.',
      noticeHtml: `
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs">
          <i class="fa-solid fa-calendar-check text-emerald-600 mt-0.5 flex-shrink-0 text-sm"></i>
          <div>
            <strong>Fecha de inicio del servicio:</strong> Al tramitar tu alta entre el día 1 y el día 5, tu suscripción mensual dará comienzo este mismo mes.
          </div>
        </div>
      `
    };
  } else {
    return {
      isPunctual: false,
      isCurrentMonth: false,
      dayOfMonth,
      currentMonthName,
      nextMonthName,
      startDateText: `1 de ${nextMonthName}`,
      badgeText: `Inicio: 1 de ${nextMonthName}`,
      modalText: `1 de ${nextMonthName}`,
      modalSubtext: `Alta solicitada a partir del día 6 de ${currentMonthName} (inicio el 1 de ${nextMonthName} por organización de rutas).`,
      noticeHtml: `
        <div class="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs">
          <i class="fa-solid fa-calendar-days text-amber-600 mt-0.5 flex-shrink-0 text-sm"></i>
          <div>
            <strong>Fecha de inicio del servicio:</strong> Al solicitar el alta a partir del día 6 de ${currentMonthName}, tu servicio comenzará a partir del <strong>1 de ${nextMonthName}</strong> (para la correcta organización y asignación de rutas). <em>Si necesitas recogidas antes de esa fecha, puedes solicitar nuestro servicio de Recogida Puntual (4,90€).</em>
          </div>
        </div>
      `
    };
  }
}

/**
 * 8. Actualizar el resumen del pedido en vivo
 */
function updateOrderSummary(planKey) {
  const planInfo = CONFIG.plans[planKey] || CONFIG.plans.piso_plus;
  const summaryName = document.getElementById('summaryPlanName');
  const summaryPrice = document.getElementById('summaryPlanPrice');
  const summaryCost = document.getElementById('summaryCostPerBag');
  const summaryDetails = document.getElementById('summaryPlanDetails');
  const summaryFreq = document.getElementById('summaryFrequency');
  const summaryStartDate = document.getElementById('summaryStartDate');
  const startDateNoticeContainer = document.getElementById('serviceStartDateNotice');

  if (summaryName) {
    summaryName.textContent = planInfo.name;
  }

  if (summaryPrice) {
    summaryPrice.innerHTML = `${planInfo.price} <span class="text-sm font-normal text-gray-500">${planInfo.period}</span>`;
  }

  if (summaryCost) {
    summaryCost.innerHTML = `<i class="fa-solid fa-tag"></i> ${planInfo.costPerBag}`;
  }

  if (summaryDetails) summaryDetails.textContent = planInfo.details;
  if (summaryFreq) summaryFreq.textContent = planInfo.frequency;

  const dateInfo = getServiceStartDateInfo(planKey);
  if (summaryStartDate) {
    summaryStartDate.textContent = `Inicio: ${dateInfo.startDateText}`;
  }
  if (startDateNoticeContainer) {
    startDateNoticeContainer.innerHTML = dateInfo.noticeHtml;
  }

  updatePaymentOptions(planKey);
  updateDayOptions(planKey);
}

/**
 * 9. Formulario de Reserva, Envío de Solicitud y Autocompletado
 */
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  const submitModal = document.getElementById('confirmationModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const paymentSelect = document.getElementById('clientPayment');
  const daysSelect = document.getElementById('clientDays');
  const timeSlotSelect = document.getElementById('clientTimeSlot');
  const phoneInput = document.getElementById('clientPhone');
  const emailInput = document.getElementById('clientEmail');
  const emailDatalist = document.getElementById('savedEmailsList');

  if (!form) return;

  // Inicializar opciones de pago y días acordes al plan seleccionado por defecto
  const initialPlanRadio = document.querySelector('input[name="service_plan"]:checked');
  const initialPlan = initialPlanRadio ? initialPlanRadio.value : 'piso_plus';
  updateOrderSummary(initialPlan);

  // Escuchar cambios en el selector de días para actualizar avisos de antelación
  if (daysSelect) {
    daysSelect.addEventListener('change', () => {
      updatePunctualNoticeAndSlots();
    });
  }

  // Autocompletado del correo electrónico guardado previamente
  const savedEmail = localStorage.getItem('telatiro_saved_email');
  if (savedEmail) {
    if (emailDatalist) {
      emailDatalist.innerHTML = `<option value="${savedEmail}">`;
    }
  }

  // Guardar correo electrónico si el usuario lo introduce o cambia
  if (emailInput) {
    emailInput.addEventListener('change', () => {
      const emailVal = emailInput.value.trim();
      if (emailVal && emailVal.includes('@')) {
        localStorage.setItem('telatiro_saved_email', emailVal);
        if (emailDatalist) {
          emailDatalist.innerHTML = `<option value="${emailVal}">`;
        }
      }
    });
  }

  // Restricción estricta de exactamente 9 dígitos numéricos en el teléfono/WhatsApp
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '').slice(0, 9);
    });

    phoneInput.addEventListener('keydown', (e) => {
      const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'];
      if (allowedKeys.includes(e.key) || (e.ctrlKey || e.metaKey)) {
        return;
      }
      // Bloquear teclas no numéricas
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        return;
      }
      // Bloquear más de 9 dígitos si no hay texto seleccionado para reemplazar
      const selectedLength = (phoneInput.selectionEnd - phoneInput.selectionStart);
      if (phoneInput.value.length >= 9 && selectedLength === 0) {
        e.preventDefault();
      }
    });

    phoneInput.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteText = (e.clipboardData || window.clipboardData).getData('text');
      const cleanDigits = pasteText.replace(/[^0-9]/g, '');
      const start = phoneInput.selectionStart;
      const end = phoneInput.selectionEnd;
      const currentValue = phoneInput.value;
      const combined = (currentValue.slice(0, start) + cleanDigits + currentValue.slice(end)).slice(0, 9);
      phoneInput.value = combined;
      const newPos = Math.min(start + cleanDigits.length, 9);
      phoneInput.setSelectionRange(newPos, newPos);
    });
  }

  // Envío del formulario
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const zipSelect = document.getElementById('clientZip');
    const addressInput = document.getElementById('clientAddress');

    const formData = getFormData();

    if (!formData.name) {
      showToast('⚠️ Por favor indica tu nombre y apellidos.', 'warning');
      document.getElementById('clientName')?.focus();
      return;
    }

    if (!formData.phone) {
      showToast('⚠️ Por favor indica tu número de teléfono de contacto.', 'warning');
      if (phoneInput) phoneInput.focus();
      return;
    }

    // Validación estricta de selección de código postal obligatorio
    if (!formData.zip || formData.zip.trim() === '') {
      showToast('⚠️ Por favor selecciona tu Código Postal / Sector de Rivas obligatorio.', 'warning');
      if (zipSelect) {
        zipSelect.focus();
        zipSelect.classList.add('border-red-500', 'ring-2', 'ring-red-200');
        setTimeout(() => zipSelect.classList.remove('border-red-500', 'ring-2', 'ring-red-200'), 3000);
      }
      return;
    }

    if (!formData.rawAddress || formData.rawAddress.trim() === '') {
      showToast('⚠️ Por favor indica tu calle, número, piso y puerta en Rivas.', 'warning');
      if (addressInput) addressInput.focus();
      return;
    }

    // Validación estricta de longitud del teléfono (exactamente 9 dígitos)
    if (formData.phone.length !== 9) {
      showToast('⚠️ El número de teléfono debe tener exactamente 9 dígitos.', 'warning');
      if (phoneInput) {
        phoneInput.focus();
        phoneInput.classList.add('border-red-400');
        setTimeout(() => phoneInput.classList.remove('border-red-400'), 2500);
      }
      return;
    }

    // Validación de horario límite para recogida puntual en el mismo día
    if (formData.plan === 'puntual') {
      const now = new Date();
      const currentHour = now.getHours();
      const isPastEveningDeadline = currentHour >= 18;
      const isPastMorningDeadline = currentHour >= 11;
      const isTodaySelected = formData.days.includes('Hoy');

      if (isTodaySelected && isPastEveningDeadline) {
        showToast('⚠️ Para recogidas el mismo día, la solicitud debe realizarse como máximo a las 18:00 h (2h antes de las 20:00 h). Por favor selecciona otro día.', 'warning');
        updateDayOptions('puntual');
        return;
      }

      if (isTodaySelected && formData.timeSlot.includes('Mañana') && isPastMorningDeadline) {
        showToast('⚠️ El turno de mañana para hoy ya no está disponible (límite 11:00 h). Por favor selecciona el Turno de Tarde (hasta las 18:00 h) u otro día.', 'warning');
        updateDayOptions('puntual');
        return;
      }
    }

    // Guardar correo en localStorage para autocompletar en futuras visitas
    if (formData.email && formData.email.includes('@')) {
      localStorage.setItem('telatiro_saved_email', formData.email);
      if (emailDatalist) {
        emailDatalist.innerHTML = `<option value="${formData.email}">`;
      }
    }

    // Validar exclusiones de pago según el plan
    if (formData.plan !== 'puntual' && formData.paymentMethod.toLowerCase().includes('efectivo')) {
      showToast('⚠️ Los planes mensuales no admiten pago en efectivo. Por favor selecciona Domiciliación bancaria o Tarjeta.', 'warning');
      updatePaymentOptions(formData.plan);
      return;
    }

    if (formData.plan === 'puntual' && formData.paymentMethod.toLowerCase().includes('domiciliación')) {
      showToast('⚠️ La recogida puntual solo admite Tarjeta o Efectivo. Por favor selecciona una de estas opciones.', 'warning');
      updatePaymentOptions('puntual');
      return;
    }

    const modalPlan = document.getElementById('modalPlanSelected');
    const modalClient = document.getElementById('modalClientName');
    const modalStartDate = document.getElementById('modalStartDateText');
    const dateInfo = getServiceStartDateInfo(formData.plan);

    const basePlanName = CONFIG.plans[formData.plan]?.name || 'Plan Seleccionado';
    if (modalPlan) modalPlan.textContent = basePlanName;
    if (modalClient) modalClient.textContent = formData.name;
    if (modalStartDate) modalStartDate.textContent = dateInfo.modalText;

    // Sincronización automática con Google Sheets y Gmail si el Webhook está configurado
    if (CONFIG.googleSheetWebhookUrl) {
      fetch(CONFIG.googleSheetWebhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(formData)
      }).catch(err => {
        console.warn('Sincronización con Google Sheets en segundo plano:', err);
      });
    }

    if (submitModal) {
      submitModal.classList.remove('hidden');
    } else {
      showToast('✅ ¡Solicitud enviada con éxito! Nos pondremos en contacto contigo.');
    }

    form.reset();
    switchFormCategory('pisos');
    updateOrderSummary('piso_plus');

    // Restaurar sugerencia de email guardado si existe
    if (savedEmail && emailDatalist) {
      emailDatalist.innerHTML = `<option value="${savedEmail}">`;
    }
  });

  if (closeModalBtn && submitModal) {
    closeModalBtn.addEventListener('click', () => {
      submitModal.classList.add('hidden');
    });
  }
}

function getFormData() {
  const selectedPlan = document.querySelector('input[name="service_plan"]:checked')?.value || 'piso_plus';
  const planName = CONFIG.plans[selectedPlan]?.name || selectedPlan;
  const dateInfo = getServiceStartDateInfo(selectedPlan);
  const startDate = dateInfo?.startDateText || '';
  const name = document.getElementById('clientName')?.value.trim() || '';
  const phone = document.getElementById('clientPhone')?.value.trim() || '';
  const email = document.getElementById('clientEmail')?.value.trim() || '';
  const rawAddress = document.getElementById('clientAddress')?.value.trim() || '';
  const zip = document.getElementById('clientZip')?.value || '';
  
  // Extraer el código postal de 5 dígitos para geolocalización exacta en Google Maps
  const cpDigits = zip.match(/\b2852[1-5]\b/)?.[0] || '28523';
  
  // Si la dirección no contiene ya 'Rivas', le adjuntamos el CP y localidad para que Google Maps nunca la confunda con Madrid capital
  let address = rawAddress;
  if (address && !address.toLowerCase().includes('rivas')) {
    address = `${address}, ${cpDigits} Rivas-Vaciamadrid`;
  }

  const timeSlot = document.getElementById('clientTimeSlot')?.value || 'Turno Mañana (09:00 - 13:00 h)';
  const days = document.getElementById('clientDays')?.value || '3 Recogidas semanales: Lunes, Miércoles y Viernes';
  const paymentMethod = document.getElementById('clientPayment')?.value || 'Domiciliación bancaria (SEPA)';
  const referral = document.getElementById('clientReferral')?.value.trim() || '';
  const notes = document.getElementById('clientNotes')?.value.trim() || '';

  return { plan: selectedPlan, planName, startDate, name, phone, email, rawAddress, address, zip, timeSlot, days, paymentMethod, referral, notes };
}

/**
 * 8. Comprobador de Cobertura Específico para Rivas-Vaciamadrid
 */
function initCoverageChecker() {
  const checkBtn = document.getElementById('checkCoverageBtn');
  const zipInput = document.getElementById('coverageZipInput');
  const resultDiv = document.getElementById('coverageResult');
  const zoneCards = document.querySelectorAll('.zone-card');

  // Interacción al hacer clic en las tarjetas de zona
  zoneCards.forEach(card => {
    card.addEventListener('click', () => {
      const cp = card.getAttribute('data-cp');
      if (zipInput && cp) {
        zipInput.value = cp;
        verifyCoverage(cp);
      }
    });
  });

  if (!checkBtn || !zipInput || !resultDiv) return;

  checkBtn.addEventListener('click', () => {
    const inputVal = zipInput.value.trim();
    if (!inputVal || inputVal.length < 2) {
      showCoverageResult('Por favor introduce tu código postal o barrio de Rivas-Vaciamadrid (ej. 28521, 28522, 28523, Covibar, Pablo Iglesias...)', 'warning');
      return;
    }
    verifyCoverage(inputVal);
  });

  zipInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkBtn.click();
    }
  });

  function verifyCoverage(inputVal) {
    const cleanInput = inputVal.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    showCoverageResult('⏳ Verificando rutas activas en Rivas-Vaciamadrid...', 'loading');

    setTimeout(() => {
      let matchedSector = null;

      for (const key in CONFIG.sectors) {
        const sector = CONFIG.sectors[key];
        const match = sector.keywords.some(kw => cleanInput.includes(kw));
        if (match) {
          matchedSector = sector;
          break;
        }
      }

      // Comprobación si escribe simplemente Rivas o Vaciamadrid
      if (!matchedSector && (cleanInput.includes('rivas') || cleanInput.includes('vaciamadrid'))) {
        matchedSector = {
          cp: '28521 - 28525 (Rivas-Vaciamadrid)',
          name: 'Municipio de Rivas-Vaciamadrid',
          description: 'Casco Antiguo, Rivas Futura, Covibar, Almendros, Pablo Iglesias y Nuevos Desarrollos.'
        };
      }

      if (matchedSector) {
        showCoverageResult(`🎉 ¡Ruta Activa! Tu zona <strong>CP ${matchedSector.cp} (${matchedSector.name})</strong>: <em>${matchedSector.description}</em> dispone de servicio diario en turnos de Mañana (09:00 - 13:00h) y Tarde (16:00 - 20:00h). Puedes completar tu solicitud a continuación.`, 'success');
        
        // Auto-seleccionar en el desplegable del formulario si coincide
        const formSelect = document.getElementById('clientZip');
        if (formSelect) {
          Array.from(formSelect.options).forEach(opt => {
            if (opt.value.includes(matchedSector.cp.substring(0, 5))) {
              formSelect.value = opt.value;
            }
          });
        }
      } else {
        showCoverageResult(`📍 De momento el servicio solo está disponible para <strong>Rivas-Vaciamadrid</strong> (CP 28521, 28522, 28523, 28524 y 28525). Estamos trabajando para abrir nuevas rutas próximamente.`, 'warning');
      }
    }, 400);
  }
}

function showCoverageResult(message, type) {
  const resultDiv = document.getElementById('coverageResult');
  if (!resultDiv) return;

  resultDiv.className = 'mt-4 p-4 rounded-xl text-sm transition-all duration-300 text-left ';
  
  if (type === 'success') {
    resultDiv.className += 'bg-green-50 text-green-900 border border-green-200';
    resultDiv.innerHTML = `<div class="flex items-start gap-2.5"><i class="fa-solid fa-circle-check text-green-600 text-lg mt-0.5 flex-shrink-0"></i> <div>${message}</div></div>`;
  } else if (type === 'warning') {
    resultDiv.className += 'bg-amber-50 text-amber-900 border border-amber-200';
    resultDiv.innerHTML = `<div class="flex items-start gap-2.5"><i class="fa-solid fa-triangle-exclamation text-amber-600 text-lg mt-0.5 flex-shrink-0"></i> <div>${message}</div></div>`;
  } else {
    resultDiv.className += 'bg-gray-50 text-gray-700 border border-gray-200';
    resultDiv.innerHTML = `<div class="flex items-center gap-2"><i class="fa-solid fa-spinner fa-spin text-green-600"></i> <span>${message}</span></div>`;
  }
}

/**
 * 9. Notificación flotante (Toast)
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * 10. Alternador de Fotos del Hero (Entrega vs Felpudo)
 */
function initHeroPhotoSwitcher() {
  const photoBtns = document.querySelectorAll('.photo-tab-btn');
  const photoViews = document.querySelectorAll('.hero-photo-view');

  if (!photoBtns.length || !photoViews.length) return;

  photoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-photo-target');

      photoBtns.forEach(b => b.classList.remove('active'));
      photoViews.forEach(v => v.classList.add('hidden'));

      btn.classList.add('active');
      const targetView = document.getElementById(targetId);
      if (targetView) {
        targetView.classList.remove('hidden');
      }
    });
  });
}

/**
 * 11. Gestión del Formulario de Candidatura para Recogedores y Empresas (Trabaja con Nosotros)
 */
function initRecruiterForm() {
  const form = document.getElementById('recruiterForm');
  if (!form) return;

  const phoneInput = document.getElementById('recruiterPhone');
  const btnSubmit = document.getElementById('btnSubmitRecruiter');
  const btnText = document.getElementById('btnRecruiterText');
  const successAlert = document.getElementById('recruiterSuccessAlert');
  const errorAlert = document.getElementById('recruiterErrorAlert');

  // Validación de teléfono (solo números, máx 9 dígitos)
  if (phoneInput) {
    phoneInput.addEventListener('keydown', (e) => {
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
      if (allowedKeys.includes(e.key) || (e.ctrlKey || e.metaKey)) return;
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        return;
      }
      const selectedLength = (phoneInput.selectionEnd - phoneInput.selectionStart);
      if (phoneInput.value.length >= 9 && selectedLength === 0) {
        e.preventDefault();
      }
    });

    phoneInput.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteText = (e.clipboardData || window.clipboardData).getData('text');
      const cleanDigits = pasteText.replace(/[^0-9]/g, '');
      const start = phoneInput.selectionStart;
      const end = phoneInput.selectionEnd;
      const currentValue = phoneInput.value;
      const combined = (currentValue.slice(0, start) + cleanDigits + currentValue.slice(end)).slice(0, 9);
      phoneInput.value = combined;
      const newPos = Math.min(start + cleanDigits.length, 9);
      phoneInput.setSelectionRange(newPos, newPos);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (successAlert) successAlert.classList.add('hidden');
    if (errorAlert) errorAlert.classList.add('hidden');

    const name = document.getElementById('recruiterName')?.value?.trim();
    const profileType = document.getElementById('recruiterProfileType')?.value || 'Autónomo';
    const phone = phoneInput?.value?.trim();
    const email = document.getElementById('recruiterEmail')?.value?.trim();
    const zone = document.getElementById('recruiterZone')?.value?.trim();
    const availability = document.getElementById('recruiterAvailability')?.value || '';
    const vehicle = document.getElementById('recruiterVehicle')?.value || '';
    const notes = document.getElementById('recruiterNotes')?.value?.trim() || '';
    const privacy = document.getElementById('recruiterPrivacy')?.checked;

    if (!name) {
      showToast('⚠️ Por favor indica tu nombre y apellidos o razón social.', 'warning');
      document.getElementById('recruiterName')?.focus();
      return;
    }

    if (!phone || phone.length !== 9) {
      showToast('⚠️ Por favor introduce un teléfono de 9 dígitos válido.', 'warning');
      if (phoneInput) phoneInput.focus();
      return;
    }

    if (!email || !email.includes('@')) {
      showToast('⚠️ Por favor introduce un correo electrónico válido.', 'warning');
      document.getElementById('recruiterEmail')?.focus();
      return;
    }

    if (!zone) {
      showToast('⚠️ Por favor indica tu zona o municipio de preferencia.', 'warning');
      document.getElementById('recruiterZone')?.focus();
      return;
    }

    if (!privacy) {
      showToast('⚠️ Debes aceptar la política de privacidad para enviar tu candidatura.', 'warning');
      return;
    }

    // Estado visual de carga
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.classList.add('opacity-80', 'cursor-not-allowed');
    }
    if (btnText) {
      btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Enviando candidatura...';
    }

    const payload = {
      formType: 'recogedor',
      name: name,
      profileType: profileType,
      phone: phone,
      email: email,
      zone: zone,
      availability: availability,
      vehicle: vehicle,
      notes: notes,
      timestamp: new Date().toISOString()
    };

    if (CONFIG.googleSheetWebhookUrl) {
      fetch(CONFIG.googleSheetWebhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      })
      .then(() => {
        handleSuccess();
      })
      .catch((err) => {
        console.warn('Error en webhook de candidatura:', err);
        handleSuccess();
      });
    } else {
      setTimeout(handleSuccess, 600);
    }

    function handleSuccess() {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.classList.remove('opacity-80', 'cursor-not-allowed');
      }
      if (btnText) {
        btnText.innerHTML = '<i class="fa-solid fa-paper-plane mr-2"></i> Enviar Solicitud de Colaborador';
      }
      if (successAlert) {
        successAlert.classList.remove('hidden');
        successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      showToast('🎉 ¡Candidatura enviada correctamente!', 'success');
      form.reset();
    }
  });
}

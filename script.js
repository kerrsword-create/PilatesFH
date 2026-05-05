/* Pilates Fountain Hills — Site script
   - Mobile nav toggle
   - Interactive booking calendar
   - Time-slot generation by day-of-week
   - Booking confirmation flow
*/

(() => {
  'use strict';

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  const navEl = document.getElementById('nav');
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  toggle.addEventListener('click', () => {
    const open = navEl.classList.toggle('is-open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    mobileMenu.hidden = !open;
  });

  mobileMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      navEl.classList.remove('is-open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      mobileMenu.hidden = true;
    })
  );

  /* ---------- Booking calendar ---------- */
  const grid = document.getElementById('cal-grid');
  const title = document.getElementById('cal-title');
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  const selectedDateEl = document.getElementById('selected-date');
  const slotsEl = document.getElementById('time-slots');
  const form = document.getElementById('booking-form');
  const confirm = document.getElementById('booking-confirm');
  const confirmText = document.getElementById('confirm-text');
  const confirmReset = document.getElementById('confirm-reset');

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDate = null;
  let selectedSlot = null;

  /* Class lineups by weekday (0 = Sun) */
  const SCHEDULE = {
    1: [
      { t: '6:00 AM', c: 'Power Reformer' },
      { t: '7:15 AM', c: 'Foundations' },
      { t: '8:30 AM', c: 'Sculpt & Flow' },
      { t: '9:45 AM', c: 'Cardio Reformer' },
      { t: '12:00 PM', c: 'Foundations' },
      { t: '4:30 PM', c: 'Sculpt & Flow' },
      { t: '5:45 PM', c: 'Power Reformer' },
      { t: '7:00 PM', c: 'Stretch & Restore' }
    ],
    2: [
      { t: '6:00 AM', c: 'Sculpt & Flow' },
      { t: '7:15 AM', c: 'Foundations' },
      { t: '8:30 AM', c: 'Power Reformer' },
      { t: '9:45 AM', c: 'Cardio Reformer' },
      { t: '12:00 PM', c: 'Foundations' },
      { t: '4:30 PM', c: 'Power Reformer' },
      { t: '5:45 PM', c: 'Sculpt & Flow' },
      { t: '7:00 PM', c: 'Stretch & Restore' }
    ],
    3: [
      { t: '6:00 AM', c: 'Power Reformer' },
      { t: '7:15 AM', c: 'Foundations' },
      { t: '8:30 AM', c: 'Sculpt & Flow' },
      { t: '9:45 AM', c: 'Cardio Reformer' },
      { t: '12:00 PM', c: 'Foundations' },
      { t: '4:30 PM', c: 'Sculpt & Flow' },
      { t: '5:45 PM', c: 'Power Reformer' },
      { t: '7:00 PM', c: 'Stretch & Restore' }
    ],
    4: [
      { t: '6:00 AM', c: 'Sculpt & Flow' },
      { t: '7:15 AM', c: 'Foundations' },
      { t: '8:30 AM', c: 'Power Reformer' },
      { t: '9:45 AM', c: 'Cardio Reformer' },
      { t: '12:00 PM', c: 'Foundations' },
      { t: '4:30 PM', c: 'Power Reformer' },
      { t: '5:45 PM', c: 'Sculpt & Flow' },
      { t: '7:00 PM', c: 'Stretch & Restore' }
    ],
    5: [
      { t: '6:00 AM', c: 'Power Reformer' },
      { t: '7:15 AM', c: 'Foundations' },
      { t: '8:30 AM', c: 'Sculpt & Flow' },
      { t: '9:45 AM', c: 'Cardio Reformer' },
      { t: '12:00 PM', c: 'Foundations' },
      { t: '4:30 PM', c: 'Sculpt & Flow' },
      { t: '5:45 PM', c: 'Power Reformer' },
      { t: '7:00 PM', c: 'Stretch & Restore' }
    ],
    6: [
      { t: '7:15 AM', c: 'Sculpt & Flow' },
      { t: '8:30 AM', c: 'Power Reformer' },
      { t: '9:45 AM', c: 'Stretch & Restore' },
      { t: '11:00 AM', c: 'Foundations' },
      { t: '12:15 PM', c: 'Sculpt & Flow' },
      { t: '1:30 PM', c: 'Cardio Reformer' }
    ],
    0: [
      { t: '7:15 AM', c: 'Sculpt & Flow' },
      { t: '8:30 AM', c: 'Foundations' },
      { t: '9:45 AM', c: 'Stretch & Restore' },
      { t: '11:00 AM', c: 'Sculpt & Flow' }
    ]
  };

  function dayKey(d) {
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }
  function seededFraction(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
  function classesForDay(d) { return SCHEDULE[d.getDay()] || []; }
  function spotsRemaining(d, slotIdx) {
    const seed = dayKey(d) + slotIdx * 17;
    const r = seededFraction(seed);
    return Math.floor(r * 16);
  }
  function dayStatus(d) {
    const classes = classesForDay(d);
    if (classes.length === 0) return 'none';
    let openSlots = 0;
    classes.forEach((_, i) => { if (spotsRemaining(d, i) > 0) openSlots++; });
    if (openSlots === 0) return 'full';
    if (openSlots <= Math.max(1, Math.floor(classes.length * 0.4))) return 'limited';
    return 'avail';
  }

  function sameDate(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  function renderCalendar() {
    grid.innerHTML = '';
    title.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startDay = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < startDay; i++) {
      const empty = document.createElement('span');
      empty.className = 'empty';
      grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewYear, viewMonth, day);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = day;

      const past = date < today;
      const status = dayStatus(date);

      if (past || status === 'none' || status === 'full') {
        btn.disabled = true;
      }
      if (!past && status !== 'none') {
        btn.classList.add(status);
        const dot = document.createElement('span');
        dot.className = 'status';
        btn.appendChild(dot);
      }
      if (sameDate(date, today)) btn.classList.add('is-today');
      if (selectedDate && sameDate(date, selectedDate)) btn.classList.add('is-selected');

      btn.addEventListener('click', () => selectDate(date));
      grid.appendChild(btn);
    }

    const atCurrentMonth = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
    prevBtn.disabled = atCurrentMonth;
    prevBtn.style.opacity = atCurrentMonth ? 0.35 : 1;
  }

  function selectDate(date) {
    selectedDate = date;
    selectedSlot = null;
    selectedDateEl.textContent = date.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
    renderCalendar();
    renderSlots();
  }

  function renderSlots() {
    slotsEl.innerHTML = '';
    if (!selectedDate) {
      slotsEl.innerHTML = '<p class="muted">Choose a date to see today\'s class times.</p>';
      return;
    }
    const classes = classesForDay(selectedDate);
    if (classes.length === 0) {
      slotsEl.innerHTML = '<p class="muted">No classes scheduled this day.</p>';
      return;
    }
    classes.forEach((cls, idx) => {
      const remaining = spotsRemaining(selectedDate, idx);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot';
      btn.innerHTML = `<span>${cls.t}</span> <small>${cls.c} · ${remaining > 0 ? remaining + ' open' : 'full'}</small>`;
      if (remaining === 0) btn.disabled = true;
      btn.addEventListener('click', () => {
        slotsEl.querySelectorAll('.time-slot').forEach(s => s.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        selectedSlot = { time: cls.t, classType: cls.c, remaining };
      });
      slotsEl.appendChild(btn);
    });
  }

  prevBtn.addEventListener('click', () => {
    if (prevBtn.disabled) return;
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  nextBtn.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  /* ---------- Form submission ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!selectedDate) {
      slotsEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      flash(selectedDateEl.parentElement, 'Please pick a date first.');
      return;
    }
    if (!selectedSlot) {
      flash(slotsEl, 'Please pick a time slot.');
      return;
    }
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = new FormData(form);
    const name = (data.get('name') || '').toString().split(' ')[0] || 'there';
    const dateStr = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    });

    confirmText.textContent =
      `Thanks, ${name}. We've reserved ${selectedSlot.classType} on ${dateStr} at ${selectedSlot.time}. ` +
      `A confirmation is on its way to ${data.get('email')}.`;
    form.hidden = true;
    confirm.hidden = false;
    confirm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  confirmReset.addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    confirm.hidden = true;
    selectedSlot = null;
    renderSlots();
    document.getElementById('book').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function flash(el, message) {
    const note = document.createElement('p');
    note.textContent = message;
    note.style.cssText = 'color: var(--terracotta); font-size: 0.85rem; margin-top: 8px;';
    const existing = el.parentElement.querySelector('.flash');
    if (existing) existing.remove();
    note.classList.add('flash');
    el.parentElement.appendChild(note);
    setTimeout(() => note.remove(), 3500);
  }

  /* ---------- Init ---------- */
  renderCalendar();
})();

// ============================================================
// GRECIA'S GRIMOIRE - LÓGICA INTERACTIVA JAVASCRIPT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTabs();
  initDiary();
  initPomodoro();
});

/* ============================================================
   1. GESTOR DE TEMA (VAMPIRO OSCURO VS HADA PASTEL)
   ============================================================ */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');
  const html = document.documentElement;

  // Recuperar tema guardado (por defecto: dark)
  const savedTheme = localStorage.getItem('grimoire_theme') || 'dark';
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('grimoire_theme', newTheme);
  });

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      themeIcon.textContent = '🎀';
      themeLabel.textContent = 'Modo Pastel';
    } else {
      themeIcon.textContent = '🦇';
      themeLabel.textContent = 'Modo Vampiresa';
    }
  }
}

/* ============================================================
   2. PESTAÑAS (TABS: DIARIO VS POMODORO)
   ============================================================ */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Quitar clase activa de todos
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Activar el seleccionado
      btn.classList.add('active');
      const targetTabId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetTabId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

/* ============================================================
   3. GRIMORIO / DIARIO PRIVADO (LOCALSTORAGE)
   ============================================================ */
function initDiary() {
  const diaryInput = document.getElementById('diaryInput');
  const diaryMood = document.getElementById('diaryMood');
  const saveNoteBtn = document.getElementById('saveNoteBtn');
  const diaryFeed = document.getElementById('diaryFeed');

  // Cargar notas al iniciar
  let notes = JSON.parse(localStorage.getItem('grimoire_notes') || '[]');
  renderNotes();

  // Guardar nueva nota
  saveNoteBtn.addEventListener('click', () => {
    const text = diaryInput.value.trim();
    if (!text) {
      showToast('✦ Escribe al menos un pensamiento antes de encantar 🕯️');
      diaryInput.focus();
      return;
    }

    const newNote = {
      id: Date.now(),
      text: text,
      mood: diaryMood.value,
      date: formatGothicDate(new Date())
    };

    // Agregar al inicio del arreglo
    notes.unshift(newNote);
    saveAndRender();

    // Limpiar entrada
    diaryInput.value = '';
    showToast('✦ Memoria encantada y guardada en tu grimorio ✨');
  });

  function saveAndRender() {
    localStorage.setItem('grimoire_notes', JSON.stringify(notes));
    renderNotes();
  }

  function renderNotes() {
    diaryFeed.innerHTML = '';

    if (notes.length === 0) {
      diaryFeed.innerHTML = `
        <div class="empty-state">
          <p>✦ Tu grimorio aún está en blanco ✦</p>
          <span style="font-size: 0.82rem; opacity: 0.7;">Escribe tu primer secreto o conjuro arriba.</span>
        </div>
      `;
      return;
    }

    notes.forEach(note => {
      const card = document.createElement('div');
      card.className = 'note-card';
      card.innerHTML = `
        <div class="note-header">
          <span class="note-mood-badge">${note.mood}</span>
          <div>
            <span class="note-date">${note.date}</span>
            <button class="btn-delete-note" title="Eliminar memoria" data-id="${note.id}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
        <div class="note-text">${escapeHTML(note.text)}</div>
      `;

      // Evento eliminar
      const delBtn = card.querySelector('.btn-delete-note');
      delBtn.addEventListener('click', () => {
        notes = notes.filter(n => n.id !== note.id);
        saveAndRender();
        showToast('✦ Memoria desvanecida 💨');
      });

      diaryFeed.appendChild(card);
    });
  }

  function formatGothicDate(d) {
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const dia = d.getDate();
    const mes = meses[d.getMonth()];
    const hora = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${dia} ${mes}, ${hora}:${min}`;
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

/* ============================================================
   4. TEMPORIZADOR POMODORO VAMPÍRICO (25 MINUTOS)
   ============================================================ */
function initPomodoro() {
  const minutesDisplay = document.getElementById('timerMinutes');
  const secondsDisplay = document.getElementById('timerSeconds');
  const startBtn = document.getElementById('startTimerBtn');
  const pauseBtn = document.getElementById('pauseTimerBtn');
  const resetBtn = document.getElementById('resetTimerBtn');
  const potionTokensContainer = document.getElementById('potionTokens');
  const pomodoroStateTitle = document.getElementById('pomodoroStateTitle');

  const TOTAL_FOCUS_TIME = 25 * 60; // 25 minutos en segundos
  let timeLeft = TOTAL_FOCUS_TIME;
  let timerInterval = null;
  let isRunning = false;

  // Cargar pociones completadas
  let potionsCount = parseInt(localStorage.getItem('grimoire_potions') || '0', 10);
  renderPotions();

  // Iniciar
  startBtn.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-flex';
    pomodoroStateTitle.textContent = 'Destilando Pócima de Estudio...';

    timerInterval = setInterval(() => {
      timeLeft--;
      updateDisplay();

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        playMagicChime();
        potionsCount++;
        localStorage.setItem('grimoire_potions', potionsCount);
        renderPotions();
        showToast('🎉 ¡Poción completada! Descansa 5 minutos, reina 🦇✨');
        resetTimer();
      }
    }, 1000);
  });

  // Pausar
  pauseBtn.addEventListener('click', () => {
    if (!isRunning) return;
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.style.display = 'inline-flex';
    pauseBtn.style.display = 'none';
    pomodoroStateTitle.textContent = 'Pócima en Pausa ⏸️';
  });

  // Reiniciar
  resetBtn.addEventListener('click', () => {
    resetTimer();
  });

  function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = TOTAL_FOCUS_TIME;
    updateDisplay();
    startBtn.style.display = 'inline-flex';
    pauseBtn.style.display = 'none';
    pomodoroStateTitle.textContent = 'Tiempo de Enfoque Mágico';
  }

  function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    minutesDisplay.textContent = mins.toString().padStart(2, '0');
    secondsDisplay.textContent = secs.toString().padStart(2, '0');
  }

  function renderPotions() {
    potionTokensContainer.innerHTML = '';
    if (potionsCount === 0) {
      potionTokensContainer.innerHTML = '<span class="token-placeholder">Completa 25 min para ganar una poción ✨</span>';
      return;
    }

    const tokens = ['🧪', '🎀', '🦇', '🔮', '✨'];
    for (let i = 0; i < potionsCount; i++) {
      const span = document.createElement('span');
      span.className = 'potion-token';
      span.textContent = tokens[i % tokens.length];
      span.title = `Poción #${i + 1}`;
      potionTokensContainer.appendChild(span);
    }
  }

  // Campanita mágica usando Web Audio API (nativo, sin archivos mp3 externos)
  function playMagicChime() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Acorde celestial)
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime + (idx * 0.12));
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (idx * 0.12) + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + (idx * 0.12));
        osc.stop(audioCtx.currentTime + (idx * 0.12) + 0.8);
      });
    } catch (e) {
      console.log('AudioContext not allowed yet:', e);
    }
  }
}

/* ============================================================
   5. NOTIFICACIÓN TOAST
   ============================================================ */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('magicToast');
  if (!toast) return;

  clearTimeout(toastTimeout);
  toast.innerHTML = `<span>${message}</span>`;
  toast.classList.add('show');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

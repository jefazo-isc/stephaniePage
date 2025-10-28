// Fechas límite
const startDeadlineUtc = '2025-11-13T06:00:00Z'; // Inicio de ofertas
const endDeadlineUtc = '2025-11-17T06:00:00Z';   // Fin de ofertas

const startDeadlineMs = Date.parse(startDeadlineUtc);
const endDeadlineMs = Date.parse(endDeadlineUtc);

const section = document.querySelector('.countdown-section');
const countdownText = document.querySelector('.countdown-text');
const countdownHighlight = document.querySelector('.countdown-highlight');

function updateCountdown(nowMs) {
    let targetMs;
    let isBeforeStart = nowMs < startDeadlineMs;
    
    // Determinar qué fecha límite usar
    if (isBeforeStart) {
        targetMs = startDeadlineMs;
        // Mensajes antes del inicio
        countdownText.textContent = 'Faltan para que disfrutes de nuestras ofertas';
        countdownHighlight.textContent = '¡Prepárate!';
    } else if (nowMs < endDeadlineMs) {
        targetMs = endDeadlineMs;
        // Mensajes durante las ofertas
        countdownText.textContent = 'Quedan para que nuestras ofertas terminen';
        countdownHighlight.textContent = '¡Apresurate!';
    } else {
        // Después del fin de las ofertas
        section.style.display = 'none';
        return;
    }

    let diff = targetMs - nowMs;

    if (diff <= 0 && !isBeforeStart && nowMs >= endDeadlineMs) {
        section.style.display = 'none';
        return;
    }

    const totalSec = Math.floor(Math.abs(diff) / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const pad = n => String(n).padStart(2, '0');

    document.getElementById('dias').textContent = days;
    document.getElementById('horas').textContent = pad(hours);
    document.getElementById('minutos').textContent = pad(minutes);
    document.getElementById('segundos').textContent = pad(seconds);
}

fetch("https://worldtimeapi.org/api/timezone/America/Mexico_City")
.then(res => res.json())
.then(data => {
    let nowMs = Date.parse(data.utc_datetime);

    updateCountdown(nowMs);

    const timer = setInterval(() => {
        nowMs += 1000;
        updateCountdown(nowMs);
        if (nowMs >= endDeadlineMs) clearInterval(timer);
        }, 1000);
    })
    .catch(err => {
      console.error("Error obteniendo hora:", err);
      let nowMs = Date.now();
      updateCountdown(nowMs);
      const timer = setInterval(() => {
        nowMs += 1000;
        updateCountdown(nowMs);
        if (nowMs >= endDeadlineMs) clearInterval(timer);
      }, 1000);
    });

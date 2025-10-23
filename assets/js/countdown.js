const deadlineUtc = '2025-11-13T06:00:00Z';
const deadlineMs = Date.parse(deadlineUtc);

const section = document.querySelector('.countdown-section');

function updateCountdown(nowMs) {
    let diff = deadlineMs - nowMs;

    if (diff <= 0) {
    // Si ya pasó la fecha, ocultamos toda la sección
        section.style.display = 'none';
        return;
    }

    const totalSec = Math.floor(diff / 1000);
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

  // Consulta inicial a WorldTimeAPI (solo una vez)
fetch("https://worldtimeapi.org/api/timezone/America/Mexico_City")
.then(res => res.json())
.then(data => {
    let nowMs = Date.parse(data.utc_datetime);

    updateCountdown(nowMs);

    const timer = setInterval(() => {
        nowMs += 1000;
        updateCountdown(nowMs);

        // Si ya pasó la fecha, detenemos el intervalo
        if (nowMs >= deadlineMs) clearInterval(timer);
        }, 1000);
    })
    .catch(err => {
      console.error("Error obteniendo hora:", err);
      // Fallback: usar reloj local
      let nowMs = Date.now();
      updateCountdown(nowMs);
      const timer = setInterval(() => {
        nowMs += 1000;
        updateCountdown(nowMs);
        if (nowMs >= deadlineMs) clearInterval(timer);
      }, 1000);
    });

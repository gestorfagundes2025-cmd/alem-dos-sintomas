(() => {
  "use strict";
  const timer = document.getElementById("event-countdown");
  if (!timer) return;
  const target = Date.parse(window.JORNADA_CONFIG?.eventStart || timer.dataset.eventStart);
  const status = document.getElementById("countdown-status");
  const units = ["days", "hours", "minutes", "seconds"].map(unit => timer.querySelector(`[data-countdown="${unit}"]`));
  if (!Number.isFinite(target) || units.some(unit => !unit)) return;
  let interval;
  const render = () => {
    const remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));
    const values = [Math.floor(remaining / 86400), Math.floor(remaining % 86400 / 3600), Math.floor(remaining % 3600 / 60), remaining % 60];
    units.forEach((element, index) => { element.textContent = String(values[index]).padStart(2, "0"); });
    if (remaining === 0) {
      if (interval) window.clearInterval(interval);
      timer.hidden = true;
      if (status) status.textContent = "A contagem terminou. Consulte no grupo as orientações de acesso ao encontro.";
      window.dispatchEvent(new CustomEvent("jornada:event-started"));
    }
    return remaining;
  };
  if (render() > 0) interval = window.setInterval(render, 1000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
})();

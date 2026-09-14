(() => {
  "use strict";
  const config = window.JORNADA_CONFIG || {};
  const eventStart = Date.parse(config.eventStart);
  const hasStarted = () => Number.isFinite(eventStart) && Date.now() >= eventStart;
  const price = Number(config.ticketPrice);
  if (Number.isFinite(price) && price > 0) {
    const display = new Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL", minimumFractionDigits: Number.isInteger(price) ? 0 : 2}).format(price);
    document.querySelectorAll("[data-price]").forEach(element => { element.textContent = display; });
  }
  let checkout;
  try {
    const candidate = new URL(config.checkoutUrl);
    // Restringe o destino à plataforma definida pelo cliente. Não aceita URL pela querystring.
    if (candidate.protocol === "https:" && !candidate.username && !candidate.password &&
        (candidate.hostname === "hub.la" || candidate.hostname.endsWith(".hub.la") ||
         candidate.hostname === "hubla.com.br" || candidate.hostname.endsWith(".hubla.com.br"))) {
      checkout = candidate;
    }
  } catch (_) { /* Sem checkout válido, manter a prévia explícita. */ }
  const notice = document.getElementById("preview-notice");
  const ctas = document.querySelectorAll("[data-checkout]");
  const closeRegistrations = () => {
    ctas.forEach(cta => {
      cta.setAttribute("aria-disabled", "true");
      cta.href = "#participar";
      cta.textContent = "Inscrições encerradas";
    });
    if (notice) {
      notice.hidden = false;
      notice.textContent = "A data de início deste encontro já chegou. Consulte no grupo as orientações de acesso.";
    }
  };
  window.addEventListener("jornada:event-started", closeRegistrations);
  if (checkout) {
    // Repassa somente atribuição de campanha, nunca respostas de saúde.
    // Repassa apenas códigos de campanha presentes na URL, sem armazená-los.
    const params = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"].forEach(key => {
      const value = params.get(key);
      if (value && value.length <= (key === "fbclid" ? 512 : 160) && !checkout.searchParams.has(key)) checkout.searchParams.set(key, value);
    });
    if (notice) notice.hidden = true;
    let navigationPending = false;
    ctas.forEach(cta => {
      cta.href = checkout.href;
      cta.removeAttribute("aria-disabled");
      const handleCheckout = event => {
        if (hasStarted()) {
          event.preventDefault();
          closeRegistrations();
          return;
        }
        if (event.defaultPrevented) return;
        if (navigationPending) { event.preventDefault(); return; }
        window.dispatchEvent(new CustomEvent("jornada:checkout-click", { detail: { placement: cta.dataset.location } }));
        // Janela curta para envio do pixel, sem depender da resposta da Meta.
        // Ctrl/Cmd/Shift e abertura em nova aba mantêm o comportamento nativo.
        if (window.JORNADA_TRACKING && event.button !== 1 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && (!cta.target || cta.target === "_self")) {
          event.preventDefault();
          navigationPending = true;
          window.setTimeout(() => { window.location.assign(cta.href); }, 350);
        }
      };
      cta.addEventListener("click", handleCheckout);
      cta.addEventListener("auxclick", event => { if (event.button === 1) handleCheckout(event); });
    });
    window.addEventListener("pageshow", () => { navigationPending = false; });
  } else {
    ctas.forEach(cta => cta.addEventListener("click", event => {
      event.preventDefault();
      if (hasStarted()) { closeRegistrations(); return; }
      if (notice) {
        notice.hidden = false;
        notice.textContent = "As inscrições ainda não estão disponíveis. O link de pagamento será disponibilizado em breve.";
        notice.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start"});
      }
    }));
  }
  if (hasStarted()) closeRegistrations();
  const ribbonToggle = document.getElementById("ribbon-toggle");
  const ribbonTrack = document.getElementById("event-ribbon-track");
  if (ribbonToggle && ribbonTrack) {
    ribbonToggle.addEventListener("click", () => {
      const paused = ribbonToggle.getAttribute("aria-pressed") !== "true";
      ribbonToggle.setAttribute("aria-pressed", String(paused));
      ribbonToggle.setAttribute("aria-label", paused ? "Retomar faixa de data" : "Pausar faixa de data");
      ribbonToggle.textContent = paused ? "▶" : "Ⅱ";
      ribbonTrack.style.animationPlayState = paused ? "paused" : "running";
    });
  }
  const sticky = document.getElementById("mobile-cta");
  const ticket = document.querySelector(".ticket");
  if (sticky && ticket && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        sticky.classList.toggle("is-hidden", entry.isIntersecting);
        sticky.inert = entry.isIntersecting;
      });
    }, {threshold: .25});
    observer.observe(ticket);
  }
})();

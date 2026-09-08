(() => {
  "use strict";
  const config = window.JORNADA_CONFIG || {};
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
  if (checkout) {
    // Sem formulários, dados de saúde, pixels ou cookies de publicidade nesta entrega.
    // Repassa apenas códigos de campanha presentes na URL, sem armazená-los.
    const params = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(key => {
      const value = params.get(key);
      if (value && value.length <= 160 && !checkout.searchParams.has(key)) checkout.searchParams.set(key, value);
    });
    if (notice) notice.hidden = true;
    ctas.forEach(cta => {
      cta.href = checkout.href;
      cta.removeAttribute("aria-disabled");
      cta.addEventListener("click", () => {
        // Gancho local opcional. Não envia dados a plataformas externas por conta própria.
        window.dispatchEvent(new CustomEvent("jornada:checkout-click", { detail: { placement: cta.dataset.location } }));
      });
    });
  } else {
    ctas.forEach(cta => cta.addEventListener("click", event => {
      event.preventDefault();
      if (notice) {
        notice.hidden = false;
        notice.textContent = "Prévia para aprovação: a compra ainda não está disponível. Falta configurar o link oficial do checkout.";
        notice.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start"});
      }
    }));
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

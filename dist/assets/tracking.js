/* Meta Pixel nativo. PageView na visita; AddToCart na escolha do ingresso.
   Purchase pertence exclusivamente à integração da Hubla. */
(() => {
  "use strict";
  if (window.JORNADA_TRACKING) return;
  const config = window.JORNADA_CONFIG || {};
  const pixelId = String(config.metaPixelId || "");
  if (!/^\d{15,16}$/.test(pixelId)) return;
  const price = Number(config.ticketPrice);
  const placements = new Set(["hero", "content", "ticket", "mobile"]);
  window.dataLayer = window.dataLayer || [];
  !function(f,b,e,v,n,t,s) {
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s);
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  // Somente eventos explícitos: sem captura automática de botões/metadados.
  window.fbq('set', 'autoConfig', false, pixelId);
  window.fbq('init', pixelId);
  window.JORNADA_TRACKING = Object.freeze({ pixelId });
  function emit(name, event, parameters = {}) {
    const eventId = window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.dataLayer.push({ event, meta_event: name, event_id: eventId, ...parameters });
    window.fbq('trackSingle', pixelId, name, parameters, { eventID: eventId });
  }
  emit('PageView', 'page_view');
  let lastClick = -Infinity;
  window.addEventListener('jornada:checkout-click', event => {
    const placement = event.detail && event.detail.placement;
    const now = Date.now();
    const start = Date.parse(config.eventStart);
    if (!placements.has(placement) || !Number.isFinite(price) || price <= 0 ||
        (Number.isFinite(start) && now >= start) || now - lastClick < 1000) return;
    lastClick = now;
    emit('AddToCart', 'add_to_cart', {
      value: price,
      currency: config.currency,
      content_ids: [config.ticketId],
      content_type: 'product',
      contents: [{ id: config.ticketId, quantity: 1, item_price: price }],
      num_items: 1,
      button_location: placement
    });
  });
  window.addEventListener('pageshow', () => { lastClick = -Infinity; });
})();

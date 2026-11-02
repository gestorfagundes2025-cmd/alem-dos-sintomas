/* Alterar somente após validar o destino exato da oferta na Hubla.
   Link vazio = prévia: nenhuma compra é simulada nem redirecionada. */
window.JORNADA_CONFIG = Object.freeze({
  checkoutUrl: "https://pay.hub.la/u4gdUmckM4Y0xMqv9e5W",
  // Oferta indisponível na Hubla em 02/11/2026. Reabrir somente após
  // confirmar destino, preço e entrega da segunda edição com o responsável.
  checkoutEnabled: false,
  metaPixelId: "2283183939189207",
  // ID comercial preservado até confirmar o produto da segunda edição na Hubla.
  ticketId: "jornada_16092026",
  eventEdition: "jornada_20261111_edicao2",
  ticketPrice: 69,
  currency: "BRL",
  eventStart: "2026-11-11T19:00:00-03:00"
});

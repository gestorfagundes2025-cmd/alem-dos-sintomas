/** No guessed number or personal/clinical data is ever appended to the destination. */
export function normalizePhone(value = '') {
  if (typeof value !== 'string' || !/^[+\d\s().-]*$/.test(value)) return '';
  const number = value.replace(/\D/g, '');
  if (!/^55[1-9]\d(?:9\d{8}|\d{8})$/.test(number)) return '';
  if (/^(\d)\1+$/.test(number.slice(4))) return '';
  return number;
}
export function getWhatsAppUrl(value, message) {
  const number = normalizePhone(value);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : '';
}
export function validateRelease(config) {
  const missing = [];
  if (!normalizePhone(config.whatsapp)) missing.push('WhatsApp oficial válido');
  if (!/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(config.canonicalUrl || '')) missing.push('URL HTTPS oficial');
  for (const key of ['legalEntity', 'legalAddress', 'privacyContact']) if (!config[key]?.trim()) missing.push(key);
  for (const key of ['copyAndOffer', 'images', 'credentials', 'legal']) if (config.approvals?.[key] !== true) missing.push(`aprovação: ${key}`);
  return missing;
}

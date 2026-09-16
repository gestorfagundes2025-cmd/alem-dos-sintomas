import config from './config.js';
import { getWhatsAppUrl } from './contact.mjs';

const lastFocus = new WeakMap();
const dialogs = document.querySelectorAll('dialog');
function openDialog(id, trigger) {
  const dialog = document.getElementById(id);
  if (!(dialog instanceof HTMLDialogElement)) return;
  for (const other of dialogs) if (other.open && other !== dialog) other.close();
  lastFocus.set(dialog, trigger || document.activeElement);
  if (!dialog.open) dialog.showModal();
  const toggle = document.querySelector(`[data-dialog="${id}"]`);
  if (toggle?.hasAttribute('aria-expanded')) toggle.setAttribute('aria-expanded', 'true');
  dialog.querySelector('button')?.focus();
}
for (const trigger of document.querySelectorAll('[data-dialog]')) {
  trigger.addEventListener('click', () => openDialog(trigger.dataset.dialog, trigger));
}
for (const dialog of dialogs) {
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]')].filter(node => node.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  dialog.querySelectorAll('.close-dialog, .close-dialog-text').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    const toggle = document.querySelector(`[data-dialog="${dialog.id}"]`);
    if (toggle?.hasAttribute('aria-expanded')) toggle.setAttribute('aria-expanded', 'false');
    if (document.querySelector('dialog[open]')) return;
    const previous = lastFocus.get(dialog);
    if (previous instanceof HTMLElement && previous.getClientRects().length) previous.focus({ preventScroll: true });
    else document.querySelector('.menu-toggle')?.focus({ preventScroll: true });
  });
}
document.querySelectorAll('#menu-dialog nav a').forEach(link => link.addEventListener('click', () => document.getElementById('menu-dialog').close()));
const destination = getWhatsAppUrl(config.whatsapp, config.message);
for (const link of document.querySelectorAll('.contact-link')) {
  if (destination) {
    link.href = destination;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  link.addEventListener('click', event => {
    if (!destination) {
      event.preventDefault();
      openDialog('contact-dialog', link);
      return;
    }
    // Local hook only. A click is NOT a lead, message, appointment or purchase.
    window.dispatchEvent(new CustomEvent('shalon:contact-intent', {
      detail: { placement: link.dataset.placement || 'unspecified', channel: 'whatsapp' }
    }));
    const menu = document.getElementById('menu-dialog');
    if (menu?.open) menu.close();
  });
}
const sticky = document.getElementById('mobile-contact');
if (sticky && 'IntersectionObserver' in window) {
  const states = new Map();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => states.set(entry.target, entry.isIntersecting));
    const nearEnd = [...states.values()].some(Boolean);
    sticky.classList.toggle('is-away', nearEnd);
    sticky.inert = nearEnd;
  }, { threshold: .08 });
  document.querySelectorAll('#contato, .site-footer').forEach(node => observer.observe(node));
}

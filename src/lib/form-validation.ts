export interface FormErrors {
  name?: string;
  email?: string;
  website?: string;
  message?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  website?: string;
  message: string;
  honeypot: string;
  startedAt: number;
  now?: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPAM_MIN_MS = 2500;
const MESSAGE_MIN_LENGTH = 10;

export function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function validateName(name: string): boolean {
  return name.trim().length > 0;
}

export function validateMessage(message: string, minLength = MESSAGE_MIN_LENGTH): boolean {
  return message.trim().length >= minLength;
}

export function isHoneypotFilled(value: string): boolean {
  return value.length > 0;
}

export function isSpamSubmit(startedAt: number, now: number, minMs = SPAM_MIN_MS): boolean {
  return startedAt > 0 && now - startedAt < minMs;
}

export function validateContactForm(data: ContactFormData): FormErrors {
  const errors: FormErrors = {};
  if (!validateName(data.name)) errors.name = 'Bitte geben Sie Ihren Namen ein.';
  if (!validateEmail(data.email)) errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
  if (data.website && data.website.trim()) {
    try {
      new URL(data.website.trim());
    } catch {
      errors.website = 'Bitte geben Sie eine gültige URL ein (z. B. https://beispiel.de).';
    }
  }
  if (!validateMessage(data.message)) errors.message = 'Bitte geben Sie Ihre Nachricht ein (mindestens 10 Zeichen).';
  return errors;
}

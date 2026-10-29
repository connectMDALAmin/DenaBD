/**
 * Client-Side PIN security engine using Web Crypto API.
 * Never stores plain text PINs; uses salted SHA-256 and brute-force backoff protection.
 */

const PIN_ATTEMPTS_KEY = 'denapawna_pin_attempts';
const PIN_LOCK_UNTIL_KEY = 'denapawna_pin_lock_until';

// Helper to convert ArrayBuffer to Hex String
function buf2hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generates a random cryptographic salt
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return buf2hex(array.buffer);
}

/**
 * Hashes a 4-digit PIN with a salt
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${pin}:denapawna_secure_vault`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return buf2hex(hashBuffer);
}

/**
 * Verifies a PIN against the stored hash and salt
 */
export async function verifyPin(
  enteredPin: string,
  storedHash: string,
  storedSalt: string
): Promise<{ success: boolean; error?: string; remainingAttempts?: number }> {
  // Check lockout
  const lockUntil = parseInt(localStorage.getItem(PIN_LOCK_UNTIL_KEY) || '0', 10);
  const now = Date.now();
  if (lockUntil > now) {
    const secondsRemaining = Math.ceil((lockUntil - now) / 1000);
    return {
      success: false,
      error: `Too many failed attempts. Locked for ${secondsRemaining}s.`,
    };
  }

  const computedHash = await hashPin(enteredPin, storedSalt);
  if (computedHash === storedHash) {
    // Reset attempts on success
    localStorage.removeItem(PIN_ATTEMPTS_KEY);
    localStorage.removeItem(PIN_LOCK_UNTIL_KEY);
    return { success: true };
  }

  // Handle failure
  const attempts = parseInt(localStorage.getItem(PIN_ATTEMPTS_KEY) || '0', 10) + 1;
  localStorage.setItem(PIN_ATTEMPTS_KEY, String(attempts));

  if (attempts >= 5) {
    // Lock for 60 seconds
    localStorage.setItem(PIN_LOCK_UNTIL_KEY, String(Date.now() + 60000));
    return {
      success: false,
      error: 'Too many incorrect attempts! Application locked for 60 seconds.',
    };
  } else if (attempts >= 3) {
    // Lock for 30 seconds
    localStorage.setItem(PIN_LOCK_UNTIL_KEY, String(Date.now() + 30000));
    return {
      success: false,
      error: '3 failed attempts. Locked for 30 seconds.',
      remainingAttempts: 0,
    };
  }

  return {
    success: false,
    error: 'Incorrect PIN.',
    remainingAttempts: 3 - attempts,
  };
}

import crypto from 'crypto';

/**
 * Hashes a 6-digit PIN securely using scrypt.
 * @param pin The raw 6-digit PIN string.
 * @returns A string in the format "salt:hash".
 */
export function hashPin(pin: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pin, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a raw PIN against a stored hash.
 * @param pin The raw 6-digit PIN string.
 * @param storedHash The stored "salt:hash" string.
 * @returns Boolean true if the PIN is correct, false otherwise.
 */
export function verifyPin(pin: string, storedHash: string): boolean {
  if (!storedHash) return false;
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  
  const [salt, hash] = parts;
  const hashVerify = crypto.scryptSync(pin, salt, 64).toString('hex');
  
  // Use timingSafeEqual to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hashVerify));
}

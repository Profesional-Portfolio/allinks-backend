import crypto from 'node:crypto';

export function generateToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const expires_at = new Date();

  expires_at.setHours(expires_at.getHours() + 1);

  return {
    token,
    expires_at,
  };
}

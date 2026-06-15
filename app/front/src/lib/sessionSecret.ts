export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET?.trim();
  return secret || null;
}

export function requireSessionSecret() {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("SESSION_SECRET is required to sign session tokens.");
  }
  return secret;
}

export function getSessionSigningKey() {
  return new TextEncoder().encode(requireSessionSecret());
}

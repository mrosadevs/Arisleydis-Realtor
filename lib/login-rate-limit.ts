type LoginState = {
  firstFailureAt: number;
  failureCount: number;
  lockUntil: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

const loginAttempts = new Map<string, LoginState>();

function pruneOldEntries(now: number): void {
  loginAttempts.forEach((state, key) => {
    const stale = state.lockUntil < now && now - state.firstFailureAt > WINDOW_MS * 2;

    if (stale) {
      loginAttempts.delete(key);
    }
  });
}

export function checkLoginRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  pruneOldEntries(now);

  const state = loginAttempts.get(identifier);

  if (!state) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (state.lockUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((state.lockUntil - now) / 1000)
    };
  }

  if (now - state.firstFailureAt > WINDOW_MS) {
    loginAttempts.delete(identifier);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function registerLoginFailure(identifier: string): { locked: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const current = loginAttempts.get(identifier);

  if (!current || now - current.firstFailureAt > WINDOW_MS) {
    loginAttempts.set(identifier, {
      firstFailureAt: now,
      failureCount: 1,
      lockUntil: 0
    });

    return { locked: false, retryAfterSeconds: 0 };
  }

  const failureCount = current.failureCount + 1;

  if (failureCount >= MAX_FAILURES) {
    current.failureCount = 0;
    current.firstFailureAt = now;
    current.lockUntil = now + LOCK_MS;
    loginAttempts.set(identifier, current);

    return {
      locked: true,
      retryAfterSeconds: Math.ceil(LOCK_MS / 1000)
    };
  }

  current.failureCount = failureCount;
  loginAttempts.set(identifier, current);
  return { locked: false, retryAfterSeconds: 0 };
}

export function clearLoginFailures(identifier: string): void {
  loginAttempts.delete(identifier);
}

import crypto from 'crypto';

/**
 * Check if password has been compromised using HaveIBeenPwned API
 * Uses k-anonymity model - only sends first 5 chars of SHA-1 hash
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  try {
    const hash = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: { 'User-Agent': 'ExamsPlatform/1.0' },
      }
    );

    if (!response.ok) return false;

    const text = await response.text();
    return text.split('\n').some((line) => line.split(':')[0] === suffix);
  } catch {
    return false; // Fail open for better UX
  }
}

/**
 * Server-side password breach check for registration/password changes
 */
export async function serverCheckPasswordBreach(password: string): Promise<{
  isBreached: boolean;
  breachCount?: number;
}> {
  try {
    const hash = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`
    );
    if (!response.ok) return { isBreached: false };

    const text = await response.text();
    const match = text
      .split('\n')
      .find((line) => line.split(':')[0] === suffix);

    if (match) {
      const parts = match.split(':');
      const breachCount = parts[1] ? parseInt(parts[1], 10) : 0;
      return { isBreached: true, breachCount };
    }

    return { isBreached: false };
  } catch {
    return { isBreached: false };
  }
}

/**
 * Batch check multiple passwords (for admin password audits)
 */
export async function batchCheckPasswords(
  passwords: string[]
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();

  // Group passwords by hash prefix to minimize API calls
  const prefixGroups = new Map<string, string[]>();

  for (const password of passwords) {
    const hash = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();
    const prefix = hash.substring(0, 5);

    if (!prefixGroups.has(prefix)) {
      prefixGroups.set(prefix, []);
    }
    const group = prefixGroups.get(prefix);
    if (group) {
      group.push(password);
    }
  }

  // Check each prefix group
  for (const [prefix, groupPasswords] of prefixGroups) {
    try {
      const response = await fetch(
        `https://api.pwnedpasswords.com/range/${prefix}`,
        {
          headers: {
            'User-Agent': 'ExamsPlatform-BatchPasswordCheck/1.0',
            ...(process.env.HIBP_API_KEY && {
              'hibp-api-key': process.env.HIBP_API_KEY,
            }),
          },
        }
      );

      if (response.ok) {
        const data = await response.text();
        const breachedSuffixes = new Set(
          data.split('\n').map((line) => line.split(':')[0])
        );

        for (const password of groupPasswords) {
          const hash = crypto
            .createHash('sha1')
            .update(password)
            .digest('hex')
            .toUpperCase();
          const suffix = hash.substring(5);
          results.set(password, breachedSuffixes.has(suffix));
        }
      } else {
        // Mark as not breached if API fails
        for (const password of groupPasswords) {
          results.set(password, false);
        }
      }
    } catch (error) {
      console.error(`Batch check failed for prefix ${prefix}:`, error);
      for (const password of groupPasswords) {
        results.set(password, false);
      }
    }

    // Rate limiting - wait between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}

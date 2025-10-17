interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number; // 0-100
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Minimum length check (12 characters)
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  } else {
    score += 20;
  }

  // Maximum length check (128 characters to prevent DoS)
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  // Character variety checks
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
    password
  );

  if (!hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 15;
  }

  if (!hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 15;
  }

  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  } else {
    score += 15;
  }

  if (!hasSpecialChars) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 15;
  }

  // Common patterns check
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters (aaa, 111)
    /123456|654321|qwerty|password|admin/i, // Common sequences
    /^[a-zA-Z]+\d+$/, // Letters followed by numbers only
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common patterns that are easily guessed');
      score -= 10;
      break;
    }
  }

  // Entropy calculation (bonus points for complexity)
  const entropy = calculateEntropy(password);
  if (entropy > 50) {
    score += 20;
  } else if (entropy > 30) {
    score += 10;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.max(0, Math.min(100, score)),
  };
}

function calculateEntropy(password: string): number {
  const charSets = [
    /[a-z]/g, // lowercase
    /[A-Z]/g, // uppercase
    /\d/g, // numbers
    /[^a-zA-Z0-9]/g, // special characters
  ];

  let poolSize = 0;
  const charSetSizes = [26, 26, 10, 32]; // lowercase, uppercase, digits, special
  charSets.forEach((charSet, index) => {
    if (charSet.test(password)) {
      poolSize += charSetSizes[index] || 0;
    }
  });

  return password.length * Math.log2(poolSize);
}

export function getPasswordStrengthLabel(score: number): string {
  if (score >= 80) return 'Very Strong';
  if (score >= 60) return 'Strong';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Weak';
  return 'Very Weak';
}

export function getPasswordStrengthColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  if (score >= 20) return 'text-orange-600';
  return 'text-red-600';
}

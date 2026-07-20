/**
 * Password strength validation utility.
 * Returns an object with { valid, message }.
 */

const MIN_LENGTH = 8;
const RULES = [
  {
    test: (pw) => pw.length >= MIN_LENGTH,
    message: `Password must be at least ${MIN_LENGTH} characters long`,
  },
  {
    test: (pw) => /[a-z]/.test(pw),
    message: "Password must contain at least one lowercase letter",
  },
  {
    test: (pw) => /[A-Z]/.test(pw),
    message: "Password must contain at least one uppercase letter",
  },
  {
    test: (pw) => /\d/.test(pw),
    message: "Password must contain at least one number",
  },
  {
    test: (pw) => /[!@#$%^&*()_\-+=\[\]{}|;:'",.<>?/~`]/.test(pw),
    message: "Password must contain at least one special character (!@#$%^&* etc.)",
  },
];

/**
 * Validates a password against strength rules.
 * @param {string} password - The password to validate.
 * @returns {{ valid: boolean, message: string, failedRules: string[] }}
 */
export function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return {
      valid: false,
      message: "Password is required",
      failedRules: ["Password is required"],
    };
  }

  const failedRules = [];

  for (const rule of RULES) {
    if (!rule.test(password)) {
      failedRules.push(rule.message);
    }
  }

  if (failedRules.length > 0) {
    return {
      valid: false,
      message: failedRules[0], // Return first failure for a clean single message
      failedRules,
    };
  }

  return { valid: true, message: "Password is strong", failedRules: [] };
}

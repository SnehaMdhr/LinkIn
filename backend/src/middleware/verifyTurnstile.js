
const verifyTurnstileToken = async (token) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn("TURNSTILE_SECRET_KEY is not set — skipping Turnstile verification");
    return true;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error.message);
    return false;
  }
};

// @desc  Middleware to verify Turnstile on protected routes
const verifyTurnstile = async (req, res, next) => {
  const captchaToken = req.body.captchaToken;

  if (!captchaToken) {
    return res.status(400).json({ message: "CAPTCHA verification is required." });
  }

  const isValid = await verifyTurnstileToken(captchaToken);

  if (!isValid) {
    return res.status(400).json({ message: "CAPTCHA verification failed. Please try again." });
  }

  next();
};

export { verifyTurnstile, verifyTurnstileToken };

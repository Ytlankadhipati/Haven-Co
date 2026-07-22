import rateLimit from "express-rate-limit";

// Applies to login/register/password-reset endpoints — prevents
// brute-force password guessing and spam registrations.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter specifically for forgot-password, since it also
// triggers an email send each time — don't let someone spam an inbox
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: "Too many password reset requests. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
// src/middleware/auth.js
import jwt from "jsonwebtoken";

/**
 * Extract JWT from common places:
 * - Authorization: Bearer <token>
 * - Cookie: token=<token>
 * - Query string: ?token=<token>  (useful for quick tests / tools)
 */
function extractToken(req) {
  // Header
  const header = req.headers.authorization || req.headers.Authorization || "";
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }

  // Cookie (if cookie-parser is used upstream; otherwise req.headers.cookie parsing below)
  if (req.cookies?.token) return req.cookies.token;

  // Fallback: parse raw Cookie header (without cookie-parser)
  const rawCookie = req.headers.cookie;
  if (rawCookie) {
    const parts = rawCookie.split(";").map((s) => s.trim());
    const tokenPair = parts.find((p) => p.startsWith("token="));
    if (tokenPair) return tokenPair.split("=")[1];
  }

  // Query string (only for non-browser tools/testing)
  if (typeof req.query?.token === "string" && req.query.token.length > 0) {
    return req.query.token;
  }

  return null;
}

/**
 * Attach req.user if a valid token is present, but never block the request.
 * Useful for public endpoints where auth is optional (e.g., message submit).
 */
export function attachAuthIfPresent(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload: { id, email, role, iat, exp }
    req.user = payload;
  } catch {
    // ignore invalid token on optional endpoints
  }
  next();
}

/**
 * Require a valid JWT; otherwise respond 401.
 */
export function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Require an authenticated user with role === "admin"; otherwise respond 403.
 * Should be placed AFTER requireAuth (or use it standalone; it will extract again if needed).
 */
export function requireAdmin(req, res, next) {
  // If a previous middleware already decoded the user, use it; else decode now.
  if (!req.user) {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: "Missing token" });
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

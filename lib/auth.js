import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh";

export function signToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

export function getUserFromRequest(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSION_COOKIE = void 0;
exports.createSessionToken = createSessionToken;
exports.readSessionToken = readSessionToken;
exports.getSessionCookieOptions = getSessionCookieOptions;
exports.parseCookieHeader = parseCookieHeader;
const node_crypto_1 = require("node:crypto");
exports.SESSION_COOKIE = "pakiship_session";
const SESSION_SECRET = process.env.AUTH_SECRET || "pakiship-dev-secret";
const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
function sign(value) {
    return (0, node_crypto_1.createHmac)("sha256", SESSION_SECRET).update(value).digest("hex");
}
function createSessionToken(payload) {
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${encoded}.${sign(encoded)}`;
}
function readSessionToken(token) {
    if (!token)
        return null;
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature)
        return null;
    if (sign(encoded) !== signature)
        return null;
    try {
        return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    }
    catch {
        return null;
    }
}
function getSessionCookieOptions(keepLoggedIn = true) {
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: (keepLoggedIn ? ONE_WEEK_IN_SECONDS : ONE_DAY_IN_SECONDS) * 1000,
        path: "/",
    };
}
function parseCookieHeader(cookieHeader) {
    if (!cookieHeader)
        return {};
    return cookieHeader.split(";").reduce((acc, part) => {
        const [rawKey, ...rest] = part.trim().split("=");
        if (!rawKey)
            return acc;
        acc[rawKey] = decodeURIComponent(rest.join("="));
        return acc;
    }, {});
}

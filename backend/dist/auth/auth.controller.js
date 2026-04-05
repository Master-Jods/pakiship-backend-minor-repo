"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const session_util_1 = require("../common/session/session.util");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(body, response) {
        const role = body.role;
        const identifier = String(body.identifier ?? "");
        const password = String(body.password ?? "");
        if (!role || !identifier || !password) {
            throw new common_1.BadRequestException("Role, identifier, and password are required.");
        }
        const result = await this.authService.signIn(identifier, password, role);
        const requiresTwoFactor = "requiresTwoFactor" in result && result.requiresTwoFactor;
        if (!requiresTwoFactor) {
            response.cookie(session_util_1.SESSION_COOKIE, (0, session_util_1.createSessionToken)(result.session), (0, session_util_1.getSessionCookieOptions)());
        }
        return {
            user: result.user,
            redirectPath: result.redirectPath,
            requiresTwoFactor,
            challengeToken: requiresTwoFactor && "challengeToken" in result ? result.challengeToken : undefined,
        };
    }
    async verifyTwoFactor(body, response) {
        const challengeToken = String(body.challengeToken ?? "");
        const code = String(body.code ?? "");
        if (!challengeToken || !code) {
            throw new common_1.BadRequestException("Challenge token and verification code are required.");
        }
        const result = await this.authService.verifyTwoFactorLogin(challengeToken, code);
        response.cookie(session_util_1.SESSION_COOKIE, (0, session_util_1.createSessionToken)(result.session), (0, session_util_1.getSessionCookieOptions)());
        return {
            user: result.user,
            redirectPath: result.redirectPath,
        };
    }
    async signup(body, response) {
        const requiredFields = [
            "fullName",
            "email",
            "phone",
            "dob",
            "password",
            "role",
            "address",
            "city",
            "province",
        ];
        for (const field of requiredFields) {
            if (!body[field]) {
                throw new common_1.BadRequestException(`Missing required field: ${field}`);
            }
        }
        const result = await this.authService.createUser({
            fullName: String(body.fullName),
            email: String(body.email),
            phone: String(body.phone),
            dob: String(body.dob),
            password: String(body.password),
            role: body.role,
            address: String(body.address),
            city: String(body.city),
            province: String(body.province),
            documents: Array.isArray(body.documents)
                ? body.documents.map((item) => String(item))
                : [],
        });
        response.cookie(session_util_1.SESSION_COOKIE, (0, session_util_1.createSessionToken)(result.session), (0, session_util_1.getSessionCookieOptions)());
        return {
            user: result.user,
            redirectPath: result.redirectPath,
        };
    }
    getSession(request, response) {
        const cookies = (0, session_util_1.parseCookieHeader)(request.headers.cookie);
        const session = (0, session_util_1.readSessionToken)(cookies[session_util_1.SESSION_COOKIE]);
        if (!session) {
            response.status(401);
            return { authenticated: false };
        }
        return {
            authenticated: true,
            user: session,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("login"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("login/verify-2fa"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyTwoFactor", null);
__decorate([
    (0, common_1.Post)("signup"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Get)("session"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getSession", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);

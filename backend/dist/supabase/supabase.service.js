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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
let SupabaseService = class SupabaseService {
    constructor() {
        this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        this.supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        this.supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!this.supabaseUrl) {
            throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
        }
        if (!this.supabaseAnonKey) {
            throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
        }
    }
    createServerClient() {
        return (0, supabase_js_1.createClient)(this.supabaseUrl, this.supabaseAnonKey);
    }
    createAdminClient() {
        if (!this.supabaseServiceRoleKey) {
            throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
        }
        return (0, supabase_js_1.createClient)(this.supabaseUrl, this.supabaseServiceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SupabaseService);

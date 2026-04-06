"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configuredOrigins = process.env.FRONTEND_ORIGIN ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";
    const defaultDevOrigins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
    ];
    const allowedOrigins = Array.from(new Set([
        ...configuredOrigins.split(",").map((value) => value.trim()).filter(Boolean),
        ...defaultDevOrigins,
    ]));
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
            if (isLocalhost) {
                callback(null, true);
                return;
            }
            callback(new Error(`CORS blocked origin: ${origin}`), false);
        },
        credentials: true,
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    });
    app.setGlobalPrefix("api");
    const port = Number(process.env.PORT || 4000);
    await app.listen(port);
}
void bootstrap();

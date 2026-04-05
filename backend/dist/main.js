"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const frontendOrigin = process.env.FRONTEND_ORIGIN ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";
    app.enableCors({
        origin: frontendOrigin.split(",").map((value) => value.trim()),
        credentials: true,
    });
    app.setGlobalPrefix("api");
    const port = Number(process.env.PORT || 4000);
    await app.listen(port);
}
void bootstrap();

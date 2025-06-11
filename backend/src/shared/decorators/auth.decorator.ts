import { applyDecorators, UseGuards } from "@nestjs/common";
import { HttpAuthGuard } from "../guards/http-auth.guard";

export function Authorization() {
    return applyDecorators(UseGuards(HttpAuthGuard));
}
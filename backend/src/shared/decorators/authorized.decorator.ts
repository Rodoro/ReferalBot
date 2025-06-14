import type { User } from "@/prisma/generated";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Authorized = createParamDecorator(
    (data: keyof User, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as User;

        if (!user) {
            throw new Error('Authorized decorator requires AuthGuard');
        }

        return data ? user[data] : user;
    }
);
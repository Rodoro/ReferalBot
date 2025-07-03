import { QrType } from "@/prisma/generated";

export class QrCode {
    id: number;
    type: QrType;
    data: string;
    options: unknown | null;
    createdAt: Date;
}
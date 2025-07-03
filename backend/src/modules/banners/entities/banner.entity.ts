export class Banner {
    id: number;
    imageUrl: string;
    qrTopOffset: number;
    qrLeftOffset: number;
    qrSize: number;
    qrCodeId: number | null;
    qrCode?: {
        id: number;
        type: string;
        data: string;
        options: unknown | null;
    } | null;
    width: number;
    height: number;
    createdAt: Date;
    authorId: number | null;
    author?: {
        user: {
            displayName: string;
        };
    } | null;
}
export interface Banner {
    id: number;
    imageUrl: string;
    qrTopOffset: number;
    qrLeftOffset: number;
    qrSize: number;
    width: number;
    height: number;
    createdAt: string;
    authorId: number | null;
    qrCodeId: number | null;
    qrCode?: {
        id: number;
        type: string;
        data: string;
        options: unknown | null;
    } | null;
    author?: {
        user: {
            displayName: string;
        };
    } | null;
}
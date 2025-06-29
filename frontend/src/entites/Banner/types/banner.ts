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
    author?: {
        user: {
            displayName: string;
        };
    } | null;
}
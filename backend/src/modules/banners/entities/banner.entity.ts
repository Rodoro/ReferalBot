export class Banner {
    id: number;
    imageUrl: string;
    qrTopOffset: number;
    qrLeftOffset: number;
    qrSize: number;
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
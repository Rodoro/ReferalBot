export function convertGoogleDriveLink(url: string): string {
    const match = url.match(/https:\/\/drive\.google\.com\/file\/d\/([a-zA-ZА-Яа-я0-9_-]+)/)
    if (match) {
        const fileId = match[1]
        return `https://drive.google.com/uc?export=download&id=${fileId}`
    }
    return url
}
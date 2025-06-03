export function TypographyH2({ text, className }: { text: string, className?: string }) {
    return (
        <h2 className={className + " scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"} >
            {text}
        </ h2>
    )
}

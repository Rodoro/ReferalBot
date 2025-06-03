export function TypographyH3({ text, className }: { text: string, className?: string }) {
    return (
        <h3 className={className + " scroll-m-20 text-2xl font-semibold tracking-tight"}>
            {text}
        </h3>
    )
}

export function TypographyP({ text, className }: { text: string, className?: string }) {
    return (
        <p dangerouslySetInnerHTML={{ __html: text }} className={className + " leading-7 [&:not(:first-child)]:mt-2"} />
    )
}

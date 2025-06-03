export function TypographyP({ text, className }: { text: string, className?: string }) {
    return (
        <p className={className + " leading-7 [&:not(:first-child)]:mt-6"}>
            {text}
        </p>
    )
}

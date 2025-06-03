import { Skeleton } from '../branding/skeleton'
import { Switch } from '../form/switch'

import { CardContainer } from './CardContainer'

interface ToggleCardProps {
    heading: string
    description: string
    isDisabled?: boolean
    value: boolean
    className?: string
    onChange: (value: boolean) => void
}

export function ToggleCard({
    heading,
    description,
    isDisabled,
    value,
    onChange,
    className
}: ToggleCardProps) {
    return (
        <CardContainer
            className={className}
            heading={heading}
            description={description}
            rightContent={
                <Switch
                    checked={value}
                    onCheckedChange={onChange}
                    disabled={isDisabled}
                />
            }
        />
    )
}

export function ToggleCardSkeleton({ className }: { className?: string }) {
    return <Skeleton className={className + ' h-20 w-full'} />
}

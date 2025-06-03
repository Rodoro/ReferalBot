import type { PropsWithChildren } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../overlay/card'

interface FormWrapperProps {
	heading: string
	className?: string
}

export function FormWrapper({
	children,
	heading,
	className
}: PropsWithChildren<FormWrapperProps>) {
	return (
		<Card className={className}>
			<CardHeader className='px-8'>
				<CardTitle className='text-lg'>{heading}</CardTitle>
			</CardHeader>
			<CardContent className='px-8'>{children}</CardContent>
		</Card>
	)
}

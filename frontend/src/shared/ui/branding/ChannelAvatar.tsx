import { type VariantProps, cva } from 'class-variance-authority'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { cn } from '@/shared/lib/utils/utils'
import { getMediaSource } from '@/shared/lib/utils/get-media-source'


const avatarSizes = cva('', {
	variants: {
		size: {
			sm: 'size-7',
			default: 'size-9',
			lg: 'size-14',
			xl: 'size-32'
		}
	},
	defaultVariants: {
		size: 'default'
	}
})

interface ChannelAvatarProps extends VariantProps<typeof avatarSizes> {
	channel: {
		username: string
		avatar?: string | null
	}
	isLive?: boolean,
}

export function ChannelAvatar({ size, channel, isLive }: ChannelAvatarProps) {
	return (
		<div className='relative'>
			<Avatar
				className={cn(
					avatarSizes({ size }),
					isLive && 'ring-2 ring-rose-500'
				)}
			>
				<AvatarImage
					src={getMediaSource(channel.avatar)}
					className='object-cover'
				/>
				<AvatarFallback
					className={cn(
						size === 'xl' && 'text-4xl',
						size === 'lg' && 'text-2xl'
					)}
				>
					{channel.username[0]}
				</AvatarFallback>
			</Avatar>
		</div>
	)
}

'use client'

import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { qrCodeSchema, QrCodeFormValues } from '@/entites/QrCode/models/schema'
import { mapOptions, defaultQrValues } from '@/entites/QrCode/utils'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form/form'
import { Input } from '@/shared/ui/form/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/form/select'
import { Checkbox } from '@/shared/ui/form/checkbox'

const dotRadius: Record<QrCodeFormValues['dotType'], string> = {
    square: '0%',
    dots: '50%',
    rounded: '20%',
    classy: '20%',
    'classy-rounded': '30%',
    'extra-rounded': '40%',
}

const cornerSquareRadius: Record<QrCodeFormValues['cornersSquareType'], string> = {
    square: '0%',
    dot: '50%',
    'extra-rounded': '30%',
}

const cornerDotRadius: Record<QrCodeFormValues['cornersDotType'], string> = {
    square: '0%',
    dot: '50%',
}

function ShapePreview({ radius }: { radius: string }) {
    return (
        <span className="inline-block w-4 h-4 bg-current" style={{ borderRadius: radius }} />
    )
}

interface BannerQrOptionsProps {
    value: QrCodeFormValues
    onChange: (value: QrCodeFormValues) => void
}

export default function BannerQrOptions({ value, onChange }: BannerQrOptionsProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const qrRef = useRef<QRCodeStyling>(null)
    const updateTimeout = useRef<NodeJS.Timeout>(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<QrCodeFormValues, any, QrCodeFormValues>({
        resolver: zodResolver(qrCodeSchema),
        defaultValues: value,
    })

    useEffect(() => {
        qrRef.current = new QRCodeStyling(mapOptions(form.getValues()))
        if (containerRef.current) qrRef.current.append(containerRef.current)
        const sub = form.watch((v: QrCodeFormValues) => {
            clearTimeout(updateTimeout.current)
            updateTimeout.current = setTimeout(() => {
                onChange(v)
                qrRef.current?.update(mapOptions(v))
            }, 50)
        })
        return () => {
            sub.unsubscribe()
            clearTimeout(updateTimeout.current)
        }
    }, [form, onChange])

    // update the preview when the parent resets values
    useEffect(() => {
        qrRef.current?.update(mapOptions(value))
        // We intentionally avoid calling form.reset on every change to prevent
        // a render loop between this component and its parent. The parent
        // controls the form state, so resetting here would trigger an update
        // which in turn would cause this effect to run again.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return (
        <div className="flex flex-col md:flex-row items-start gap-8 min-w-2xl">
            <Form {...form}>
                <div className="grid gap-4 max-w-md w-80">
                    <FormField
                        control={form.control}
                        name="margin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Отступ</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="dotColor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Цвет точек</FormLabel>
                                    <FormControl>
                                        <Input type="color" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dotType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Форма точек</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="square">
                                                    <div className="flex items-center gap-2">
                                                        <ShapePreview radius={dotRadius.square} />
                                                        square
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="dots">
                                                    <div className="flex items-center gap-2">
                                                        <ShapePreview radius={dotRadius.dots} />
                                                        dots
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="rounded">
                                                    <div className="flex items-center gap-2">
                                                        <ShapePreview radius={dotRadius.rounded} />
                                                        rounded
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="classy">
                                                    <div className="flex items-center gap-2">
                                                        <ShapePreview radius={dotRadius.classy} />
                                                        classy
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="classy-rounded">
                                                    <div className="flex items-center gap-2">
                                                        <ShapePreview radius={dotRadius['classy-rounded']} />
                                                        classy-rounded
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="extra-rounded">
                                                    <div className="flex items-center gap-2">
                                                        <ShapePreview radius={dotRadius['extra-rounded']} />
                                                        extra-rounded
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="backgroundColor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Цвет фона</FormLabel>
                                <FormControl>
                                    <Input type="color" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="cornersSquareColor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Цвет рамки</FormLabel>
                                    <FormControl>
                                        <Input type="color" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="cornersSquareType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Тип рамки</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="square">
                                                    <div className="flex items-center gap-2">
                                                        <ShapePreview radius={cornerSquareRadius.square} />
                                                        square
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="dot">
                                                    <div className="flex items-center gap-2">
                                                        <ShapePreview radius={cornerSquareRadius.dot} />
                                                        dot
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="extra-rounded">
                                                    <div className="flex items-center gap-2">
                                                        <ShapePreview radius={cornerSquareRadius['extra-rounded']} />
                                                        extra-rounded
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="cornersDotColor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Цвет центра</FormLabel>
                                    <FormControl>
                                        <Input type="color" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="cornersDotType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Тип центра</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="square">
                                                    <div className="flex items-center gap-2">
                                                        <ShapePreview radius={cornerDotRadius.square} />
                                                        square
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="dot">
                                                    <div className="flex items-center gap-2">
                                                        <ShapePreview radius={cornerDotRadius.dot} />
                                                        dot
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid gap-4">
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL логотипа</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="imageSize"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Размер логотипа</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" min="0" max="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="imageMargin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Отступ логотипа</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="hideBackgroundDots"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center gap-2">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} id="hide-dots" />
                                    </FormControl>
                                    <FormLabel htmlFor="hide-dots">Скрыть точки под логотипом</FormLabel>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </Form>
            <div ref={containerRef} className="border rounded w-fit" />
        </div>
    )
}

BannerQrOptions.defaultProps = {
    value: defaultQrValues,
}
'use client'

import { useEffect, useRef } from 'react'
import QRCodeStyling, { type Options } from 'qr-code-styling'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { qrCodeSchema, QrCodeFormValues } from '../models/schema'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form/form'
import { Input } from '@/shared/ui/form/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/form/select'
import { Checkbox } from '@/shared/ui/form/checkbox'
import { Button } from '@/shared/ui/form/button'

const defaultValues: QrCodeFormValues = {
    data: '',
    width: 300,
    height: 300,
    type: 'svg',
    margin: 0,
    image: '',
    errorCorrectionLevel: 'M',
    dotColor: '#000000',
    dotType: 'square',
    backgroundColor: '#ffffff',
    cornersSquareType: 'extra-rounded',
    cornersSquareColor: '#000000',
    cornersDotType: 'square',
    cornersDotColor: '#000000',
    imageSize: 0.4,
    imageMargin: 0,
    hideBackgroundDots: false,
    crossOrigin: 'anonymous',
}

function mapOptions(values: QrCodeFormValues): Options {
    return {
        width: values.width,
        height: values.height,
        type: values.type,
        data: values.data,
        margin: values.margin,
        image: values.image || undefined,
        qrOptions: { errorCorrectionLevel: values.errorCorrectionLevel },
        imageOptions: {
            crossOrigin: values.crossOrigin,
            margin: values.imageMargin,
            imageSize: values.imageSize,
            hideBackgroundDots: values.hideBackgroundDots,
        },
        dotsOptions: { color: values.dotColor, type: values.dotType },
        backgroundOptions: { color: values.backgroundColor },
        cornersSquareOptions: {
            type: values.cornersSquareType,
            color: values.cornersSquareColor,
        },
        cornersDotOptions: {
            type: values.cornersDotType,
            color: values.cornersDotColor,
        },
    }
}

export default function QrCodeForm() {
    const containerRef = useRef<HTMLDivElement>(null)
    const qrRef = useRef<QRCodeStyling>(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<QrCodeFormValues, any, QrCodeFormValues>({
        resolver: zodResolver(qrCodeSchema),
        defaultValues,
    })

    useEffect(() => {
        qrRef.current = new QRCodeStyling(mapOptions(form.getValues()))
        if (containerRef.current) qrRef.current.append(containerRef.current)

        const subscription = form.watch((values: QrCodeFormValues) => {
            qrRef.current?.update(mapOptions(values))
        })
        return () => subscription.unsubscribe()
    }, [form])

    function onSubmit(data: QrCodeFormValues) {
        qrRef.current?.update(mapOptions(data))
    }

    return (
        <div className="flex flex-col gap-4">
            <div ref={containerRef} className="border rounded w-fit" />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 max-w-md">
                    <FormField
                        control={form.control}
                        name="data"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Данные</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="width"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ширина</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="height"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Высота</FormLabel>
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
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Тип</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="canvas">canvas</SelectItem>
                                            <SelectItem value="svg">svg</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                    <FormField
                        control={form.control}
                        name="errorCorrectionLevel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Уровень коррекции</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="L">L</SelectItem>
                                            <SelectItem value="M">M</SelectItem>
                                            <SelectItem value="Q">Q</SelectItem>
                                            <SelectItem value="H">H</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                                <SelectItem value="square">square</SelectItem>
                                                <SelectItem value="dots">dots</SelectItem>
                                                <SelectItem value="rounded">rounded</SelectItem>
                                                <SelectItem value="classy">classy</SelectItem>
                                                <SelectItem value="classy-rounded">classy-rounded</SelectItem>
                                                <SelectItem value="extra-rounded">extra-rounded</SelectItem>
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
                                                <SelectItem value="square">square</SelectItem>
                                                <SelectItem value="dot">dot</SelectItem>
                                                <SelectItem value="extra-rounded">extra-rounded</SelectItem>
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
                                                <SelectItem value="square">square</SelectItem>
                                                <SelectItem value="dot">dot</SelectItem>
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
                    <Button type="submit">Обновить</Button>
                </form>
            </Form>
        </div>
    )
}
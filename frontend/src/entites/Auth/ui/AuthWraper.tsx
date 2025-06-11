
import { Button } from "@/shared/ui/form/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/overlay/card";
import Link from "next/link";
import { PropsWithChildren } from "react";

interface AuthWrapperProps {
    heading?: string;
    backButtonLabel?: string
    backButtonHref?: string
}

export default function AuthWrapper({
    children,
    heading,
    backButtonLabel,
    backButtonHref
}: PropsWithChildren<AuthWrapperProps>) {
    return (
        <main className="flex min-h-screen items-center justify-center w-full">
            <Card className="w-[450px]">
                {heading &&
                    <CardHeader className="flex-row items-center justify-center gap-x-4">
                        <CardTitle>{heading}</CardTitle>
                    </CardHeader>
                }
                <CardContent>
                    {children}
                </CardContent>
                <CardFooter className='-mt-2'>
                    {backButtonLabel && backButtonHref && (
                        <Link href={backButtonHref} className='w-full'>
                            <Button variant='ghost' className='w-full'>
                                {backButtonLabel}
                            </Button>
                        </Link>
                    )}
                </CardFooter>
            </Card>
        </main>
    )
}
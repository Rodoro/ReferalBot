import { OutletType } from '../types/sales-outlet'
import { FaUser, FaStore, FaUserTie } from 'react-icons/fa6'
import React from 'react'
import { FaInfoCircle } from 'react-icons/fa';

export function OutletTypeIcon({ type, className }: { type: OutletType; className?: string }) {
    switch (type) {
        case OutletType.SELLER:
            return <FaUserTie className={className} />
        case OutletType.SALES_POINT:
            return <FaStore className={className} />
        case OutletType.USER:
            return <FaUser className={className} />
        case OutletType.INFORMATION_RESOURCE:
            return <FaInfoCircle className={className} />
        default:
            return null
    }
}
export interface LocationInfo {
    country: string
    city: string
    latidute: number
    longidute: number
}

export interface DeviceInfo {
    browser: string
    os: string
    type: string
}

export interface SessionMetadata {
    device: DeviceInfo
    location: LocationInfo
    ip: string
}
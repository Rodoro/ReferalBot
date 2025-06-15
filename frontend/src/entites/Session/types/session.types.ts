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
    location: LocationInfo
    device: DeviceInfo
    ip: string
}

export interface Session {
    id: string
    userId: string
    createdAt: string
    metadata: SessionMetadata
    current?: boolean
}
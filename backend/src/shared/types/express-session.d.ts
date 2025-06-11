import 'express-session'
import type { SessionMetadata } from './session-metadata.types'

declare module 'express-session' {
    interface SessionData {
        staffId?: string
        createdAt?: Date | string
        metadata: SessionMetadata
    }
}

declare module 'express' {
    interface Request {
        user?: Staff;
    }
}
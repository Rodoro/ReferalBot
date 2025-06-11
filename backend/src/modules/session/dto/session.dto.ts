import { ApiProperty } from '@nestjs/swagger';
import { DeviceInfo, LocationInfo, SessionMetadata } from '@/src/shared/types/session-metadata.types';

export class LocationDto implements LocationInfo {
    @ApiProperty({ type: String, description: 'Country name' })
    country: string;

    @ApiProperty({ type: String, description: 'City name' })
    city: string;

    @ApiProperty({ type: Number, description: 'Latitude' })
    latidute: number;

    @ApiProperty({ type: Number, description: 'Longitude' })
    longidute: number;
}

export class DeviceDto implements DeviceInfo {
    @ApiProperty({ type: String, description: 'Browser name' })
    browser: string;

    @ApiProperty({ type: String, description: 'Operating system' })
    os: string;

    @ApiProperty({ type: String, description: 'Device type' })
    type: string;
}

export class SessionMetadataDto implements SessionMetadata {
    @ApiProperty({ type: LocationDto, description: 'Location details' })
    location: LocationDto;

    @ApiProperty({ type: DeviceDto, description: 'Device details' })
    device: DeviceDto;

    @ApiProperty({ type: String, description: 'IP address' })
    ip: string;
}

export class SessionDto {
    @ApiProperty({ type: String, description: 'Session ID' })
    id: string;

    @ApiProperty({ type: String, description: 'User ID' })
    userId: string;

    @ApiProperty({ type: String, description: 'Creation date (ISO string)' })
    createAt: string;

    @ApiProperty({ type: SessionMetadataDto, description: 'Session metadata' })
    metadata: SessionMetadataDto;
}

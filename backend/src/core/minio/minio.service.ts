import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
    private readonly client: Minio.Client;
    private readonly defaultBucket: string;
    private readonly endpoint: string;
    private readonly port: number;
    private readonly useSSL: boolean;
    private readonly bucketCache = new Set<string>();

    constructor(private readonly configService: ConfigService) {
        const endPoint = configService.getOrThrow<string>('MINIO_ENDPOINT');
        const port = Number(configService.getOrThrow<string>('MINIO_PORT'));
        const useSSL = configService.get<string>('MINIO_USE_SSL') === 'true';
        const accessKey = configService.getOrThrow<string>('MINIO_ACCESS_KEY');
        const secretKey = configService.getOrThrow<string>('MINIO_SECRET_KEY');
        this.client = new Minio.Client({ endPoint, port, useSSL, accessKey, secretKey });
        this.defaultBucket = configService.get<string>('MINIO_BUCKET_NAME', { infer: true })
            || 'default';
        this.endpoint = endPoint;
        this.port = port;
        this.useSSL = useSSL;
    }

    async onModuleInit() {
        await this.ensureBucket(this.defaultBucket);
    }

    private async ensureBucket(bucket: string) {
        if (this.bucketCache.has(bucket)) return;
        const exists = await this.client.bucketExists(bucket).catch(() => false);
        if (!exists) {
            await this.client.makeBucket(bucket, '');
        }
        const policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Principal: { AWS: ['*'] },
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${bucket}/*`],
                },
            ],
        };
        await this.client.setBucketPolicy(bucket, JSON.stringify(policy));
        this.bucketCache.add(bucket);
    }

    async upload(file: Express.Multer.File, bucket = this.defaultBucket): Promise<string> {
        await this.ensureBucket(bucket);
        const fileName = `${Date.now()}-${file.originalname}`;
        await this.client.putObject(bucket, fileName, file.buffer, file.size, {
            'Content-Type': file.mimetype,
        });
        const protocol = this.useSSL ? 'https' : 'http';
        return `${protocol}://${this.endpoint}:${this.port}/${bucket}/${fileName}`;
    }
}
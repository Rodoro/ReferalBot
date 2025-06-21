import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AgentResponseDto } from './dto/agent-response.dto';
import { SalesPointResponseDto } from '../sales-point/dto/sales-point-response.dto';

@Injectable()
export class AgentService {
    constructor(private readonly prismaService: PrismaService) { }

    async create(data: CreateAgentDto): Promise<AgentResponseDto> {
        const agent = await this.prismaService.agent.create({
            data: {
                user: { connect: { id: data.userId } },
                fullName: data.fullName,
                city: data.city,
                inn: data.inn,
                phone: data.phone,
                businessType: data.businessType,
                bik: data.bik,
                account: data.account,
                bankName: data.bankName,
                bankKs: data.bankKs,
                bankDetails: data.bankDetails,
                approved: data.approved,
                contractSigned: data.contractSigned,
                referralCode: data.referralCode,
            },
            include: {
                user: true,
            },
        });

        return plainToInstance(AgentResponseDto, {
            ...agent.user,
            ...agent,
        });
    }

    async findAll(): Promise<AgentResponseDto[]> {
        const agents = await this.prismaService.agent.findMany();
        return agents.map((a) => plainToInstance(AgentResponseDto, a));
    }

    async findOne(id: number): Promise<AgentResponseDto> {
        const agent = await this.prismaService.agent.findUnique({ where: { id } });
        if (!agent) {
            throw new NotFoundException('Agent not found');
        }
        return plainToInstance(AgentResponseDto, agent);
    }

    async update(id: number, data: UpdateAgentDto): Promise<AgentResponseDto> {
        const agent = await this.prismaService.agent.update({ where: { userId: id }, data });
        return plainToInstance(AgentResponseDto, agent);
    }

    async remove(id: number): Promise<AgentResponseDto> {
        const agent = await this.prismaService.agent.delete({ where: { id } });
        return plainToInstance(AgentResponseDto, agent);
    }

    async findByReferralCode(code: string): Promise<AgentResponseDto> {
        const agent = await this.prismaService.agent.findUnique({
            where: { referralCode: code },
        });
        if (!agent) {
            throw new NotFoundException('Agent not found');
        }
        return plainToInstance(AgentResponseDto, agent);
    }

    async findSalesPoints(agentId: number) {
        const points = await this.prismaService.salesPoint.findMany({
            where: { agentId: BigInt(agentId) },
        });
        return points.map((p) => plainToInstance(SalesPointResponseDto, p));
    }
}
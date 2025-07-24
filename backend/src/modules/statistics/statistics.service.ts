import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { DailyStatDto } from './dto/daily-stat.dto';
import {
  ArchitectureAgentDto,
  ArchitecturePartnerDto,
  ArchitectureOutletDto,
  ArchitectureUserDto,
} from './dto/architecture.dto';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) { }

  async getDaily(): Promise<DailyStatDto[]> {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT
        CAST(DATE(a."timestamp") AS TEXT) AS date,
        ag."full_name" AS agent_name,
        sp."full_name" AS point_name,
        so."name" AS outlet_name,
        SUM(CASE WHEN a.method = 'user_registered' THEN 1 ELSE 0 END) AS new_clients,
        SUM(CASE WHEN a.method = 'song_generated' THEN 1 ELSE 0 END) AS song_generations,
        SUM(CASE WHEN a.method = 'trial_generation' THEN 1 ELSE 0 END) AS trial_generations,
        SUM(CASE WHEN a.method = 'purchased_generation' THEN 1 ELSE 0 END) AS purchased_songs,
        SUM(CASE WHEN a.method = 'poet_order' THEN 1 ELSE 0 END) AS poem_orders,
        SUM(CASE WHEN a.method = 'video_order' THEN 1 ELSE 0 END) AS video_orders
      FROM actions a
      LEFT JOIN "Agent" ag ON ag.id = a.agent_id
      LEFT JOIN sales_points sp ON sp.id = a.sales_id
      LEFT JOIN sales_outlets so ON so.id = a.outlet_id
      GROUP BY DATE(a."timestamp"), ag."full_name", sp."full_name", so."name"
      ORDER BY DATE(a."timestamp") DESC;
    `);

    return rows.map((r) => ({
      date: r.date,
      agentName: r.agent_name && r.agent_name.trim() !== '' ? r.agent_name : 'Неопределенного',
      pointName: r.point_name && r.point_name.trim() !== '' ? r.point_name : 'Неопределенного',
      outletName: r.outlet_name && r.outlet_name.trim() !== '' ? r.outlet_name : 'Неопределенного',
      newClients: Number(r.new_clients ?? 0),
      songGenerations: Number(r.song_generations ?? 0),
      trialGenerations: Number(r.trial_generations ?? 0),
      purchasedSongs: Number(r.purchased_songs ?? 0),
      poemOrders: Number(r.poem_orders ?? 0),
      videoOrders: Number(r.video_orders ?? 0),
    }));
  }
  async getDailyByAgent(agentId: number): Promise<DailyStatDto[]> {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT
        CAST(DATE(a."timestamp") AS TEXT) AS date,
        ag."full_name" AS agent_name,
        sp."full_name" AS point_name,
        so."name" AS outlet_name,
        SUM(CASE WHEN a.method = 'user_registered' THEN 1 ELSE 0 END) AS new_clients,
        SUM(CASE WHEN a.method = 'song_generated' THEN 1 ELSE 0 END) AS song_generations,
        SUM(CASE WHEN a.method = 'trial_generation' THEN 1 ELSE 0 END) AS trial_generations,
        SUM(CASE WHEN a.method = 'purchased_generation' THEN 1 ELSE 0 END) AS purchased_songs,
        SUM(CASE WHEN a.method = 'poet_order' THEN 1 ELSE 0 END) AS poem_orders,
        SUM(CASE WHEN a.method = 'video_order' THEN 1 ELSE 0 END) AS video_orders
      FROM actions a
      LEFT JOIN "Agent" ag ON ag.id = a.agent_id
      LEFT JOIN sales_points sp ON sp.id = a.sales_id
      LEFT JOIN sales_outlets so ON so.id = a.outlet_id
      WHERE a.agent_id = ${agentId}
      GROUP BY DATE(a."timestamp"), ag."full_name", sp."full_name", so."name"
      ORDER BY DATE(a."timestamp") DESC;
    `);

    return rows.map((r) => ({
      date: r.date,
      agentName: r.agent_name && r.agent_name.trim() !== '' ? r.agent_name : 'Неопределенного',
      pointName: r.point_name && r.point_name.trim() !== '' ? r.point_name : 'Неопределенного',
      outletName: r.outlet_name && r.outlet_name.trim() !== '' ? r.outlet_name : 'Неопределенного',
      newClients: Number(r.new_clients ?? 0),
      songGenerations: Number(r.song_generations ?? 0),
      trialGenerations: Number(r.trial_generations ?? 0),
      purchasedSongs: Number(r.purchased_songs ?? 0),
      poemOrders: Number(r.poem_orders ?? 0),
      videoOrders: Number(r.video_orders ?? 0),
    }));
  }

  async getDailyBySalesPoint(salesId: number): Promise<DailyStatDto[]> {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT
        CAST(DATE(a."timestamp") AS TEXT) AS date,
        ag."full_name" AS agent_name,
        sp."full_name" AS point_name,
        so."name" AS outlet_name,
        SUM(CASE WHEN a.method = 'user_registered' THEN 1 ELSE 0 END) AS new_clients,
        SUM(CASE WHEN a.method = 'song_generated' THEN 1 ELSE 0 END) AS song_generations,
        SUM(CASE WHEN a.method = 'trial_generation' THEN 1 ELSE 0 END) AS trial_generations,
        SUM(CASE WHEN a.method = 'purchased_generation' THEN 1 ELSE 0 END) AS purchased_songs,
        SUM(CASE WHEN a.method = 'poet_order' THEN 1 ELSE 0 END) AS poem_orders,
        SUM(CASE WHEN a.method = 'video_order' THEN 1 ELSE 0 END) AS video_orders
      FROM actions a
      LEFT JOIN "Agent" ag ON ag.id = a.agent_id
      LEFT JOIN sales_points sp ON sp.id = a.sales_id
      LEFT JOIN sales_outlets so ON so.id = a.outlet_id
      WHERE a.sales_id = ${salesId}
      GROUP BY DATE(a."timestamp"), ag."full_name", sp."full_name", so."name"
      ORDER BY DATE(a."timestamp") DESC;
    `);

    return rows.map((r) => ({
      date: r.date,
      agentName: r.agent_name && r.agent_name.trim() !== '' ? r.agent_name : 'Неопределенного',
      pointName: r.point_name && r.point_name.trim() !== '' ? r.point_name : 'Неопределенного',
      outletName: r.outlet_name && r.outlet_name.trim() !== '' ? r.outlet_name : 'Неопределенного',
      newClients: Number(r.new_clients ?? 0),
      songGenerations: Number(r.song_generations ?? 0),
      trialGenerations: Number(r.trial_generations ?? 0),
      purchasedSongs: Number(r.purchased_songs ?? 0),
      poemOrders: Number(r.poem_orders ?? 0),
      videoOrders: Number(r.video_orders ?? 0),
    }));
  }

  async getDailyBySalesOutlet(outletId: number): Promise<DailyStatDto[]> {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT
        CAST(DATE(a."timestamp") AS TEXT) AS date,
        ag."full_name" AS agent_name,
        sp."full_name" AS point_name,
        so."name" AS outlet_name,
        SUM(CASE WHEN a.method = 'user_registered' THEN 1 ELSE 0 END) AS new_clients,
        SUM(CASE WHEN a.method = 'song_generated' THEN 1 ELSE 0 END) AS song_generations,
        SUM(CASE WHEN a.method = 'trial_generation' THEN 1 ELSE 0 END) AS trial_generations,
        SUM(CASE WHEN a.method = 'purchased_generation' THEN 1 ELSE 0 END) AS purchased_songs,
        SUM(CASE WHEN a.method = 'poet_order' THEN 1 ELSE 0 END) AS poem_orders,
        SUM(CASE WHEN a.method = 'video_order' THEN 1 ELSE 0 END) AS video_orders
      FROM actions a
      LEFT JOIN "Agent" ag ON ag.id = a.agent_id
      LEFT JOIN sales_points sp ON sp.id = a.sales_id
      LEFT JOIN sales_outlets so ON so.id = a.outlet_id
      WHERE a.outlet_id = ${outletId}
      GROUP BY DATE(a."timestamp"), ag."full_name", sp."full_name", so."name"
      ORDER BY DATE(a."timestamp") DESC;
    `);

    return rows.map((r) => ({
      date: r.date,
      agentName: r.agent_name && r.agent_name.trim() !== '' ? r.agent_name : 'Неопределенного',
      pointName: r.point_name && r.point_name.trim() !== '' ? r.point_name : 'Неопределенного',
      outletName: r.outlet_name && r.outlet_name.trim() !== '' ? r.outlet_name : 'Неопределенного',
      newClients: Number(r.new_clients ?? 0),
      songGenerations: Number(r.song_generations ?? 0),
      trialGenerations: Number(r.trial_generations ?? 0),
      purchasedSongs: Number(r.purchased_songs ?? 0),
      poemOrders: Number(r.poem_orders ?? 0),
      videoOrders: Number(r.video_orders ?? 0),
    }));
  }

  async getArchitecture(): Promise<ArchitectureAgentDto[]> {
    const agents = await this.prisma.agent.findMany({ orderBy: { fullName: 'asc' } });

    const result: ArchitectureAgentDto[] = [];

    for (const agent of agents) {
      const partners = await this.prisma.salesPoint.findMany({
        where: { agentId: agent.id },
        orderBy: { fullName: 'asc' },
      });

      const partnerDtos: ArchitecturePartnerDto[] = [];
      for (const partner of partners) {
        const outlets = await this.prisma.salesOutlet.findMany({
          where: { partnerId: partner.id },
          orderBy: { name: 'asc' },
        });

        const outletDtos: ArchitectureOutletDto[] = [];
        for (const outlet of outlets) {
          const users = await this.prisma.users.findMany({
            where: { outlet_id: outlet.id },
            select: {
              chat_id: true,
              username: true,
              count_trys_generate_song: true,
              count_trys_generate_chatgpt: true,
            },
            orderBy: { chat_id: 'asc' },
          });

          const userDtos: ArchitectureUserDto[] = [];
          let outletSongGen = 0;
          let outletTextGen = 0;

          for (const u of users) {
            const song = u.count_trys_generate_song ?? 0;
            const text = u.count_trys_generate_chatgpt ?? 0;
            outletSongGen += song;
            outletTextGen += text;
            userDtos.push({
              chatId: u.chat_id.toString(),
              username: u.username ?? null,
              songGenerations: song,
              textGenerations: text,
            });
          }

          outletDtos.push({
            id: outlet.id,
            name: outlet.name,
            verified: outlet.verified,
            users: userDtos,
            userCount: userDtos.length,
            songGenerations: outletSongGen,
            textGenerations: outletTextGen,
          });
        }

        const partnerUserCount = outletDtos.reduce((sum, o) => sum + o.userCount, 0);
        const partnerSongGen = outletDtos.reduce((sum, o) => sum + o.songGenerations, 0);
        const partnerTextGen = outletDtos.reduce((sum, o) => sum + o.textGenerations, 0);

        partnerDtos.push({
          id: partner.id,
          fullName: partner.fullName,
          outlets: outletDtos,
          userCount: partnerUserCount,
          songGenerations: partnerSongGen,
          textGenerations: partnerTextGen,
        });
      }

      const agentUserCount = partnerDtos.reduce((sum, p) => sum + p.userCount, 0);
      const agentSongGen = partnerDtos.reduce((sum, p) => sum + p.songGenerations, 0);
      const agentTextGen = partnerDtos.reduce((sum, p) => sum + p.textGenerations, 0);

      result.push({
        id: agent.id,
        fullName: agent.fullName,
        partners: partnerDtos,
        userCount: agentUserCount,
        songGenerations: agentSongGen,
        textGenerations: agentTextGen,
      });
    }

    return result;
  }

}
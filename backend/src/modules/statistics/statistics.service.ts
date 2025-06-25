import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { DailyStatDto } from './dto/daily-stat.dto';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) { }

  async getDaily(): Promise<DailyStatDto[]> {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT
        CAST(DATE(a."timestamp") AS TEXT) AS date,
        ag."full_name" AS agent_name,
        sp."full_name" AS point_name,
        SUM(CASE WHEN a.method = 'user_registered' THEN 1 ELSE 0 END) AS new_clients,
        SUM(CASE WHEN a.method = 'song_generated' THEN 1 ELSE 0 END) AS song_generations,
        SUM(CASE WHEN a.method = 'trial_generation' THEN 1 ELSE 0 END) AS trial_generations,
        SUM(CASE WHEN a.method = 'purchased_generation' THEN 1 ELSE 0 END) AS purchased_songs,
        SUM(CASE WHEN a.method = 'poet_order' THEN 1 ELSE 0 END) AS poem_orders,
        SUM(CASE WHEN a.method = 'video_order' THEN 1 ELSE 0 END) AS video_orders
      FROM actions a
      LEFT JOIN "Agent" ag ON ag.id = a.agent_id
      LEFT JOIN sales_points sp ON sp.id = a.sales_id
      GROUP BY DATE(a."timestamp"), ag."full_name", sp."full_name"
      ORDER BY DATE(a."timestamp") DESC;
    `);

    return rows.map((r) => ({
      date: r.date,
      agentName: r.agent_name && r.agent_name.trim() !== '' ? r.agent_name : 'Неопределенного',
      pointName: r.point_name && r.point_name.trim() !== '' ? r.point_name : 'Неопределенного',
      newClients: Number(r.new_clients ?? 0),
      songGenerations: Number(r.song_generations ?? 0),
      trialGenerations: Number(r.trial_generations ?? 0),
      purchasedSongs: Number(r.purchased_songs ?? 0),
      poemOrders: Number(r.poem_orders ?? 0),
      videoOrders: Number(r.video_orders ?? 0),
    }));
  }
}
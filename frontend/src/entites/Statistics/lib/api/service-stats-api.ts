// lib/api/service-stats-api.ts

export type DailyStat = {
    date: string;         // ISO-строка даты, например "2025-05-02"
    agentName: string;
    pointName: string;
    newClients: number;
    songGenerations: number;
    trialGenerations: number;
    purchasedSongs: number;
    poemOrders: number;
    videoOrders: number;
};

// Сразу при загрузке модуля генерируем моковые данные
function generateMockDailyStats(): DailyStat[] {
    const agents = [
        "Иванов И.И.",
        "Петров П.П.",
        "Сидоров С.С.",
        "Кузнецов К.К.",
        "Морозов М.М.",
    ];

    // У каждого консультанта 3 «точки»
    const agentPoints: Record<string, string[]> = {
        "Иванов И.И.": ["Точка А1", "Точка А2", "Точка А3"],
        "Петров П.П.": ["Точка Б1", "Точка Б2", "Точка Б3"],
        "Сидоров С.С.": ["Точка С1", "Точка С2", "Точка С3"],
        "Кузнецов К.К.": ["Точка К1", "Точка К2", "Точка К3"],
        "Морозов М.М.": ["Точка М1", "Точка М2", "Точка М3"],
    };

    const startDate = new Date("2025-04-01");
    const endDate = new Date("2025-06-03"); // на текущую дату 2025-06-03
    const oneDay = 24 * 60 * 60 * 1000;
    const result: DailyStat[] = [];

    for (
        let cur = startDate.getTime();
        cur <= endDate.getTime();
        cur += oneDay
    ) {
        const dateStr = new Date(cur).toISOString().slice(0, 10); // YYYY-MM-DD

        for (const agent of agents) {
            for (const point of agentPoints[agent]) {
                // Чтобы было не слишком много строк, иногда пропускаем создание записи
                if (Math.random() < 0.6) {
                    result.push({
                        date: dateStr,
                        agentName: agent,
                        pointName: point,
                        newClients: Math.floor(Math.random() * 11),      // 0–10
                        songGenerations: Math.floor(Math.random() * 31), // 0–30
                        trialGenerations: Math.floor(Math.random() * 11),
                        purchasedSongs: Math.floor(Math.random() * 6),
                        poemOrders: Math.floor(Math.random() * 4),
                        videoOrders: Math.floor(Math.random() * 3),
                    });
                }
            }
        }
    }

    return result;
}

// Генерируем данные один раз:
const mockDailyStats: DailyStat[] = generateMockDailyStats();

/**
 * Симулируем запрос к бэку: отдаём все «сырые» события (DailyStat).
 * В будущем сюда можно добавить фильтрацию по датам, но сейчас
 * мы экспортируем сырые данные, а логику агрегации/фильтрации сделаем на фронте.
 */
export async function getDailyStats(): Promise<DailyStat[]> {
    return Promise.resolve(mockDailyStats);
}

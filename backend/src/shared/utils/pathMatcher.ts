// import { INCLUDED_PATHS } from "@/src/modules/logs-metrics/config/viewLogs";

// export function buildPathConditions(): string {
//     const conditions: string[] = [];

//     for (const path of INCLUDED_PATHS) {
//         if (typeof path === 'string') {
//             conditions.push(`path = '${path}'`);
//         } else {
//             const paramRegex = path.pattern
//                 .replace(/\[([^\]]+)\]/g, '([0-9a-fA-F-]{36}|[0-9]+)')

//             conditions.push(`match(path, '^${paramRegex}$')`);
//         }
//     }

//     const excludedPaths = [
//         '/staff/me',
//         '/staff/profile',
//     ];

//     const exclusionConditions = excludedPaths.map(p => `path != '${p}'`).join(' AND ');

//     return conditions.length > 0
//         ? `(${conditions.join(' OR ')}) AND (${exclusionConditions})`
//         : '1=0';
// }
// Адрес бэкенда. NEXT_PUBLIC_* вшивается в бандл при `next build`, поэтому
// в проде переменную нужно задать до сборки. Обращаться к process.env напрямую
// (не через динамический ключ), иначе Next её не подставит.
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
).replace(/\/+$/, "");

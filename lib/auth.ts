export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "novacriatura01";

export function checkAdminPassword(password?: string): boolean {
    if (!password) return false;
    return password === ADMIN_PASSWORD;
}

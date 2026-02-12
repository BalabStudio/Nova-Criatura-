/**
 * API Service following @[03-integracao_api_skill.md] patterns.
 * Centralizes all communication with the backend.
 */

export interface CardItem {
    id: string;
    title: string;
    subtitle?: string;
    image: string;
    description?: string;
}

export interface Assignment {
    member: string;
    date: string;
    cardId: string;
}

export interface PickResponse {
    assignment: Assignment;
    card: CardItem;
}

export interface ScheduleData {
    date: string;
    weekday: string;
    horario: string;
    funcoes: {
        oracao?: string;
        louvor?: string;
        dinamica?: string;
        visao?: string;
        facilitacao: string;
        oferta?: string;
        comunhao: string[];
    };
}

class ApiService {
    private async handleResponse<T>(res: Response): Promise<T> {
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
        }
        return res.json();
    }

    async pickFunction(member: string, date: string): Promise<PickResponse> {
        const res = await fetch("/api/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ member, date }),
        });
        return this.handleResponse<PickResponse>(res);
    }

    async resetAssignments(password: string): Promise<{ ok: boolean }> {
        const res = await fetch("/api/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });
        return this.handleResponse<{ ok: boolean }>(res);
    }

    async getSchedule(date: string): Promise<ScheduleData> {
        const res = await fetch(`/api/schedule?date=${date}`);
        return this.handleResponse<ScheduleData>(res);
    }
}

export const apiService = new ApiService();

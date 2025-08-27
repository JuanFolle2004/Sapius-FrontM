import api from './api';

// 👇 define the expected shape from GET /dashboard
    export type DashboardResponse = {
    user: {
        id: string;
        email: string;
        name: string;
        lastname: string;
        interests?: string[];
    };
    folders: {
        id: string;
        title: string;
        description?: string;
        createdAt?: string;
        createdBy: string;
        gameIds: string[];
    }[];
    };

    export async function getDashboard(): Promise<DashboardResponse> {
    const res = await api.get('/dashboard'); // calls GET /dashboard
    return res.data as DashboardResponse;
    }

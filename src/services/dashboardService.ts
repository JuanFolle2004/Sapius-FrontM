// src/services/dashboardService.ts
import api from './api';

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
  const res = await api.get('/dashboard');  // ✅ now matches backend
  return res.data as DashboardResponse;
}

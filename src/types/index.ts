export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  birthDate: string;   // ISO date
  name: string;
  lastname: string;
  phone?: string;
  interests?: string[];
}

export interface Folder {
  id: string;
  title: string;
  description?: string;
  prompt?: string;
  createdBy: string;
  createdAt?: string;
  gameIds?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  lastname: string;
  birthDate: string;
  phone?: string;
  interests?: string[];
  playedGameIds?: string[];
}

export interface Game {
  id: string;
  order: number;
  title: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  createdAt: string;   // ISO string from backend
  createdBy: string;
  folderId?: string;   // can be "random"
  topic?: string;
  tags: string[];
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  FolderScreen: { folderId: string };
  GameScreen: {
    gameId: string;
    folderId: string;
    games: Game[];
    currentIndex: number;
  };
  CourseGeneration: undefined;
  Interests: undefined;
};

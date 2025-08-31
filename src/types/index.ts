export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  birthDate: string;
  name: string;
  lastname: string;   // 👈 consistent lowercase
  phone?: string;
  interests?: string[]; // optional
}

export interface Folder {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt?: string;
  parentFolderId?: string;
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
  playedGameIds?: string[];   // ✅ NEW
}

export interface Game {
  id: string;
  order: number;
  title: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  createdAt: string;        // ISO string from backend
  createdBy: string;
  folderId?: string;        // can be "random"
  topic?: string;           // optional
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
    games: Game[];        // ✅ required
    currentIndex: number; // ✅ required
  };
  CourseGeneration: undefined;
  Interests: undefined;
};

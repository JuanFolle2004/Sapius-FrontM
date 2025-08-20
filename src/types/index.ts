export interface LoginResponse { access_token: string; token_type: string; }
export interface RegisterRequest {
  email: string; password: string; birthDate: string; name: string; lastName: string; phone: string;
}

export interface Folder {
  id: string; title: string; description?: string;
  createdBy: string; createdAt: string; parentFolderId?: string;
  gameIds?: string[]; // present in some responses
}

export interface Game {
  id: string; order: number; question: string;
  options: string[]; correctAnswer: string; explanation: string;
  folderId: string; title: string;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  FolderScreen: { folderId: string };
  GameScreen: { gameId: string; folderId: string };
  CourseGeneration: undefined;
};

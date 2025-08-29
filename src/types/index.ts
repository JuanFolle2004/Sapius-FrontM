export interface LoginResponse { 
  access_token: string; 
  token_type: string; 
}

export interface RegisterRequest {
  email: string;
  password: string;
  birthDate: string;
  name: string;
  lastname: string;   // 👈 fixed lowercase
  phone?: string;
  interests?: string[];   // ✅ optional
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

export interface Game {
  id: string;
  order: number;
  title: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  folderId?: string;   
  createdAt: string;
  createdBy: string;
  topic: string;       
  tags: string[];      
}

export interface User {
  id: string;
  email: string;
  name: string;
  lastname: string;   // 👈 consistent with backend
  birthDate: string;
  phone?: string;
  interests?: string[];
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  FolderScreen: { folderId: string };
  GameScreen: {
    gameId: string;
    folderId: string;
    games?: Game[];        // 👈 allow passing the whole list
    currentIndex?: number; // 👈 keep track of current position
  };
  CourseGeneration: undefined;
  Interests: undefined;
};


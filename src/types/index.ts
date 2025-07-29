export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  birthDate: string;
  name: string;
  lastName: string;
  phone: string;
}

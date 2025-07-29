import jwt_decode from 'jwt-decode';

export function decodeToken(token: string): any {
  try {
    return jwt_decode(token);
  } catch (e) {
    console.error("Failed to decode token:", e);
    return null;
 }
}

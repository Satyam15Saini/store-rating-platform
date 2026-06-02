export interface UserSession {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'STORE_OWNER';
  address: string;
  storeId: number | null;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setAuthSession = (token: string, user: UserSession) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getAuthUser = (): UserSession | null => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as UserSession;
  } catch (e) {
    clearAuthSession();
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null && getAuthUser() !== null;
};

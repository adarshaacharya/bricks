export const ACCESS_TOKEN = 'access_token';
export const REFRESH_TOKEN = 'refresh_token';

export const refreshKey = (email: string) => {
  return `user:${email}`;
};

export const ACESS_TOKEN_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
export const REFRESH_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 1000; // 1 hour

export const EMAIL_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours

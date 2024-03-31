export type EnvironmentVariables = {
  DATABASE_URL: string;
  ACCESS_TOKEN_EXPIRATION_TIME: string;
  REFRESH_TOKEN_EXPIRATION_TIME: string;
  ACCESS_TOKEN_JWT_KEY: number;
  REFRESH_TOKEN_JWT_KEY: string;
  SENDGRID_API_KEY: string;
  SENDGRID_SENDER: string;
  S3_ENDPOINT: string;
  S3_ACCESS_KEY: string;
  S3_SECRET_ACCESS_KEY: string;
  S3_REGION: string;
  S3_BUCKET_NAME: string;
};

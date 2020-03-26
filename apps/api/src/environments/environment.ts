export const environment = {
  production: false,
  port: parseInt(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  key: process.env.JWT_KEY || null,
  andesHost: process.env.ANDES_HOST || 'http://localhost:3002',
  snowstorm_host: process.env.SNOWSTORM_HOST || 'http://localhost:8080'
};

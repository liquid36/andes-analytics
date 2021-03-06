export const environment = {
  production: true,
  port: parseInt(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  key: process.env.JWT_KEY || null,
  andesHost: process.env.ANDES_HOST || 'https://app.andes.gob.ar',
  snowstorm_host: process.env.SNOWSTORM_HOST || 'http://localhost:8080',
  db: process.env.ANDES_DB || 'mongodb://localhost:27017/andes'
};

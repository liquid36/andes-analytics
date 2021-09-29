export const environment = {
  production: true,
  ANDES_PROD_DB: process.env.ANDES_PROD_DB,
  ANALYTICS_DB: process.env.ANALYTICS_DB,

  SNOMED_COLLECTION: 'MAIN/ODONTO/NEUQUEN-20210910-1127',
  GOOGLE_KEY: process.env.GOOGLE_KEY,
  SNOWSTORM_HOST: process.env.SNOWSTORM_HOST,
  ELASTICSEARCH_HOST: process.env.ELASTICSEARCH_HOST
};

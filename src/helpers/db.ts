import { Sequelize } from 'sequelize';

const { POSTGRES_USER, POSTGRES_PASSWORD, DB_HOST, DB } = process.env;

if (!POSTGRES_USER || !POSTGRES_PASSWORD || !DB_HOST || !DB)
  throw new Error('Database info not provided.');

/**
 * The main db client instance
 */
const sequelize = new Sequelize(
  `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DB_HOST}:5432/${DB}`
);

const dbConnect = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
};

const dbDisconnect = async () => {
  await sequelize.close();
};

export { sequelize, dbConnect, dbDisconnect };

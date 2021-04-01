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

/**
 * Ensures there's a connection with a db
 */
const dbConnect = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
};

/**
 * Closes db connection
 */
const dbDisconnect = async () => {
  await sequelize.close();
};

export { sequelize, dbConnect, dbDisconnect };

import app from './server';
import { dbConnect } from './helpers/db';
import { populateDb } from './helpers/populateDb';

const PORT = process.env.APP_PORT || 3000;

const main = async () => {
  await dbConnect();
  if (process.env.NODE_ENV === 'development') await populateDb();
  app.listen(PORT, () => console.log(`auth svc running at port ${PORT}`));
};

main();

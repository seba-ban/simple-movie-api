import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import AuthRoute from './routes/auth'
import MoviesRoute from './routes/movies'

const app = express()

// let's add some logging in Apache style
app.use(morgan('common'))
// to set up some headers
app.use(helmet())
// enable cors
app.use(cors())

// set up routers for appropriate paths
app.use('/auth', AuthRoute);
app.use('/movies', MoviesRoute);

// using the error handler from the source repo
app.use((error: Error, _: Request, res: Response, __: NextFunction) => {
  console.error(
    `Error processing request ${error}. See next message for details`
  );
  console.error(error);

  return res.status(500).json({ error: "internal server error" });
});

export default app;
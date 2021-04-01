import express, { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { celebrate, Joi, Segments, isCelebrateError } from 'celebrate';
import { Movie } from '../models/Movie';
import { fetchMovieDetails } from '../helpers/movieApi';
import { authenticate } from '../middlewares/authenticate';
import { User } from '../models/User';
import moment from 'moment';

const router = express.Router();

// Added to have properly typed user on the req.body
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

router.get('/', authenticate(), async (req: Request, res) => {
  const user = req.user;

  // This is added just to ensure Typescript that user is not undefined
  // the authenticate middleware makes sure user is set now on req
  if (!user) return res.sendStatus(500);

  const movies = await Movie.findAll({ where: { UserId: user.getKey('id') } });
  const response = movies.map((movie) => movie.extractInterfaceKeys());

  res.json(response);
});

/**
 * A small middleware to make sure we have the proper body object
 * @returns middleware
 */
const checkBody = () =>
  celebrate({
    [Segments.BODY]: Joi.object({
      title: Joi.string().required().max(500),
    }),
  });

router.post(
  '/',
  express.json(),
  authenticate(),
  checkBody(),
  async (req: Request<{}, {}, { title: string }>, res) => {
    const user = req.user;

    // same comment as in get path
    if (!user) return res.sendStatus(500);

    const userRole = user.getKey('role');

    // if basic user, check registrations for this month
    if (userRole === 'basic') {
      const startOfMonth = moment().startOf('month').hour(0).minute(0).toDate();
      const monthlyLimit = 5;

      const movies = await Movie.findAll({
        where: {
          createdAt: {
            [Op.gte]: startOfMonth,
          },
          UserId: user.getKey('id'),
        },
      });

      // going off limits is a no-no
      if (movies.length >= monthlyLimit)
        return res
          .status(403)
          .json({ error: 'Limit of 5 created movies reached for this month.' });
    }

    // at this point we're sure we can go ahead with
    // creating a new movie
    const { title } = req.body;

    const movieData = await fetchMovieDetails(title);

    if (!movieData) return res.sendStatus(503);

    const movie = await Movie.create({
      ...movieData,
      UserId: user.getKey('id'),
    });

    res.status(201).send(movie.extractInterfaceKeys());
  }
);

// we need to catch the `celebrate` error to send correct message
router.use((err: Error, req: Request, res: Response, done: NextFunction) => {
  if (!isCelebrateError(err)) return done(err);
  return res.sendStatus(400);
});

export default router;

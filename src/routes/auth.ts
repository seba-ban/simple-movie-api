import express, { NextFunction, Request, Response } from 'express';
import { celebrate, Joi, Segments, isCelebrateError } from 'celebrate';
import { AuthError, authFactory } from '../helpers/authFactory';

const { JWT_SECRET } = process.env;

if (!JWT_SECRET)
  throw new Error('Missing JWT_SECRET env var. Set it and restart the server');

const auth = authFactory(JWT_SECRET);

const router = express.Router();

// set up json parser
router.use(express.json());

/**
 * Returns a middleware to check the body object
 * @returns
 */
const checkBody = () =>
  celebrate({
    [Segments.BODY]: Joi.object({
      username: Joi.string().required().max(50),
      password: Joi.string().required().max(50),
    }),
  });

interface AuthorizationReq extends Request {
  body: {
    username: string;
    password: string;
  };
}

router.post('/', checkBody(), async (req: AuthorizationReq, res, next) => {
  const { username, password } = req.body;

  try {
    const token = await auth(username, password);
    return res.status(200).json({ token });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.code).json({ error: error.message });
    }
    next(error);
  }
});

// we need to catch the `celebrate` error to send correct message
router.use((err: Error, req: Request, res: Response, done: NextFunction) => {
  if (!isCelebrateError(err)) return done(err);
  return res.status(400).json({ error: 'invalid payload' });
});

export default router;

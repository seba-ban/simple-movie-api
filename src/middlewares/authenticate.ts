import { Request, Response, NextFunction } from 'express';
import {
  validateJwtPayload,
  verifyToken,
  extractToken,
} from '../helpers/token';
import { User } from '../models/User';

/**
 * A factory for a token authenticating middleware
 * @returns A middleware function
 */
const authenticate = () => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // extract the token from the Authorization header
  const token = extractToken(req);

  // verify the token
  const payload = await verifyToken(token);

  // check the payload
  if (!payload || !validateJwtPayload(payload)) return res.sendStatus(401);

  // find the user
  const user = await User.findOne({ where: { id: payload.userId } });

  if (!user) return res.sendStatus(401);

  // set user on the req object and continue
  req.user = user;
  next();
};

export { authenticate };

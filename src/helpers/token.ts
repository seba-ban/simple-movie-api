import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { Request } from 'express';

const { JWT_SECRET } = process.env;

if (!JWT_SECRET)
  throw new Error('Missing JWT_SECRET env var. Set it and restart the server');

interface TokenPayload {
  userId: number;
  name: string;
  role: 'premium' | 'basic';
}

/**
 * A helper function to validate jwt payload
 * maybe an overkill, but just to be sure we have all the keys we need
 * @param payload
 * @returns boolean indicating if the payload has all necessary keys
 */
const validateJwtPayload = (payload: any) => {
  const schema = Joi.object({
    userId: Joi.number(),
    name: Joi.string().max(30),
    role: Joi.string().valid('premium', 'basic'),
  }).unknown(true);

  const { error } = schema.validate(payload);

  return error ? false : true;
};

/**
 * Verify token using a promise
 * @param token
 * @returns TokenPayload on successful verification, undefined otherwise
 */
const verifyToken = (token: string): Promise<TokenPayload | undefined> =>
  new Promise((resolve) =>
    jwt.verify(
      token,
      JWT_SECRET,
      { issuer: 'https://www.netguru.com/' },
      (err, decoded) => {
        if (err) return resolve(undefined);
        resolve(decoded as TokenPayload);
      }
    )
  );

/**
 * A simple helper function to extract the token
 * from the authorization header
 * @param req Express Request object
 * @returns token string or empty string
 */
const extractToken = (req: Request) =>
  req.headers['authorization']?.replace('Bearer', '').trim() || '';

export { TokenPayload, validateJwtPayload, verifyToken, extractToken };

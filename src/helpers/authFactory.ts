import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { compare } from './hash';

class AuthError extends Error {
  constructor(public message: string, public code: number) {
    super(message);
  }
}

const authFactory = (secret: string) => async (
  username: string,
  password: string
) => {
  const user = await User.findOne({ where: { username } });

  if (!user || !(await compare(password, user.getKey('password')))) {
    throw new AuthError('invalid username or password', 401);
  }

  const id = user.getKey('id');
  const name = user.getKey('name');
  const role = user.getKey('role');

  return jwt.sign(
    {
      userId: id,
      name: name,
      role: role,
    },
    secret,
    {
      issuer: 'https://www.netguru.com/',
      subject: `${id}`,
      expiresIn: 30 * 60,
    }
  );
};

export { authFactory, AuthError };

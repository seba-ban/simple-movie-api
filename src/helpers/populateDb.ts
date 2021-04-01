import { createHash } from '../helpers/hash';
import { User, UserInterface } from '../models/User';

const exampleUsers: UserInterface[] = [
  {
    id: 123,
    role: 'basic',
    name: 'Basic Thomas',
    username: 'basic-thomas',
    password: 'sR-_pcoow-27-6PAwCD8',
  },
  {
    id: 434,
    role: 'premium',
    name: 'Premium Jim',
    username: 'premium-jim',
    password: 'GBLtTyq3E_UNjFnpo9m6',
  },
];

const populateDb = async () => {
  for (const user of exampleUsers) {
    try {
      const hash = await createHash(user.password);
      await User.create({ ...user, password: hash });
    } catch (err) {
      console.error(err)
    }
  }
};

export { populateDb, exampleUsers };

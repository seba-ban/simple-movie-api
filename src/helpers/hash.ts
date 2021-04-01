import bcrypt from 'bcrypt';

const saltRounds = 10;

/**
 * Hashes a password
 * @param password 
 * @returns hashed password
 */
const createHash = (password: string): Promise<string> =>
  new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) return reject(err);

      resolve(hash);
    });
  });

/**
 * Compares a password against a hash
 * @param password 
 * @param hash 
 * @returns Boolean indicating if password matches the hash
 */
const compare = (password: string, hash: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, function (err, result) {
      resolve(result);
    });
  });

export { createHash, compare };

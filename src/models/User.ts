import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../helpers/db';

interface UserInterface {
  id: number;
  role: 'basic' | 'premium';
  name: string;
  username: string;
  password: string;
}

class User extends Model {
  /**
   * Just added quickly to have Typescript support for available keys...
   * @param key
   * @returns underlying data for the key
   */
  getKey<K extends keyof UserInterface>(key: K): UserInterface[K] {
    return super.getDataValue(key);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    role: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize }
);

export { UserInterface, User };

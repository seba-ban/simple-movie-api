import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../helpers/db';
import { User } from './User';

interface MovieInterface {
  title: string;
  released: Date;
  genre: string;
  director: string;
}

class Movie extends Model {
  /**
   * Just added quickly to have Typescript support for available keys...
   * @param key
   * @returns underlying data for the key
   */
  getKey<K extends keyof MovieInterface>(key: K): MovieInterface[K] {
    return super.getDataValue(key);
  }

  /**
   * A helper function which picks only the data we need from the object
   * @returns MovieInterface
   */
  extractInterfaceKeys(): MovieInterface {
    return {
      title: this.getKey('title'),
      released: this.getKey('released'),
      genre: this.getKey('genre'),
      director: this.getKey('director'),
    };
  }
}

Movie.init(
  {
    title: { type: DataTypes.STRING, allowNull: false },
    released: { type: DataTypes.DATEONLY, allowNull: false },
    genre: { type: DataTypes.STRING, allowNull: false },
    director: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize }
);

Movie.belongsTo(User);

export { MovieInterface, Movie };

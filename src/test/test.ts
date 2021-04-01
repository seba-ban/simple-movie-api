import 'mocha';
import { expect } from 'chai';
import axios from 'axios';
import { promisify } from 'util';
import { fetchMovieDetails } from '../helpers/movieApi';
import { populateDb, exampleUsers } from '../helpers/populateDb';

const sleep = promisify(setTimeout);

const PORT = process.env.APP_PORT || 3000;

// values for testing

const titles = [
  'Pulp Fiction',
  'Reservoir Dogs',
  'Kill Bill: Vol. 1',
  'Django',
  'Inglourious Basterds',
  'Sin City',
];

const movies = getMovies();

/**
 * axios instance to make api calls
 */
const api = axios.create({
  baseURL: `http://app:${PORT}`,
  validateStatus: (status) => {
    return true;
  },
  timeout: 2000,
});

// TEST SUITE

describe('Testing auth svc', () => {
  // we need to wait for api to be available
  // since we have axios instance set up not to throw errors on any http code,
  // all the errors we might encounter are connection related;
  // so not throwing an error on any path means we can start the tests
  before(async () => {
    const checkIfApiAvailable = async () => {
      try {
        await api.post('/auth');
        return true;
      } catch (err) {
        return false;
      }
    };

    let apiAvailable = false;
    let retries = 0;

    console.log(`Waiting for the api to start listening on port ${PORT}.`);

    while (!apiAvailable) {
      await sleep(250);
      apiAvailable = await checkIfApiAvailable();
      retries++;
      if (retries === 50) {
        console.error('Not able to connect to the api.');
        process.exit(1);
      }
    }

    // and let's add the user's to the db
    await populateDb();
  });

  // we need to store the tokens returned (hopefully) by the server
  let basicToken: string;
  let premiumToken: string;

  describe('Testing /auth post', () => {
    it('should send back a token for basic user', async () => {
      const user = exampleUsers.find((u) => u.role === 'basic');
      const res = await api.post<{ token: string }>('/auth', {
        username: user?.username,
        password: user?.password,
      });

      const { data } = res;

      expect(res.status).to.equal(200);
      expect(data).to.have.property('token');
      expect(data.token).to.be.a('string');

      basicToken = data.token;
    });

    it('should send back a token for premium user', async () => {
      const user = exampleUsers.find((u) => u.role === 'premium');
      const res = await api.post<{ token: string }>('/auth', {
        username: user?.username,
        password: user?.password,
      });

      const { data } = res;

      expect(res.status).to.equal(200);
      expect(data).to.have.property('token');
      expect(data.token).to.be.a('string');

      premiumToken = data.token;
    });

    it('should send 400 with `invalid payload` error when body is incorrect', async () => {
      const res = await api.post<{ error: string }>('/auth', {
        definitelyNotUsername: 'ddd',
        passworda: 'aaa',
      });

      const { data } = res;

      expect(res.status).to.equal(400);
      expect(data).to.have.property('error');
      expect(data.error).to.equal('invalid payload');
    });

    it('should send 401 with `invalid username or password` error when credentials incorrect', async () => {
      const user = exampleUsers.find((u) => u.role === 'premium');
      const res = await api.post<{ error: string }>('/auth', {
        username: user?.username,
        password: user?.password.toUpperCase(),
      });

      const { data } = res;

      expect(res.status).to.equal(401);
      expect(data).to.have.property('error');
      expect(data.error).to.equal('invalid username or password');
    });
  });

  describe('Testing /movies post', () => {
    /**
     * A helper function to create movies
     * @param token
     * @param start start index of the titles array
     * @param stop stop index
     * @param code expected return code
     * @param dataEqual what res.data is expected to be
     */
    const createMovies = async (
      token: string,
      start: number,
      stop: number,
      code = 201,
      dataEqual?: object
    ) => {
      for (let i = start; i < stop; i++) {
        const title = titles[i];
        const res = await api.post<{ token: string }>(
          '/movies',
          { title },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { data } = res;

        expect(res.status).to.equal(code);
        expect(data).to.be.deep.equal(dataEqual || movies[i]);
      }
    };

    it('should create movies for basic user', async () => {
      // we'll create five movies to hit the limit
      await createMovies(basicToken, 0, 5);
    });

    it('should create movies for premium user', async () => {
      await createMovies(premiumToken, 0, 5);
    });

    it('should return 403 after basic user hits the limit of monthly registrations', async () => {
      await createMovies(basicToken, 5, 6, 403, {
        error: 'Limit of 5 created movies reached for this month.',
      });
    });

    it('should create movies for premium user after five registrations', async () => {
      await createMovies(premiumToken, 5, 6);
    });

    it('should return 400 when body is incorrect', async () => {
      const movieTitle = titles[0];
      const res = await api.post<{ token: string }>(
        '/movies',
        { movieTitle },
        { headers: { Authorization: `Bearer ${premiumToken}` } }
      );
      expect(res.status).to.equal(400);
    });

    it('should return 401 when user is not authorized', async () => {
      const title = titles[0];
      const res = await api.post<{ token: string }>(
        '/movies',
        { title },
        { headers: { Authorization: `Bearer ${premiumToken.slice(1)}` } }
      );
      expect(res.status).to.equal(401);
    });
  });

  describe('Testing /movies get', () => {
    it('should return movies for basic user', async () => {
      const { status, data } = await api.get('/movies', {
        headers: { Authorization: `Bearer ${basicToken}` },
      });

      expect(status).to.be.equal(200);
      expect(data).to.be.deep.equal(movies.slice(0, 5));
    });
    it('should return movies for premium user', async () => {
      const { status, data } = await api.get('/movies', {
        headers: { Authorization: `Bearer ${premiumToken}` },
      });

      expect(status).to.be.equal(200);
      expect(data).to.be.deep.equal(movies);
    });

    it('should return 401 when user not authorized', async () => {
      const { status } = await api.get('/movies', {
        headers: { Authorization: `Bearer ${premiumToken.slice(1)}` },
      });

      expect(status).to.be.equal(401);
    });
  });

  describe('Testing omdbapi.com client', async () => {
    const movieData = await fetchMovieDetails(titles[4]);

    expect(movieData).to.be.deep.equal(movies[4]);
  });
});

/**
 * Returns an array of expected objects corresponding
 * to the titles in the titles array
 * refactored to a function just to not have a long array on top of the file
 * @returns
 */
function getMovies() {
  return [
    {
      title: 'Pulp Fiction',
      released: '1994-10-14',
      genre: 'Crime, Drama',
      director: 'Quentin Tarantino',
    },
    {
      title: 'Reservoir Dogs',
      released: '1992-09-02',
      genre: 'Crime, Drama, Thriller',
      director: 'Quentin Tarantino',
    },
    {
      title: 'Kill Bill: Vol. 1',
      released: '2003-10-10',
      genre: 'Action, Crime, Drama, Thriller',
      director: 'Quentin Tarantino',
    },
    {
      title: 'Django',
      released: '1966-12-01',
      genre: 'Action, Western',
      director: 'Sergio Corbucci',
    },
    {
      title: 'Inglourious Basterds',
      released: '2009-08-21',
      genre: 'Adventure, Drama, War',
      director: 'Quentin Tarantino',
    },
    {
      title: 'Sin City',
      released: '2005-04-01',
      genre: 'Crime, Thriller',
      director: 'Frank Miller, Quentin Tarantino, Robert Rodriguez',
    },
  ].map((movie) => JSON.parse(JSON.stringify(movie)));
}

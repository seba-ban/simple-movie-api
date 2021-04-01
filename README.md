# Node.js recruitment task

This is a simple movie API. OpenApi spec as `json` and `yaml` is in `api` folder, also available on [swaggerhub](https://app.swaggerhub.com/apis-docs/sebaban/movies/1.0.0-oas3).

`Github Actions` are used for CI/CD pipeline.

## Run the app

Few environment variables are needed to run the app properly. 
They are taken from `.env.dev` file in the root directory. There's a `.env.dev.example` file listing all the variables needed. All are set to defaults I was using during dev, except for the API key for https://omdbapi.com/ (following the rule to not add private keys to public repositories).

Long story short: 
- rename `.env.dev.example` to `.env.dev`
- paste a valid `omdbapi` key to  `.env.dev`

### `npm` scripts

`npm run dev` - runs a development environment using `docker-compose`, `concurrently`, `nodemon`, and `typescript`

`npm test` - used to run local tests, it uses a short shell script which calls `docker-compose`

## Dockerfiles

`Dockerfile.dev` is used to make a development image and is used by `npm run dev` script. `Dockerfile`, on the other hand, can be used to build a more production ready image with typescript compiled to javascript, without source files and dev dependencies. 
```
docker image build -t simple-movie-api:1.0.0 .
```
The problem is we need to populate the database, as we even don't have a registration endpoint for users. Assuming you have a `.env` file, you can run:

```
docker container run --name some-postgres --env-file .env -p 5432:5432 postgres
```

```
POSTGRES_USER=movies POSTGRES_PASSWORD=password DB_HOST=localhost DB=movies NODE_POPULATE_DB=true ts-node src/helpers/populateDb.ts
```
After that you can run:

```
docker container run -p 3000:3000 --env-file .env --name simple-movie-api simple-movie-api:1.0.0
```

You should be able now to `curl` `localhost:3000` (or any other port you specified):

```
curl --location --request POST 'localhost:3000/auth' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "basic-thomas",
    "password": "sR-_pcoow-27-6PAwCD8"
}'
```

---

# Original Instructions

We'd like you to build a simple Movie API. It should provide two endpoints:

1. `POST /movies`
   1. Allows creating a movie object based on movie title passed in the request body
   2. Bade on title additional movie details should be fetched from
      https://omdbapi.com/ and saved to the database. Data we would like you to
      fetch from OMDb API:
   ```
     Title: string
     Released: date
     Genre: string
     Directory: string
   ```
   3. Only authorized users can create a movie.
   4. `Basic` users are restricted to create a 5 movies per month (calendar
      month). `Premium` users have no limits.
1. `GET /movies`
   1. Should fetch a list of all movies created by an authorized user.

⚠️ Don't forget to verify user's authorization token before processing the
request. The token should be passed in request's `Authorization` header.

```
Authorization: Bearer <token>
```

# Authorization service

To authorize users please use our simple auth service based on JWT tokens.
Auth service code is located under `./src` directory

## Prerequisites

You need to have `docker` and `docker-compose` installed on your computer to run the service

## Run locally

1. Clone this repository
1. Run from root dir

```
JWT_SECRET=secret docker-compose up -d
```

By default the auth service will start on port `3000` but you can override
the default value by setting the `APP_PORT` env var

```
APP_PORT=8081 JWT_SECRET=secret docker-compose up -d
```

To stop the authorization service run

```
docker-compose down
```

## JWT Secret

To generate tokens in auth service you need to provide env variable
`JWT_SECRET`. It should be a string value. You should use the same secret in
the API you're building to verify the JWT tokens.

## Users

The auth service defines two user accounts that you should use

1. `Basic` user

```
 username: 'basic-thomas'
 password: 'sR-_pcoow-27-6PAwCD8'
```

1. `Premium` user

```
username: 'premium-jim'
password: 'GBLtTyq3E_UNjFnpo9m6'
```

## Token payload

Decoding the auth token will give you access to basic information about the
user including its role.

```
{
  "userId": 123,
  "name": "Basic Thomas",
  "role": "basic",
  "iat": 1606221838,
  "exp": 1606223638,
  "iss": "https://www.netguru.com/",
  "sub": "123"
}
```

## Example request

To authorize user call the auth service using for example `curl`. We assume
that the auth service is running of the default port `3000`.

Request

```
curl --location --request POST '0.0.0.0:3080/auth' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "basic-thomas",
    "password": "sR-_pcoow-27-6PAwCD8"
}'
```

Response

```
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywibmFtZSI6IkJhc2ljIFRob21hcyIsInJvbGUiOiJiYXNpYyIsImlhdCI6MTYwNjIyMTgzOCwiZXhwIjoxNjA2MjIzNjM4LCJpc3MiOiJodHRwczovL3d3dy5uZXRndXJ1LmNvbS8iLCJzdWIiOiIxMjMifQ.KjZ3zZM1lZa1SB8U-W65oQApSiC70ePdkQ7LbAhpUQg"
}
```

## Rules

- Database and framework choice are on your side.
- Your API has to be dockerized. Create `Dockerfile` and `docker-compose` and document the process of running it locally.
- Test your code.
- Provide documentation of your API.
- Application should be pushed to the public git repository and should have a
  working CI/CD pipeline that runs the tests. For example you can use GitHub
  Actions or CircleCI. Create a sample PR to show us the working CI/CD pipeline.

## What will be evaluated?

- Task completeness
- Architecture
- Code quality
- Tests quality
- Database design
- Technology stack

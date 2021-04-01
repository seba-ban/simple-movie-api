#!/bin/sh

TEST_COMPOSE_FILE=docker-compose.test.yml
ENV_FILE=.env.dev

docker-compose --env-file $ENV_FILE -f $TEST_COMPOSE_FILE build
docker-compose --env-file $ENV_FILE -f $TEST_COMPOSE_FILE run test
EXIT_CODE=$?
docker-compose down
exit $EXIT_CODE
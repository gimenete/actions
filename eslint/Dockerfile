FROM node:10-slim

LABEL com.github.actions.name="ESLint"
LABEL com.github.actions.description=""
LABEL com.github.actions.icon="code"
LABEL com.github.actions.color="yellow"
LABEL repository=""
LABEL maintainer="Alberto Gimeno <gimenete@gmail.com>"

COPY lib /action/lib
ENTRYPOINT ["/action/lib/entrypoint.sh"]

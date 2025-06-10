FROM node:20.18.1-alpine as base

WORKDIR /src
# install git for certain dependencies
RUN apk add git

# Install pnpm
RUN npm install -g pnpm

# Copy all files
COPY . .

# Expose port
EXPOSE 4000

# Install dependencies and build the project
RUN pnpm install  && pnpm add -D @types/lodash
RUN pnpm run build

# FROM base as test
CMD ["pnpm", "start"]
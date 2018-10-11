# Build stage image
# Pulls all dependencies including dev and builds
# server runtime
FROM node:carbon as build

RUN mkdir /app
WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY Gruntfile.js /app/Gruntfile.js
COPY tsconfig.json /app/tsconfig.json
COPY ./src /app/src
WORKDIR /app
RUN npm install && npm run build

# Vendor stage image
# Pull only runtime dependencies
FROM node:carbon as vendor
RUN mkdir /app
WORKDIR  /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install --production

# Minimal runtime image with runtime only
# dependencies
FROM gcr.io/distroless/nodejs

# Copy production /app directory from vendor stage
COPY --from=vendor /app /app
# Copy results of build from build stage
COPY --from=build /app/lib /app/lib
EXPOSE 3000
CMD [ "/app/node_modules/.bin/micro", "/app/lib/index.js" ]
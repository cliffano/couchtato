FROM node:10.13.0-alpine
WORKDIR /couchtato
COPY . .
RUN npm install -g bob \
  && bob rmdep dep \
  && bob build \
  && rm -rf .bob \
  && npm remove -g bob \
  && npm install -g /couchtato \
  && addgroup -g 1001 -S couchtato \
  && adduser -u 1001 -S couchtato -G couchtato
USER couchtato:couchtato
WORKDIR /
CMD ["couchtato"]

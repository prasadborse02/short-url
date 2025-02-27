module.exports = {
  apps: [
    {
      name: "shortUrlService",
      script: "index.js",
      env: {
        PORT: 3000,
        HOST: "0.0.0.0",
        REDIS_HOST: "localhost",
        REDIS_PORT: 6379,
        URL_LENGTH: 6,
        MYSQL_HOST: "localhost",
        MYSQL_PORT: 3307,
        MYSQL_USER: "urlshortener_app",
        MYSQL_PASSWORD: "password",
        MYSQL_DATABASE: "url_shortener",
        MYSQL_DIALECT: "mysql",
        KAFKA_BROKER: "localhost:9092",
        KAFKA_CLIENT_ID: "url-shortener",
        KAFKA_GROUP_ID: "url-shortener-group",
        KAFKA_TOPIC: "click-events"
      }
    }
  ]
};


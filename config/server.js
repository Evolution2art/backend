module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  app: {
    keys: [env("APP_KEY")],
  },
  url: env(
    "STRAPI_URL",
    "http://" + env("HOST", "0.0.0.0") + ":" + env.int("PORT", 1337)
  ),
});

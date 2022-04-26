module.exports = ({ env }) => ({
  apiToken: {
    salt: env("API_TOKEN_SALT"),
  },
  auth: {
    secret: env("ADMIN_JWT_SECRET"),
  },
  url: env(
    "STRAPI_ADMIN_URL",
    env(
      "STRAPI_URL",
      "http://" + env("HOST", "0.0.0.0") + ":" + env.int("PORT", 1337)
    ) + "/admin"
  ),
});

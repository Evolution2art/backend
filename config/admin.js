module.exports = ({ env }) => ({
  apiToken: {
    salt: env("API_TOKEN_SALT", "0b7af7c8a258414c99bd92f9d967fcf5"),
  },
  auth: {
    secret: env("ADMIN_JWT_SECRET", "7186d7f6-82d9-48c0-902c-a9b433d3a45a"),
  },
});

module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  app: {
    keys: [env("ADMIN_JWT_SECRET", "3d410da9-e1ba-4341-9b31-ca485071781f")],
  },
});

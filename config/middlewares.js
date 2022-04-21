module.exports = [
  "strapi::errors",
  "strapi::security",
  {
    name: "strapi::cors",
    config: {
      origin: [
        "http://localhost",
        "http://localhost:1337",
        "http://localhost:3000",
        "http://localhost:8000",
        "https://evolution2art.com",
        "https://www.evolution2art.com",
        "https://new.evolution2art.com",
      ],
    },
  },
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];

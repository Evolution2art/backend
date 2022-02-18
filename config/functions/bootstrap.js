'use strict';

const fs = require("fs");
const path = require("path");

const {
  categories,
  countries,
  destinations,
  rates,
  packages,
  qualities,
  fossils
} = require("../../data/data");

const findPublicRole = async () => {
  const result = await strapi
    .query("role", "users-permissions")
    .findOne({
      type: "public"
    });
  return result;
};

const setDefaultPermissions = async () => {
  const role = await findPublicRole();
  const permissions_applications = await strapi
    .query("permission", "users-permissions")
    .find({
      type: "application",
      role: role.id
    });
  await Promise.all(
    permissions_applications.map(p =>
      strapi
        .query("permission", "users-permissions")
        .update({
          id: p.id
        }, {
          enabled: true
        })
    )
  );
};

const isFirstRun = async () => {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: "type",
    name: "setup"
  });
  const initHasRun = await pluginStore.get({
    key: "initHasRun"
  });
  await pluginStore.set({
    key: "initHasRun",
    value: true
  });
  return !initHasRun;
};

const getFilesizeInBytes = filepath => {
  var stats = fs.statSync(filepath);
  var fileSizeInBytes = stats["size"];
  return fileSizeInBytes;
};

const createSeedData = async (files) => {

  const handleFiles = (data) => {

    var file = files.find(x => x.includes(data.slug));
    file = `./data/uploads/${file}`;

    const size = getFilesizeInBytes(file);
    const array = file.split(".");
    const ext = array[array.length - 1]
    const mimeType = `image/.${ext}`;
    const image = {
      path: file,
      name: `${data.slug}.${ext}`,
      size,
      type: mimeType
    };
    return image
  }

  /* Models without relation data */
  const categoriesPromises = categories.map(({
    ...rest
  }) => {
    return strapi.services.category.create({
      ...rest
    });
  });

  const destinationPromises = destinations.map(({
    ...rest
  }) => {
    return strapi.services.destination.create({
      ...rest
    });
  });

  const packagePromises = packages.map(({
    ...rest
  }) => {
    return strapi.services.package.create({
      ...rest
    });
  });

  /* Models with relations */
  const countryPromises = countries.map(({
    ...rest
  }) => {
    return strapi.services.country.create({
      ...rest
    });
  });

  const ratePromises = rates.map(({
    ...rest
  }) => {
    return strapi.services.rate.create({
      ...rest
    });
  });

  const qualityPromises = qualities.map(({
    ...rest
  }) => {
    return strapi.services.quality.create({
      ...rest
    });
  });

  const fossilsPromises = fossils.map(async fossil => {
    const image = handleFiles(fossil)

    const files = {
      image
    };

    try {
      const entry = await strapi.query('fossil').create(fossil);

      if (files) {
        await strapi.entityService.uploadFiles(entry, files, {
          model: 'fossil'
        });
      }
    } catch (e) {
      console.log(e);
    }

  });

  await Promise.all(categoriesPromises);
  await Promise.all(destinationPromises);
  await Promise.all(packagePromises);
  await Promise.all(countryPromises);
  await Promise.all(ratePromises);
  await Promise.all(qualityPromises);
  await Promise.all(fossilsPromises);
};

module.exports = async () => {
  const shouldSetDefaultPermissions = await isFirstRun();
  if (shouldSetDefaultPermissions) {
    try {
      console.log("Setting up your starter...");
      const files = fs.readdirSync(`./data/uploads`);
      await setDefaultPermissions();
      await createSeedData(files);
      console.log("Ready to go");
    } catch (e) {
      console.log(e);
    }
  }
};

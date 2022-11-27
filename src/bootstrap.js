"use strict";

const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const set = require("lodash.set");

const fetch = require("node-fetch");

const about = require("../data/about");
const contact = require("../data/contact");
const history = require("../data/history");
const introduction = require("../data/introduction");
const press = require("../data/press");
const mailTemplates = require("../data/mail-templates");
const achievements = require("../data/achievements");
const medias = require("../data/medias");
const categories = require("../data/categories");
const destinations = require("../data/destinations");
const packages = require("../data/packages");
const qualities = require("../data/qualities");
const countries = require("../data/countries");
const rates = require("../data/rates");
const fossils = require("../data/fossils");
const uploads = require("../data/files");

const FILE_DOWNLOAD_HOST = "https://backend.evolution2art.com";
const FILE_STORAGE_PATH = "./data/uploads";

async function setPublicPermissions(newPermissions) {
  // Find the ID of the public role
  const publicRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({
      where: {
        type: "public",
      },
    });

  // Create the new permissions and link them to the public role
  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query("plugin::users-permissions.permission").create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: "type",
    name: "setup",
  });
  const initHasRun = await pluginStore.get({ key: "initHasRun" });
  await pluginStore.set({ key: "initHasRun", value: true });
  return !initHasRun;
}

function getFileSizeInBytes(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats["size"];
  return fileSizeInBytes;
}

function getFileData(fileName) {
  const filePath = `${FILE_STORAGE_PATH}/${fileName}`;

  if (!fs.existsSync(filePath)) {
    return;
  }

  // Parse the file metadata
  const size = getFileSizeInBytes(filePath);
  const ext = fileName.split(".").pop();
  const mimeType = mime.lookup(ext);

  return {
    path: filePath,
    name: fileName,
    size,
    type: mimeType,
  };
}

// Create an entry and attach files if there are any
async function createEntry({ model, entry, files }) {
  // console.log(`Creating entry for ${model}`, entry, files);
  try {
    if (files) {
      for (const [key, fileOrFiles] of Object.entries(files)) {
        if (key && typeof entry[key] !== "undefined") {
          delete entry[key];
        }
        if (typeof fileOrFiles !== "undefined") {
          const all = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
          await Promise.all(
            all.map(async (file) => {
              if (file) {
                // Get file name without the extension
                const [fileName] = file.name?.split(".");
                // Upload each individual file
                const uploadedFile = await strapi
                  .plugin("upload")
                  .service("upload")
                  .upload({
                    files: file,
                    data: {
                      fileInfo: {
                        alternativeText: fileName,
                        caption: fileName,
                        name: fileName,
                      },
                    },
                  });

                // Attach each file to its entry
                if (Array.isArray(fileOrFiles)) {
                  if (!Array.isArray(entry[key])) {
                    set(entry, key, []);
                  }
                  entry[key].push(uploadedFile[0].id);
                } else {
                  set(entry, key, uploadedFile[0].id);
                }
              }
            })
          );
        }
      }
    }

    console.log(`Try to create entry for model ${model}`, entry, files);

    // Actually create the entry in Strapi
    const createdEntry = await strapi.entityService.create(
      `api::${model}.${model}`,
      {
        data: entry,
      }
    );
  } catch (e) {
    console.log(`Error creating model ${model}`, entry, e);
  }
}

async function importEntry(name, entry, fileFields) {
  // eg files: ["gallery", "iconDark"]
  // const entry = about
  console.log(`importing entry type ${name}`, entry, fileFields);
  const files = {};
  if (Array.isArray(fileFields)) {
    for (const key of fileFields) {
      if (typeof entry[key] !== "undefined") {
        Object.assign(files, {
          [key]: Array.isArray(entry[key])
            ? entry[key].map((gal) =>
                getFileData(`${gal.replace(/_[a-f0-9]{10}/, "")}`)
              )
            : getFileData(`${entry[key].replace(/_[a-f0-9]{10}/, "")}`),
        });
      }
    }
  }
  return createEntry({
    model: name,
    entry,
    files,
  });
}

async function importSingleTypes() {
  return Promise.all([
    importEntry("about", about, ["gallery"]),
    importEntry("contact", contact, ["background"]),
    importEntry("history", history, ["gallery"]),
    importEntry("introduction", introduction, ["background", "backgroundDark"]),
    importEntry("press", press, ["gallery"]),
    importEntry("mail-template", mailTemplates),
  ]);
}

async function importAchievements() {
  console.log(`importing ${achievements.length} achievements`);
  return Promise.all(
    achievements.map((achievement) => {
      return importEntry("achievement", achievement, ["gallery"]);
      // const files = achievement.gallery?.length
      //   ? {
      //       gallery: achievement.gallery.map((gal) => getFileData(`${gal}`)),
      //     }
      //   : null;
      // return createEntry({
      //   model: "achievement",
      //   entry: achievement,
      //   files,
      // });
    })
  );
}

async function importMedias() {
  console.log(`importing ${medias.length} medias`);
  return Promise.all(
    medias.map((media) => {
      return importEntry("media", media, ["gallery"]);
      // const files = media.gallery?.length
      //   ? {
      //       gallery: media.gallery.map((gal) => getFileData(`${gal}`)),
      //     }
      //   : null;
      // return createEntry({
      //   model: "media",
      //   entry: media,
      //   files,
      // });
    })
  );
}

async function importCategories() {
  console.log(`importing ${categories.length} categories`);
  return Promise.all(
    categories.map((category) => {
      return importEntry("category", category, ["icon", "iconDark"]);
      // const files = {
      //   icon: getFileData(`${category.slug}-light.png`),
      //   iconDark: getFileData(`${category.slug}-dark.png`),
      // };
      // return createEntry({
      //   model: "category",
      //   entry: category,
      //   files,
      // });
    })
  );
}

async function importDestinations() {
  console.log(`importing ${destinations.length} destinations`);
  return Promise.all(
    destinations.map((destination) => {
      return importEntry("destination", destination);
    })
  );
}

async function importPackages() {
  console.log(`importing ${packages.length} packages`);
  return Promise.all(
    packages.map((pkg) => {
      return importEntry("package", pkg);
    })
  );
}

async function importQualities() {
  console.log(`importing ${qualities.length} qualities`);
  return Promise.all(
    qualities.map((quality) => {
      return importEntry("quality", quality);
    })
  );
}

async function importCountries() {
  console.log(`importing ${countries.length} countries`);
  return Promise.all(
    countries.map((country) => {
      return importEntry("country", country);
    })
  );
}

async function importRates() {
  console.log(`importing ${rates.length} rates`);
  return Promise.all(
    rates.map((rate) => {
      return importEntry("rate", rate);
    })
  );
}

async function downloadFile(url, path) {
  const res = await fetch(url);
  // const filePath = path.replace(/_[a-f0-9]{10}/, "");
  console.log(`Downloading image from ${url} to ${path}`);

  const fileStream = fs.createWriteStream(path);
  return new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
}

async function copyFiles() {
  return Promise.all(
    uploads
      .filter(
        (_file) =>
          !fs.existsSync(
            `${FILE_STORAGE_PATH}/${_file.hash.replace(/_[a-f0-9]{10}/, "")}${
              _file.ext
            }`
          )
      )
      .map(async (_file) => {
        return downloadFile(
          `${FILE_DOWNLOAD_HOST}${_file.url}`,
          `${FILE_STORAGE_PATH}/${_file.hash.replace(/_[a-f0-9]{10}/, "")}${
            _file.ext
          }`
        );
      })
  );
}

async function importFossils() {
  console.log(`importing ${fossils.length} fossils`);
  return Promise.all(
    fossils.map((fossil) => {
      return importEntry("fossil", fossil, ["image", "gallery"]);
    })
  );
}

async function importSeedData() {
  // Allow read of application content types
  await setPublicPermissions({
    about: ["find"],
    achievement: ["find", "findOne"],
    category: ["find", "findOne"],
    contact: ["find"],
    country: ["find", "findOne"],
    destination: ["find", "findOne"],
    fossil: ["find", "findOne"],
    history: ["find"],
    introduction: ["find"],
    legal: ["find"],
    "mail-template": ["find"],
    media: ["find", "findOne"],
    package: ["find", "findOne"],
    quality: ["find", "findOne"],
    rate: ["find", "findOne"],
  });

  // Create all entries
  await importAchievements(achievements);
  await importMedias(medias);
  await importCategories(categories);
  await importDestinations(destinations);
  await importPackages(packages);
  await importQualities(qualities);
  await importCountries(countries);
  await importRates(rates);
  // await copyFiles(uploads);
  await importFossils(fossils);
  await importSingleTypes(
    about,
    contact,
    history,
    introduction,
    press,
    mailTemplates
  );
}

module.exports = async () => {
  const shouldImportSeedData = await isFirstRun();
  if (shouldImportSeedData) {
    try {
      await importSeedData();
    } catch (error) {
      console.log("Could not import seed data");
      // console.error(error);
    }
  }
};

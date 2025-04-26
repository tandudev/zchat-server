const authenticate = require("./auth.middleware");
const upload = require("./upload.middleware");

module.exports = {
  authenticate,
  upload,
};

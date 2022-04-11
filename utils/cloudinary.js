const cloudinary = require("cloudinary").v2;
const upload_image = async (file, folder) => {
  const upload = cloudinary.uploader.upload(file, {
    resource_type: "auto",
    folder: folder,
  });
  return upload;
};

module.exports = {
  upload_image
};

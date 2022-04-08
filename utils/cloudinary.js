const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req,file,cb) {
    cb(null, './uploads/')
  },
  filename: function (req,file,cb){
    cb(null, new Date().toISOString() + '-' + file.originalname)
  }
})

const upload = multer({
  storage:storage,
})

const cloudinary = require("cloudinary").v2;
const upload_image = async (file, folder) => {
  const upload = cloudinary.uploader.upload(file, {
    resource_type: auto,
    folder: folder,
  });
  return upload;
};

module.exports = {
  upload_image,
  upload
};

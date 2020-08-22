const multer = require('multer');


exports.uploadPost = function () {
  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString() + '-' + file.originalname);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }

  return multer({
    storage: fileStorage,
    fileFilter
  }).single('image');
}
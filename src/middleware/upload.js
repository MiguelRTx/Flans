const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './src/uploads';

['profiles', 'banners', 'posts'].forEach((dir) => {
  const fullPath = path.resolve(`${UPLOAD_DIR}/${dir}`);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

function createStorage(type) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.resolve(`${UPLOAD_DIR}/${type}`)),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${req.user.id}${ext}`);
    },
  });
}

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Solo se permiten imágenes (jpeg, png, gif, webp)'), false);
}

const uploadProfile = multer({ storage: createStorage('profiles'), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadBanner  = multer({ storage: createStorage('banners'),  fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadPost    = multer({ storage: createStorage('posts'),    fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = { uploadProfile, uploadBanner, uploadPost };

const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Configuration for Local File Storage
 * Files will be saved in public/uploads/products
 */

// 1. Define and Ensure the upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads/products');

if (!fs.existsSync(uploadDir)) {
    // recursive: true ensures all parent folders are created if missing
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Disk Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename to prevent overwriting
        // Format: timestamp-originalfilename.ext
        const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s/g, '_');
        cb(null, uniqueSuffix);
    }
});

// 3. Define File Filter (Optional but recommended)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (jpeg, jpg, png, webp, gif) are allowed!'));
    }
};

// 4. Initialize Multer
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
    fileFilter: fileFilter
});

// 5. Export for use in Routes
module.exports = upload;
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageFile = uploadImageFile;
exports.uploadPrivateImageFile = uploadPrivateImageFile;
exports.uploadPrivateImageBuffer = uploadPrivateImageBuffer;
exports.uploadImageBuffer = uploadImageBuffer;
exports.uploadImageFileAndCleanup = uploadImageFileAndCleanup;
exports.uploadMulterFiles = uploadMulterFiles;
exports.deleteCloudinaryAsset = deleteCloudinaryAsset;
const promises_1 = __importDefault(require("fs/promises"));
const config_js_1 = require("../config.js");
async function uploadImageFile(filePath, options) {
    const uploadOptions = {
        resource_type: "image",
    };
    if (options?.folder) {
        uploadOptions.folder = options.folder;
    }
    if (options?.publicId) {
        uploadOptions.public_id = options.publicId;
    }
    return config_js_1.cloudinary.uploader.upload(filePath, uploadOptions);
}
async function uploadPrivateImageFile(filePath, options) {
    const uploadOptions = {
        resource_type: "image",
        type: "private",
    };
    if (options?.folder) {
        uploadOptions.folder = options.folder;
    }
    if (options?.publicId) {
        uploadOptions.public_id = options.publicId;
    }
    return config_js_1.cloudinary.uploader.upload(filePath, uploadOptions);
}
async function uploadPrivateImageBuffer(buffer, options) {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            resource_type: "image",
            type: "private",
            ...(options?.folder && { folder: options.folder }),
            ...(options?.publicId && { public_id: options.publicId }),
        };
        const stream = config_js_1.cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error || !result) {
                reject(error ?? new Error("Cloudinary upload failed"));
                return;
            }
            resolve(result);
        });
        stream.end(buffer);
    });
}
async function uploadImageBuffer(buffer, options) {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            resource_type: "image",
        };
        if (options?.folder) {
            uploadOptions.folder = options.folder;
        }
        if (options?.publicId) {
            uploadOptions.public_id = options.publicId;
        }
        const stream = config_js_1.cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error || !result) {
                reject(error ?? new Error("Cloudinary upload failed"));
                return;
            }
            resolve(result);
        });
        stream.end(buffer);
    });
}
async function uploadImageFileAndCleanup(filePath, options) {
    try {
        return await uploadImageFile(filePath, options);
    }
    finally {
        await promises_1.default.unlink(filePath).catch(() => { });
    }
}
async function uploadMulterFiles(files, options) {
    return Promise.all(files.map((file) => {
        if (file.buffer && file.buffer.length > 0) {
            return uploadImageBuffer(file.buffer, { folder: options?.folder });
        }
        if (file.path) {
            return uploadImageFileAndCleanup(file.path, { folder: options?.folder });
        }
        throw new Error(`Unable to upload file '${file.originalname}': missing both buffer and path`);
    }));
}
async function deleteCloudinaryAsset(publicId, type = "private") {
    await config_js_1.cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        type,
    });
}
//# sourceMappingURL=cloudinary_upload.js.map
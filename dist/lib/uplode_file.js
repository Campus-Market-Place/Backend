"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadedFiles = getUploadedFiles;
// Helper: normalize multer files
function getUploadedFiles(req) {
    const files = req.files;
    if (Array.isArray(files))
        return files;
    if (files && typeof files === "object") {
        // handle multer.fields(...)
        return Object.values(files).flat();
    }
    return [];
}
//# sourceMappingURL=uplode_file.js.map
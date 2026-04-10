import type { UploadApiResponse } from "cloudinary";
type UploadOptions = {
    folder?: string | undefined;
    publicId?: string | undefined;
};
export declare function uploadImageFile(filePath: string, options?: UploadOptions): Promise<UploadApiResponse>;
export declare function uploadPrivateImageFile(filePath: string, options?: UploadOptions): Promise<UploadApiResponse>;
export declare function uploadPrivateImageBuffer(buffer: Buffer, options?: UploadOptions): Promise<UploadApiResponse>;
export declare function uploadImageBuffer(buffer: Buffer, options?: UploadOptions): Promise<UploadApiResponse>;
export declare function uploadImageFileAndCleanup(filePath: string, options?: UploadOptions): Promise<UploadApiResponse>;
export declare function uploadMulterFiles(files: Express.Multer.File[], options?: {
    folder?: string;
}): Promise<UploadApiResponse[]>;
export declare function deleteCloudinaryAsset(publicId: string, type?: "private" | "upload"): Promise<void>;
export {};
//# sourceMappingURL=cloudinary_upload.d.ts.map
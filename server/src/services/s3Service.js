const dotenv = require("dotenv");
dotenv.config();
const s3 = require("../config/s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const hasS3Config = Boolean(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME
);

const USE_LOCAL = !hasS3Config;
const LOCAL_UPLOAD_PORT = process.env.PORT || 5000;

// Ensure public/uploads exists
const ensureUploadsDir = (folderName) => {
    const dir = path.join(__dirname, `../../public/uploads/${folderName}`);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

const uploadFileToS3 = async (file, folderName) => {
    try {
        if (!file) {
            throw new Error("File not found");
        }

        const sanitizedOriginalName = String(file.originalname || "file")
            .replace(/[^\w.\-() ]+/g, "_")
            .replace(/\s+/g, "_");
        const fileName = `${Date.now()}_${sanitizedOriginalName}`;
        const key = `${folderName}/${fileName}`;

        if (USE_LOCAL) {
            const dir = ensureUploadsDir(folderName);
            const filePath = path.join(dir, fileName);
            fs.writeFileSync(filePath, file.buffer);
            
            const url = `http://localhost:${LOCAL_UPLOAD_PORT}/uploads/${key}`;
            
            return {
                url,
                key
            };
        }

        if (!s3) {
            throw new Error("S3 client is not configured");
        }

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            ContentType: file.mimetype,
            Body: file.buffer,
        });

        await s3.send(command);

        const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        return {
            url,
            key,
        };
    } catch (err) {
        console.error("Error uploading file:", err);
        throw new Error("Failed to upload file");
    }
};

const deleteFileFromS3 = async (fileKey) => {
    try {
        if (USE_LOCAL) {
            const filePath = path.join(__dirname, `../../public/uploads/${fileKey}`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return;
        }

        if (!s3) {
            throw new Error("S3 client is not configured");
        }

        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey
        });
        await s3.send(command);
    } catch (err) {
        console.error("Error deleting file:", err);
        throw new Error("Failed to delete file");
    }
};

const generateSignedUrl = async (bookFileKey) => {
    try {
        if (USE_LOCAL) {
            return `http://localhost:${LOCAL_UPLOAD_PORT}/uploads/${bookFileKey}`;
        }

        if (!s3) {
            throw new Error("S3 client is not configured");
        }

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: bookFileKey,
        });

        const signedUrl = await getSignedUrl(s3, command, {
            expiresIn: 3600,
        });

        return signedUrl;
    } catch (err) {
        console.error("Error generating signed URL:", err);
        throw new Error("Failed to generate signed URL");
    }
};

module.exports = { uploadFileToS3, deleteFileFromS3, generateSignedUrl };

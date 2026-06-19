const dotenv = require("dotenv");
dotenv.config();
const s3 = require("../config/s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const USE_LOCAL = !process.env.AWS_S3_BUCKET_NAME;

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

        const fileName = `${Date.now()}_${file.originalname}`;
        const key = `${folderName}/${fileName}`;

        if (USE_LOCAL) {
            const dir = ensureUploadsDir(folderName);
            const filePath = path.join(dir, fileName);
            fs.writeFileSync(filePath, file.buffer);
            
            // Hardcode localhost port for fallback since it's a dev environment.
            // In a real app, you'd use req.protocol and req.get('host') but this is a service layer.
            const url = `http://localhost:${process.env.PORT || 5050}/uploads/${key}`;
            
            return {
                url,
                key
            };
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
            return `http://localhost:${process.env.PORT || 5050}/uploads/${bookFileKey}`;
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
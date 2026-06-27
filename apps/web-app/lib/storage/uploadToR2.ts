import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type UploadToR2ObjectInput = {
	file: File;
	key: string;
	contentType?: string;
};

type UploadToR2BufferInput = {
	buffer: Buffer;
	key: string;
	contentType: string;
};

type UploadToR2Input = UploadToR2ObjectInput | UploadToR2BufferInput;

const r2 = new S3Client({
	region: "auto",
	endpoint: process.env.R2_ENDPOINT,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
	},
});

function getPublicUrl(key: string) {
	if (!process.env.R2_PUBLIC_URL) {
		throw new Error("R2_PUBLIC_URL env not set");
	}
	return `${process.env.R2_PUBLIC_URL}/${key}`;
}

function assertR2Env() {
	if (!process.env.R2_BUCKET) {
		throw new Error("R2_BUCKET env not set");
	}
	if (!process.env.R2_ENDPOINT) {
		throw new Error("R2_ENDPOINT env not set");
	}
	if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
		throw new Error("R2 credentials env not set");
	}
}

export async function uploadToR2(input: UploadToR2Input): Promise<string> {
	assertR2Env();

	const bodyBuffer =
		"file" in input
			? Buffer.from(await input.file.arrayBuffer())
			: input.buffer;

	const contentType =
		"file" in input
			? input.contentType || input.file.type || "application/octet-stream"
			: input.contentType;

	const command = new PutObjectCommand({
		Bucket: process.env.R2_BUCKET,
		Key: input.key,
		Body: bodyBuffer,
		ContentType: contentType,
		CacheControl: "public, max-age=31536000, immutable",
	});

	await r2.send(command);

	return getPublicUrl(input.key);
}

export async function deleteFromR2Url(url?: string | null): Promise<void> {
	if (!url || !process.env.R2_PUBLIC_URL) return;

	const publicBase = process.env.R2_PUBLIC_URL.replace(/\/+$/, "");
	if (!url.startsWith(`${publicBase}/`)) return;

	assertR2Env();

	const key = decodeURIComponent(url.slice(publicBase.length + 1));
	if (!key) return;

	await r2.send(
		new DeleteObjectCommand({
			Bucket: process.env.R2_BUCKET,
			Key: key,
		})
	);
}

import ImageKit, { toFile } from "@imagekit/nodejs";

const privateKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim();

if (!privateKey) {
  throw new Error("IMAGEKIT_PRIVATE_KEY is missing");
}

const imagekit = new ImageKit({
  privateKey,
});

function hasImageKitConfig() {
  return Boolean(privateKey);
}

function createFileName(originalName = "upload") {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");

  return `chat-${Date.now()}-${safeName}`;
}

async function uploadChatMedia(file) {
  if (!file?.buffer) {
    throw new Error("Uploaded file buffer is missing");
  }

  const fileName = createFileName(file.originalname);

  const result = await imagekit.files.upload({
    file: await toFile(file.buffer, fileName, {
      type: file.mimetype,
    }),
    fileName,
    folder: "/chat",
  });

  return result.url;
}

export { uploadChatMedia, hasImageKitConfig };

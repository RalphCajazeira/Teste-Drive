import { google } from "googleapis"
import fs from "fs"

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
)

auth.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
})

export const drive = google.drive({ version: "v3", auth })

export async function uploadToDrive({ filePath, fileName, mimeType }) {
  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [process.env.DRIVE_FOLDER_ID],
    },
    media: {
      mimeType,
      body: fs.createReadStream(filePath),
    },
    fields: "id,webViewLink,webContentLink",
  })

  // tornar público
  await drive.permissions.create({
    fileId: res.data.id,
    requestBody: {
      type: "anyone",
      role: "reader",
    },
  })

  return {
    driveFileId: res.data.id,
    publicUrl:
      res.data.webContentLink ||
      `https://drive.google.com/uc?export=view&id=${res.data.id}`,
  }
}

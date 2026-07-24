import "server-only";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

/**
 * base64 데이터 URI(data:image/jpeg;base64,...)를 R2에 업로드하고 접근 가능한 URL을 반환한다.
 * DB에 base64를 그대로 저장하면 이미지 1장이 수백 KB짜리 텍스트가 되어 쿼리/전송 비용이
 * 커지므로, 생성 즉시 오브젝트 스토리지로 옮기고 DB에는 URL만 남긴다.
 */
export async function uploadImageToR2(dataUri: string): Promise<string> {
  const match = dataUri.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    throw new Error("invalid data URI");
  }
  const [, contentType, base64] = match;
  const extension = contentType.split("/")[1] ?? "jpg";
  const buffer = Buffer.from(base64, "base64");
  const key = `generated/${randomUUID()}.${extension}`;

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) {
    throw new Error("R2_PUBLIC_URL is not configured");
  }
  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}

/**
 * 게임이 삭제될 때 R2에 올라간 이미지도 같이 지워 고아 오브젝트가 쌓이지 않게 한다.
 * 플레이스홀더(placehold.co) 등 우리 버킷 URL이 아닌 경우는 조용히 무시한다.
 */
export async function deleteImageFromR2(url: string): Promise<void> {
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!publicUrl || !url.startsWith(`${publicUrl}/`)) {
    return;
  }
  const key = url.slice(publicUrl.length + 1);

  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }),
  );
}

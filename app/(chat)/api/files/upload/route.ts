import { NextResponse } from "next/server";
import { z } from "zod";

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    .refine((file) => ["image/jpeg", "image/png"].includes(file.type), {
      message: "File type should be JPEG or PNG",
    }),
});

export async function POST(request: Request) {
  return NextResponse.json({ error: "File upload is currently disabled (Vercel dependencies removed)." }, { status: 501 });
}

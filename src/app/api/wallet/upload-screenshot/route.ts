import { fail, ok } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return fail("File is required");
    }

    if (!allowedMimeTypes.includes(file.type)) {
      return fail("Unsupported file type");
    }

    if (file.size > 5 * 1024 * 1024) {
      return fail("Image must be smaller than 5MB");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    const path = `${session.id}/${Date.now()}-${safeName}`;
    const supabase = createAdminClient();

    const { error } = await supabase.storage.from("screenshots").upload(path, buffer, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      return fail(error.message, 500);
    }

    const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
    return ok({ url: data.publicUrl });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Upload failed", 500);
  }
}

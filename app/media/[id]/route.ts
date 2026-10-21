import { createSupabasePublicClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });

  try {
    const supabase = createSupabasePublicClient();
    const { data: asset, error: assetError } = await supabase
      .from("media_assets")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();
    if (assetError || !asset) return new Response("Not found", { status: 404 });

    const { data: file, error: fileError } = await supabase.storage.from("portfolio-media").download(asset.storage_path);
    if (fileError || !file) return new Response("Not found", { status: 404 });

    return new Response(file.stream(), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "Content-Length": String(file.size),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

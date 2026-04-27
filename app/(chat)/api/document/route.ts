import { getDocumentsById } from "@/lib/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "id required" }, { status: 400 });
  }

  try {
    const documents = await getDocumentsById({ id });
    
    if (documents.length === 0) {
      return Response.json({ error: "Document not found" }, { status: 404 });
    }

    return Response.json(documents);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

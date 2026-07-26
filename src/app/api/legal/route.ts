import { NextRequest, NextResponse } from "next/server";
import { getLegalPolicy, updateLegalPolicy } from "@/lib/actions/legal";

/**
 * GET /api/legal?type=PRIVACY_POLICY or COOKIE_POLICY
 */
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");

  if (type !== "PRIVACY_POLICY" && type !== "COOKIE_POLICY") {
    return NextResponse.json(
      { error: "Invalid type. Must be PRIVACY_POLICY or COOKIE_POLICY." },
      { status: 400 }
    );
  }

  const data = await getLegalPolicy(type);

  return NextResponse.json({ data });
}

/**
 * POST /api/legal
 * Body: { type, title_ka, title_en, description_ka, description_en, content_ka, content_en }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.type || (body.type !== "PRIVACY_POLICY" && body.type !== "COOKIE_POLICY")) {
      return NextResponse.json(
        { error: "Invalid type. Must be PRIVACY_POLICY or COOKIE_POLICY." },
        { status: 400 }
      );
    }

    const result = await updateLegalPolicy({
      type: body.type,
      title_ka: body.title_ka || "",
      title_en: body.title_en || "",
      description_ka: body.description_ka || "",
      description_en: body.description_en || "",
      content_ka: body.content_ka || "",
      content_en: body.content_en || "",
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}

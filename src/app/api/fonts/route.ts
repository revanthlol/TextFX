import { NextRequest, NextResponse } from "next/server";
import fontData from "@/data/google-fonts.json";
import { ALL_FONTS, POPULAR_FONTS, FontItem } from "@/lib/fonts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.toLowerCase();
    const query = searchParams.get("search")?.toLowerCase().trim();
    const popularOnly = searchParams.get("popular") === "true";
    const refresh = searchParams.get("refresh") === "true";

    // Optional sync with Google Fonts Developer API if API key is provided and refresh requested
    const apiKey = process.env.GOOGLE_FONTS_API_KEY;
    if (refresh && apiKey) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`,
          { next: { revalidate: 86400 } }
        );
        if (response.ok) {
          const liveData = await response.json();
          if (liveData.items && Array.isArray(liveData.items)) {
            const liveFonts: FontItem[] = liveData.items.map((item: { family: string; category: string }) => ({
              family: item.family,
              category: (item.category || "sans-serif") as FontItem["category"],
            }));

            return NextResponse.json({
              source: "google-fonts-developer-api",
              total: liveFonts.length,
              popular: fontData.popular,
              fonts: liveFonts,
            }, {
              headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" }
            });
          }
        }
      } catch (err) {
        console.warn("Failed to fetch live Google Fonts API, falling back to local dataset", err);
      }
    }

    let result = ALL_FONTS;

    if (popularOnly) {
      result = POPULAR_FONTS;
    } else if (category && category !== "all") {
      result = result.filter((f) => f.category === category);
    }

    if (query) {
      result = result.filter((f) => f.family.toLowerCase().includes(query));
    }

    return NextResponse.json({
      source: "local-catalog",
      total: result.length,
      categories: ["all", "popular", "monospace", "sans-serif", "serif", "handwriting", "display"],
      popular: fontData.popular,
      fonts: result,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200"
      }
    });
  } catch (error) {
    console.error("Font API route error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve font catalog" },
      { status: 500 }
    );
  }
}

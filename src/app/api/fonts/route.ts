import { NextRequest, NextResponse } from "next/server";
import fontData from "@/data/google-fonts.json";
import { ALL_FONTS, POPULAR_FONTS, FontItem } from "@/lib/fonts";

// In-memory cache for API font data
let cachedLiveFonts: FontItem[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function getLiveGoogleFonts(): Promise<FontItem[] | null> {
  const apiKey = process.env.GOOGLE_FONTS_API_KEY;
  if (!apiKey) return null;

  const now = Date.now();
  if (cachedLiveFonts && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedLiveFonts;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`,
      { next: { revalidate: 86400 } }
    );
    if (response.ok) {
      const data = await response.json();
      if (data.items && Array.isArray(data.items)) {
        const popularSet = new Set(fontData.popular.map((f) => f.toLowerCase()));
        const fonts: FontItem[] = data.items.map((item: { family: string; category: string }) => ({
          family: item.family,
          category: (item.category || "sans-serif") as FontItem["category"],
          isPopular: popularSet.has(item.family.toLowerCase())
        }));
        cachedLiveFonts = fonts;
        lastFetchTime = now;
        return fonts;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch live Google Fonts API, using local dataset fallback:", err);
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.toLowerCase();
    const query = searchParams.get("search")?.toLowerCase().trim();
    const popularOnly = searchParams.get("popular") === "true";

    const liveFonts = await getLiveGoogleFonts();
    const baseFonts = liveFonts || ALL_FONTS;

    let result = baseFonts;

    if (popularOnly) {
      result = POPULAR_FONTS;
    } else if (category && category !== "all") {
      result = result.filter((f) => f.category === category);
    }

    if (query) {
      result = result.filter((f) => f.family.toLowerCase().includes(query));
    }

    return NextResponse.json({
      source: liveFonts ? "google-fonts-api" : "local-catalog",
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

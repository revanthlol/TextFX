import { NextRequest, NextResponse } from "next/server";
import { validateParams } from "@/lib/utils";
import { parseGradient, getGradientCoordinates } from "@/lib/gradients";
import { decompressConfig } from "@/lib/urlCompression";
import * as opentype from "opentype.js";

interface TextLine {
  text: string;
  font: string;
  color: string;
  fontSize: number;
  letterSpacing: string | number;
  typingSpeed: number;
  deleteSpeed: number;
  fontWeight: string;
  lineHeight: number;
  animationStyle?: 'typewriter' | 'fade' | 'slide-up' | 'wave' | 'glitch';
  gradient?: string;
}

type DeletionBehavior = "stay" | "backspace" | "clear";

/**
 * Parse letter-spacing value and convert to pixels
 * Supports: em, rem, px, %, numbers (treated as em)
 */
function parseLetterSpacing(
  letterSpacing: string | number,
  fontSize: number
): number {
  if (typeof letterSpacing === "number") {
    return letterSpacing * fontSize; // Treat as em
  }

  const value = letterSpacing.toString().trim().toLowerCase();

  const match = value.match(/^([+-]?\d*\.?\d+)(em|rem|px|%)?$/);
  if (!match) {
    if (value === "normal") return 0;
    if (value === "inherit") return 0;
    return 0;
  }

  const numValue = parseFloat(match[1]);
  const unit = match[2] || "em";

  switch (unit) {
    case "em":
      return numValue * fontSize;
    case "rem":
      return numValue * 16;
    case "px":
      return numValue;
    case "%":
      return (numValue / 100) * fontSize;
    default:
      return numValue * fontSize;
  }
}

// Helper: returns numeric y offset for cursor
function getCursorYOffset(style: string, fontSize: number): number {
  switch (style) {
    case "underline":
      return fontSize * 0.45;
    case "block":
      return -fontSize * 0.85;
    case "half-block":
      return -fontSize * 0.8;
    case "blank":
      return 0;
    case "straight":
    default:
      return -fontSize * 0.75;
  }
}

// Helper: returns cursor SVG shape
function getCursorSvgShape(
  style: string,
  color: string,
  fontSize: number
): string {
  switch (style) {
    case "underline":
      return `<rect y="-5" width="${(fontSize * 0.6).toFixed(1)}" height="${(
        fontSize * 0.12
      ).toFixed(1)}" fill="${color}" visibility="hidden" />`;
    case "block":
      return `<rect y="-5" width="${(fontSize * 0.6).toFixed(1)}" height="${(
        fontSize * 1.1
      ).toFixed(1)}" fill="${color}" visibility="hidden" />`;
    case "half-block":
      return `<rect y="-5" width="${(fontSize * 0.35).toFixed(1)}" height="${(
        fontSize * 1.05
      ).toFixed(1)}" fill="${color}" visibility="hidden" />`;
    case "blank":
      return "";
    case "straight":
    default:
      return `<rect y="-5" width="${(fontSize * 0.09).toFixed(1)}" height="${(
        fontSize * 1.2
      ).toFixed(1)}" fill="${color}" visibility="hidden" />`;
  }
}

const fontCache = new Map<string, { css: string; fontData: ArrayBuffer | null }>();

/**
 * Fetch Google Font CSS and font file with caching
 */
async function fetchGoogleFontCSS(
  fontFamily: string,
  weight: string = "400",
  text: string = ""
): Promise<{ css: string; fontData: ArrayBuffer | null }> {
  const cacheKey = `${fontFamily}_${weight}_${text}`;
  if (fontCache.has(cacheKey)) {
    return fontCache.get(cacheKey)!;
  }

  try {
    const url = `https://fonts.googleapis.com/css2?${new URLSearchParams({
      family: `${fontFamily}:wght@${weight}`,
      text: text,
      display: "fallback",
    })}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch Google Font CSS: ${response.status}`);
    }

    let css = await response.text();
    let firstFontData: ArrayBuffer | null = null;

    const urlRegex =
      /url\((https:\/\/fonts\.gstatic\.com[^)]+)\)\s+format\(['"]([^'"]+)['"]\)/g;
    const matches = [...css.matchAll(urlRegex)];

    for (const match of matches) {
      const [, fontUrl, fontFormat] = match;

      try {
        const fontController = new AbortController();
        const fontTimeout = setTimeout(() => fontController.abort(), 2000);
        const fontResponse = await fetch(fontUrl, { signal: fontController.signal });
        clearTimeout(fontTimeout);

        if (fontResponse.ok) {
          const fontBuffer = await fontResponse.arrayBuffer();
          if (!firstFontData) {
            firstFontData = fontBuffer;
          }
          const base64Font = Buffer.from(fontBuffer).toString("base64");
          const dataUri = `data:font/${fontFormat};base64,${base64Font}`;
          css = css.replace(fontUrl, dataUri);
        }
      } catch (fontError) {
        console.warn(`Failed to fetch/inline font file: ${fontUrl}`, fontError);
      }
    }

    const result = { css, fontData: firstFontData };
    fontCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Failed to fetch Google Font for ${fontFamily}:`, error);
    const fallback = { css: "", fontData: null };
    fontCache.set(cacheKey, fallback);
    return fallback;
  }
}

/**
 * Parse font buffer using opentype.js
 */
function parseFontData(fontBuffer: ArrayBuffer): opentype.Font | null {
  try {
    return opentype.parse(fontBuffer);
  } catch {
    return null;
  }
}

/**
 * Get CSS and parsed fonts for all unique fonts in textLines
 */
async function getGoogleFontsData(textLines: TextLine[]): Promise<{
  css: string;
  fonts: Map<string, opentype.Font | null>;
}> {
  const fontMap = new Map<
    string,
    { weights: Set<string>; text: Set<string> }
  >();

  textLines.forEach((line) => {
    if (!fontMap.has(line.font)) {
      fontMap.set(line.font, {
        weights: new Set(),
        text: new Set(),
      });
    }
    const fontInfo = fontMap.get(line.font)!;
    fontInfo.weights.add(line.fontWeight || "400");
    line.text.split("").forEach((char) => fontInfo.text.add(char));
  });

  const cssPromises: Promise<{
    font: string;
    css: string;
    fontData: ArrayBuffer | null;
  }>[] = [];

  fontMap.forEach((info, font) => {
    const text = Array.from(info.text).join("");
    const weight = Array.from(info.weights)[0] || "400";
    cssPromises.push(
      fetchGoogleFontCSS(font, weight, text).then((result) => ({
        font,
        css: result.css,
        fontData: result.fontData,
      }))
    );
  });

  const results = await Promise.all(cssPromises);
  const combinedCSS = results.map((r) => r.css).join("\n");
  const parsedFonts = new Map<string, opentype.Font | null>();

  results.forEach((r) => {
    if (r.fontData) {
      parsedFonts.set(r.font, parseFontData(r.fontData));
    } else {
      parsedFonts.set(r.font, null);
    }
  });

  return { css: combinedCSS, fonts: parsedFonts };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    let activeParams = searchParams;
    if (searchParams.has("c")) {
      const decompressed = decompressConfig<Record<string, unknown>>(searchParams.get("c")!);
      if (decompressed && typeof decompressed === "object") {
        const merged = new URLSearchParams(searchParams);
        for (const [k, v] of Object.entries(decompressed)) {
          if (k === "lines") {
            merged.set("lines", JSON.stringify(v));
          } else if (v !== undefined && v !== null) {
            merged.set(k, String(v));
          }
        }
        activeParams = merged;
      }
    }

    const p = validateParams(activeParams);

    const deletionBehavior = p.deletionBehavior as DeletionBehavior;
    const pauseDuration = p.pause / 1000;

    const linesParam = activeParams.get("lines");
    let textLines: TextLine[] = [];

    try {
      if (linesParam) {
        const parsed = JSON.parse(linesParam);
        const linesArray = Array.isArray(parsed) ? parsed : [parsed];

        textLines = linesArray.map((ln) => {
          if (typeof ln === "string") {
            return {
              text: ln,
              font: p.font,
              color: p.color,
              fontSize: p.fontSize,
              letterSpacing: p.letterSpacing,
              typingSpeed: p.typingSpeed,
              deleteSpeed: p.deleteSpeed,
              fontWeight: p.fontWeight || "400",
              lineHeight: 1.3,
              animationStyle: p.animationStyle,
              gradient: p.textGradient,
            };
          }
          return {
            text: ln && typeof ln.text === "string" ? ln.text : "",
            font: ln && ln.font ? ln.font : p.font,
            color: ln && ln.color ? ln.color : p.color,
            fontSize:
              ln && typeof ln.fontSize === "number" ? ln.fontSize : p.fontSize,
            letterSpacing:
              ln && ln.letterSpacing !== undefined
                ? ln.letterSpacing
                : p.letterSpacing,
            typingSpeed:
              ln && typeof ln.typingSpeed === "number"
                ? ln.typingSpeed
                : p.typingSpeed,
            deleteSpeed:
              ln && typeof ln.deleteSpeed === "number"
                ? ln.deleteSpeed
                : p.deleteSpeed,
            fontWeight:
              ln && ln.fontWeight ? ln.fontWeight : p.fontWeight,
            lineHeight:
              ln && typeof ln.lineHeight === "number"
                ? ln.lineHeight
                : 1.3,
            animationStyle:
              ln && ln.animationStyle ? ln.animationStyle : p.animationStyle,
            gradient:
              ln && ln.gradient ? ln.gradient : p.textGradient,
          } as TextLine;
        });
      } else if (p.text) {
        const texts = p.text.split(";");
        textLines = texts.map((text: string) => ({
          text,
          font: p.font,
          color: p.color,
          fontSize: p.fontSize,
          letterSpacing: p.letterSpacing,
          typingSpeed: p.typingSpeed,
          deleteSpeed: p.deleteSpeed,
          fontWeight: p.fontWeight || "400",
          lineHeight: 1.3,
          animationStyle: p.animationStyle,
          gradient: p.textGradient,
        }));
      } else {
        textLines = [
          {
            text: "",
            font: p.font,
            color: p.color,
            fontSize: p.fontSize,
            letterSpacing: p.letterSpacing,
            typingSpeed: p.typingSpeed,
            deleteSpeed: p.deleteSpeed,
            fontWeight: p.fontWeight || "400",
            lineHeight: 1.3,
            animationStyle: p.animationStyle,
            gradient: p.textGradient,
          },
        ];
      }
    } catch {
      return new NextResponse(
        JSON.stringify({ error: "Invalid lines parameter" }),
        { status: 400 }
      );
    }

    textLines = textLines.filter((line) => line.text.trim() !== "");

    if (textLines.length === 0) {
      textLines = [
        {
          text: "Hello, World!",
          font: p.font,
          color: p.color,
          fontSize: p.fontSize,
          letterSpacing: p.letterSpacing,
          typingSpeed: p.typingSpeed,
          deleteSpeed: p.deleteSpeed,
          fontWeight: p.fontWeight || "400",
          lineHeight: 1.3,
          animationStyle: p.animationStyle,
          gradient: p.textGradient,
        },
      ];
    }

    const { css: googleFontsCSS, fonts: parsedFonts } = await getGoogleFontsData(textLines);

    const fmt = (n: number) => {
      const s = Number(n.toFixed(3));
      return s % 1 === 0 ? s.toFixed(0) : s.toString();
    };

    let overallCycleDuration = 0;
    const allTextElements: string[] = [];
    let allCursorAnimations = "";
    const gradientDefs: string[] = [];

    const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;

    const getGraphemeWidth = (
      grapheme: string,
      fontSize: number,
      font: opentype.Font | null,
      letterSpacingPx: number
    ): number => {
      const isEmoji = emojiRegex.test(grapheme);
      if (isEmoji) {
        return fontSize + letterSpacingPx;
      }
      
      if (font) {
        try {
          const glyph = font.charToGlyph(grapheme);
          if (glyph) {
            const advanceWidth = glyph.advanceWidth || 0;
            const scale = fontSize / font.unitsPerEm;
            const charWidth = advanceWidth * scale;
            return charWidth + letterSpacingPx;
          }
        } catch {
          // Fall through
        }
      }
      
      return fontSize * 0.5 + letterSpacingPx;
    };

    // Global position calculations for 'stay' behavior
    let globalMaxLineWidth = 0;
    let totalLinesCount = 0;

    textLines.forEach((line) => {
      const subLines = line.text.split("\n");
      const font = parsedFonts.get(line.font) || null;
      const letterSpacingPx = parseLetterSpacing(line.letterSpacing, line.fontSize);

      subLines.forEach((subLine) => {
        const graphemes = [...subLine];
        let width = 0;
        graphemes.forEach((grapheme) => {
          width += getGraphemeWidth(grapheme, line.fontSize, font, letterSpacingPx);
        });
        globalMaxLineWidth = Math.max(globalMaxLineWidth, width);
        totalLinesCount++;
      });
    });

    const averageLineHeight =
      textLines.reduce(
        (sum, line) => sum + line.fontSize * line.lineHeight,
        0
      ) / textLines.length;

    const globalTotalHeight = totalLinesCount * averageLineHeight;
    
    // Vertical alignment calculation
    let globalTextBlockYOffset = (p.height - globalTotalHeight) / 2;
    if (p.vAlign === 'top') {
      globalTextBlockYOffset = 20;
    } else if (p.vAlign === 'bottom') {
      globalTextBlockYOffset = Math.max(10, p.height - globalTotalHeight - 20);
    }

    // Horizontal alignment calculation
    let globalTextBlockXOffset = (p.width - globalMaxLineWidth) / 2;
    if (p.hAlign === 'left') {
      globalTextBlockXOffset = 20;
    } else if (p.hAlign === 'right') {
      globalTextBlockXOffset = Math.max(10, p.width - globalMaxLineWidth - 20);
    }

    const allLinesTypingDuration = textLines.reduce((total, tl) => {
      const tlGraphemeCount = tl.text
        .split("\n")
        .reduce((s, ln) => s + [...ln].length, 0);
      return total + tlGraphemeCount * tl.typingSpeed + pauseDuration;
    }, 0);

    let cycleOffset = 0;
    let accumulatedHeight = 0;

    for (
      let contentIndex = 0;
      contentIndex < textLines.length;
      contentIndex++
    ) {
      const line = textLines[contentIndex];
      const content = line.text;
      const lines = content.split("\n");
      const linesAsGraphemes = lines.map((ln) => [...ln]);
      const totalGraphemeCount = linesAsGraphemes.reduce(
        (sum, ln) => sum + ln.length,
        0
      );

      const lineHeight = line.fontSize * line.lineHeight;
      const letterSpacingPx = parseLetterSpacing(
        line.letterSpacing,
        line.fontSize
      );

      const font = parsedFonts.get(line.font) || null;
      
      const lineCalculations = linesAsGraphemes.map((textLine) => {
        let cumulativeWidth = 0;
        if (textLine.length > 0) {
          textLine.forEach((grapheme) => {
            cumulativeWidth += getGraphemeWidth(grapheme, line.fontSize, font, letterSpacingPx);
          });
        }
        return { width: cumulativeWidth };
      });

      const textBlockWidth = Math.max(
        0,
        ...lineCalculations.map((lc) => lc.width)
      );
      const textBlockHeight = lines.length * lineHeight;

      let textBlockYOffset: number;
      let textBlockXOffset: number;

      if (deletionBehavior === "stay") {
        textBlockYOffset = globalTextBlockYOffset + accumulatedHeight;
        if (p.hAlign === 'left') {
          textBlockXOffset = 20;
        } else if (p.hAlign === 'right') {
          textBlockXOffset = Math.max(10, p.width - textBlockWidth - 20);
        } else {
          textBlockXOffset = (p.width - textBlockWidth) / 2;
        }
      } else {
        if (p.vAlign === 'top') {
          textBlockYOffset = 20;
        } else if (p.vAlign === 'bottom') {
          textBlockYOffset = Math.max(10, p.height - textBlockHeight - 20);
        } else {
          textBlockYOffset = (p.height - textBlockHeight) / 2;
        }

        if (p.hAlign === 'left') {
          textBlockXOffset = 20;
        } else if (p.hAlign === 'right') {
          textBlockXOffset = Math.max(10, p.width - textBlockWidth - 20);
        } else {
          textBlockXOffset = (p.width - textBlockWidth) / 2;
        }
      }

      const totalTypingDuration = totalGraphemeCount * line.typingSpeed;

      let deletionDuration = 0;
      if (deletionBehavior === "backspace") {
        deletionDuration = totalGraphemeCount * line.deleteSpeed;
      } else if (deletionBehavior === "clear") {
        deletionDuration = 0.01;
      }

      const contentCycleDuration =
        totalTypingDuration + pauseDuration + deletionDuration;

      let cumulativeTypingTime = 0;
      const afterCharX: number[] = [];
      const afterCharY: number[] = [];
      const beforeCharX: number[] = [];
      const beforeCharY: number[] = [];

      const cursorYOffset = getCursorYOffset(p.cursorStyle, line.fontSize);
      const cursorXOffset = line.fontSize * 0.12;
      const deleteStart = cycleOffset + totalTypingDuration + pauseDuration;
      let globalCharIndex = 0;

      // Check for gradient text
      let textFill = line.color;
      const gradientInfo = line.gradient ? parseGradient(line.gradient) : null;
      if (gradientInfo) {
        const gradId = `text-grad-${contentIndex}`;
        const { x1, y1, x2, y2 } = getGradientCoordinates(gradientInfo.angle);
        gradientDefs.push(
          `<linearGradient id="${gradId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
            <stop offset="0%" stop-color="${gradientInfo.from}"/>
            <stop offset="100%" stop-color="${gradientInfo.to}"/>
          </linearGradient>`
        );
        textFill = `url(#${gradId})`;
      }

      const currentAnimStyle = line.animationStyle || p.animationStyle || 'typewriter';

      // For each visual line
      for (let i = 0; i < linesAsGraphemes.length; i++) {
        const textLine = linesAsGraphemes[i];
        const lineYCenter = textBlockYOffset + i * lineHeight + lineHeight / 2;
        const lineWidth = lineCalculations[i].width;
        
        let lineStartX = textBlockXOffset;
        if (p.hAlign === 'center') {
          lineStartX = (p.width / 2) - lineWidth / 2;
        } else if (p.hAlign === 'right') {
          lineStartX = p.width - lineWidth - 20;
        }

        let currentX = 0;
        let tspanElements = "";

        for (let j = 0; j < textLine.length; j++) {
          const grapheme = textLine[j];
          const typingBegin = cycleOffset + cumulativeTypingTime;
          const typingBeginAttr = p.repeat
            ? `cycle.begin + ${fmt(typingBegin)}s`
            : `${fmt(typingBegin)}s`;

          let typingAnimation = "";

          // Custom SMIL animation styles
          if (currentAnimStyle === 'fade') {
            const fadeDur = fmt(Math.max(0.15, line.typingSpeed * 1.5));
            typingAnimation = `<animate attributeName="opacity" from="0" to="1" dur="${fadeDur}s" begin="${typingBeginAttr}" fill="freeze"/>`;
          } else if (currentAnimStyle === 'slide-up') {
            const slideDur = fmt(Math.max(0.2, line.typingSpeed * 1.3));
            const dyOffset = fmt(line.fontSize * 0.35);
            typingAnimation = `<animate attributeName="opacity" from="0" to="1" dur="${slideDur}s" begin="${typingBeginAttr}" fill="freeze"/><animate attributeName="dy" from="${dyOffset}" to="0" dur="${slideDur}s" begin="${typingBeginAttr}" fill="freeze"/>`;
          } else if (currentAnimStyle === 'wave') {
            typingAnimation = `<animate attributeName="opacity" from="0" to="1" dur="0.05s" begin="${typingBeginAttr}" fill="freeze"/><animate attributeName="dy" values="0;-7;0;3;0" dur="1.2s" begin="${typingBeginAttr}" repeatCount="indefinite"/>`;
          } else if (currentAnimStyle === 'glitch') {
            typingAnimation = `<animate attributeName="opacity" values="0;1;0.2;1" keyTimes="0;0.3;0.6;1" dur="0.25s" begin="${typingBeginAttr}" fill="freeze"/><animate attributeName="dx" values="3;-3;1;0" keyTimes="0;0.3;0.7;1" dur="0.25s" begin="${typingBeginAttr}" fill="freeze"/>`;
          } else {
            // Classic typewriter
            if (p.repeat && deletionBehavior === "stay") {
              const resetAnim = `<animate attributeName="opacity" to="0" dur="0s" begin="cycle.begin" fill="freeze"/>`;
              const showBegin = `cycle.begin + ${fmt(typingBegin + 0.02)}s`;
              const showAnim = `<animate attributeName="opacity" values="0;1" dur="0.01s" begin="${showBegin}" fill="freeze"/>`;
              typingAnimation = resetAnim + showAnim;
            } else {
              typingAnimation = `<animate attributeName="opacity" from="0" to="1" dur="0.01s" begin="${typingBeginAttr}" fill="freeze"/>`;
            }
          }

          let deletionAnimation = "";
          let hideAnimation = "";

          if (deletionBehavior === "backspace" && totalGraphemeCount > 0) {
            const deletionOrderIndex = totalGraphemeCount - 1 - globalCharIndex;
            const deletionBegin =
              deleteStart + deletionOrderIndex * line.deleteSpeed;
            const deletionBeginAttr = p.repeat
              ? `cycle.begin + ${fmt(deletionBegin)}s`
              : `${fmt(deletionBegin)}s`;
            deletionAnimation = `<animate attributeName="opacity" from="1" to="0" dur="0.01s" begin="${deletionBeginAttr}" fill="freeze"/>`;
          } else if (deletionBehavior === "clear") {
            const clearBegin = deleteStart;
            const clearBeginAttr = p.repeat
              ? `cycle.begin + ${fmt(clearBegin)}s`
              : `${fmt(clearBegin)}s`;
            deletionAnimation = `<animate attributeName="opacity" from="1" to="0" dur="0.01s" begin="${clearBeginAttr}" fill="freeze"/>`;
          } else if (deletionBehavior === "stay") {
            if (p.repeat) {
              const hideBeginAttr = `cycle.begin + ${fmt(
                allLinesTypingDuration
              )}s`;
              hideAnimation = `<animate attributeName="opacity" to="0" dur="0.01s" begin="${hideBeginAttr}" fill="freeze"/>`;
            }
          }

          const charWidth = getGraphemeWidth(grapheme, line.fontSize, font, letterSpacingPx);
          
          const xForThisGrapheme = fmt(lineStartX + currentX);
          tspanElements += `<tspan x="${xForThisGrapheme}" opacity="0">${grapheme}${typingAnimation}${deletionAnimation}${hideAnimation}</tspan>`;

          beforeCharX.push(lineStartX + currentX);
          beforeCharY.push(lineYCenter);

          currentX += charWidth;

          afterCharX.push(lineStartX + currentX);
          afterCharY.push(lineYCenter);

          cumulativeTypingTime += line.typingSpeed;
          globalCharIndex++;
        }

        const letterSpacingCSS =
          typeof line.letterSpacing === "number"
            ? `${line.letterSpacing}em`
            : line.letterSpacing.toString();

        const textStyle = `font-family:'${line.font}',monospace;font-size:${fmt(
          line.fontSize
        )}px;font-weight:${line.fontWeight};fill:${textFill};letter-spacing:${letterSpacingCSS};`;
        
        allTextElements.push(
          `<text class="text-common" y="${fmt(
            lineYCenter
          )}" xml:space="preserve" style="${textStyle}">${tspanElements}</text>`
        );
      }

      // Cursor typing animations
      const typingXValues = afterCharX.map((x) => fmt(x + cursorXOffset));
      const typingYValues = afterCharY.map((y) => fmt(y + cursorYOffset));

      if (typingXValues.length > 0) {
        const typingBeginAttr = p.repeat
          ? `cycle.begin + ${fmt(cycleOffset)}s`
          : `${fmt(cycleOffset)}s`;
        allCursorAnimations += `<animate attributeName="x" values="${typingXValues.join(
          ";"
        )}" dur="${fmt(
          totalTypingDuration
        )}s" calcMode="discrete" begin="${typingBeginAttr}" fill="freeze"/>`;
        allCursorAnimations += `<animate attributeName="y" values="${typingYValues.join(
          ";"
        )}" dur="${fmt(
          totalTypingDuration
        )}s" calcMode="discrete" begin="${typingBeginAttr}" fill="freeze"/>`;
      }

      // Deletion cursor animations
      if (deletionBehavior === "backspace" && totalGraphemeCount > 0) {
        const deletionXValues: string[] = [];
        const deletionYValues: string[] = [];

        for (let k = totalGraphemeCount - 1; k >= 0; k--) {
          deletionXValues.push(fmt(beforeCharX[k] + cursorXOffset));
          deletionYValues.push(fmt(beforeCharY[k] + cursorYOffset));
        }

        const deletionBeginRel =
          cycleOffset + totalTypingDuration + pauseDuration;
        const deletionBeginAttr = p.repeat
          ? `cycle.begin + ${fmt(deletionBeginRel)}s`
          : `${fmt(deletionBeginRel)}s`;
        allCursorAnimations += `<animate attributeName="x" values="${deletionXValues.join(
          ";"
        )}" dur="${fmt(
          totalGraphemeCount * line.deleteSpeed
        )}s" calcMode="discrete" begin="${deletionBeginAttr}" fill="freeze"/>`;
        allCursorAnimations += `<animate attributeName="y" values="${deletionYValues.join(
          ";"
        )}" dur="${fmt(
          totalGraphemeCount * line.deleteSpeed
        )}s" calcMode="discrete" begin="${deletionBeginAttr}" fill="freeze"/>`;
      } else if (deletionBehavior === "clear" && totalGraphemeCount > 0) {
        const clearBeginRel = cycleOffset + totalTypingDuration + pauseDuration;
        const clearBeginAttr = p.repeat
          ? `cycle.begin + ${fmt(clearBeginRel)}s`
          : `${fmt(clearBeginRel)}s`;
        allCursorAnimations += `<animate attributeName="x" to="${fmt(
          beforeCharX[0] + cursorXOffset
        )}" dur="0.01s" begin="${clearBeginAttr}" fill="freeze"/>`;
        allCursorAnimations += `<animate attributeName="y" to="${fmt(
          beforeCharY[0] + cursorYOffset
        )}" dur="0.01s" begin="${clearBeginAttr}" fill="freeze"/>`;
      }

      // Transition to next line cursor position
      if (deletionBehavior !== "stay" || contentIndex < textLines.length - 1) {
        const transitionBegin =
          cycleOffset + totalTypingDuration + pauseDuration + deletionDuration;
        const transitionBeginAttr = p.repeat
          ? `cycle.begin + ${fmt(transitionBegin)}s`
          : `${fmt(transitionBegin)}s`;

        const isLast = contentIndex === textLines.length - 1;
        const nextContentIndex = (contentIndex + 1) % textLines.length;

        if (!isLast || p.repeat) {
          let targetCursorPos;

          if (deletionBehavior === "stay") {
            if (isLast && p.repeat) {
              targetCursorPos = {
                x: globalTextBlockXOffset + cursorXOffset,
                y:
                  globalTextBlockYOffset +
                  (textLines[0].fontSize * 1.3) / 2 +
                  getCursorYOffset(p.cursorStyle, textLines[0].fontSize),
              };
            } else {
              const nextLine = textLines[nextContentIndex];
              const nextLineHeight = nextLine.fontSize * 1.3;
              targetCursorPos = {
                x: globalTextBlockXOffset + cursorXOffset,
                y:
                  textBlockYOffset +
                  textBlockHeight +
                  nextLineHeight / 2 +
                  getCursorYOffset(p.cursorStyle, nextLine.fontSize),
              };
            }
          } else {
            const nextLine = textLines[nextContentIndex];
            const nextTextBlockHeight =
              nextLine.text.split("\n").length * nextLine.fontSize * 1.3;
            
            let nextTextBlockYOffset = (p.height - nextTextBlockHeight) / 2;
            if (p.vAlign === 'top') nextTextBlockYOffset = 20;
            else if (p.vAlign === 'bottom') nextTextBlockYOffset = Math.max(10, p.height - nextTextBlockHeight - 20);

            let nextLineStartX = 20;
            if (p.hAlign === 'center') nextLineStartX = p.width / 2;
            else if (p.hAlign === 'right') nextLineStartX = p.width - 20;

            targetCursorPos = {
              x: nextLineStartX + cursorXOffset,
              y:
                nextTextBlockYOffset +
                (nextLine.fontSize * 1.3) / 2 +
                getCursorYOffset(p.cursorStyle, nextLine.fontSize),
            };
          }

          allCursorAnimations += `<animate attributeName="x" to="${fmt(
            targetCursorPos.x
          )}" dur="0.01s" begin="${transitionBeginAttr}" ${
            p.repeat ? "" : 'fill="freeze"'
          } />`;
          allCursorAnimations += `<animate attributeName="y" to="${fmt(
            targetCursorPos.y
          )}" dur="0.01s" begin="${transitionBeginAttr}" ${
            p.repeat ? "" : 'fill="freeze"'
          } />`;
        }
      }

      cycleOffset += contentCycleDuration;

      if (deletionBehavior === "stay") {
        accumulatedHeight += textBlockHeight;
      }
    }

    overallCycleDuration = cycleOffset || 0;

    let repeatHideBegin: number | null = null;
    if (p.repeat && deletionBehavior === "stay") {
      repeatHideBegin = allLinesTypingDuration;
    }

    const visibilityStartOffset = 0.02;

    const cursorFontSize =
      textLines.length > 0 ? textLines[0].fontSize : p.fontSize;
    
    // Resolve cursor color (custom, or fallback to first line color)
    let finalCursorColor = p.cursorColor || textLines[0].color || "#000000";
    if (finalCursorColor.startsWith("gradient:") || parseGradient(finalCursorColor)) {
      const g = parseGradient(finalCursorColor);
      finalCursorColor = g ? g.from : "#000000";
    }

    let cursorElement = getCursorSvgShape(
      p.cursorStyle,
      finalCursorColor,
      cursorFontSize
    );

    if (cursorElement) {
      let visibilityAnimation = "";
      if (p.repeat) {
        visibilityAnimation += `<animate attributeName="visibility" from="hidden" to="visible" dur="0.01s" begin="cycle.begin + ${fmt(
          visibilityStartOffset
        )}s" fill="freeze"/>`;

        if (deletionBehavior === "stay" && repeatHideBegin !== null) {
          visibilityAnimation += `<animate attributeName="visibility" to="hidden" dur="0.01s" begin="cycle.begin + ${fmt(
            repeatHideBegin
          )}s" fill="freeze"/>`;
        } else {
          visibilityAnimation = `<animate attributeName="visibility" values="hidden;visible;hidden" keyTimes="0;0.001;1" dur="${fmt(
            overallCycleDuration
          )}s" begin="cycle.begin + ${fmt(visibilityStartOffset)}s"/>`;
        }
      } else {
        if (deletionBehavior === "stay") {
          if (p.hideCursorOnComplete) {
            visibilityAnimation = `<animate attributeName="visibility" from="hidden" to="visible" dur="0.01s" begin="0s" fill="freeze"/><animate attributeName="visibility" to="hidden" dur="0.01s" begin="${fmt(
              allLinesTypingDuration
            )}s" fill="freeze"/>`;
          } else {
            visibilityAnimation = `<animate attributeName="visibility" from="hidden" to="visible" dur="0.01s" begin="0s" fill="freeze"/>`;
          }
        } else {
          visibilityAnimation = `<animate attributeName="visibility" from="hidden" to="visible" dur="0.01s" begin="0s" fill="freeze"/><animate attributeName="visibility" to="hidden" dur="0.01s" begin="${fmt(
            overallCycleDuration
          )}s" fill="freeze"/>`;
        }
      }

      allCursorAnimations += visibilityAnimation;

      // Cursor blink animation with custom blink speed
      const blinkDur = fmt(p.cursorBlinkSpeed || 0.7);
      if (deletionBehavior === "stay" && !p.repeat) {
        const blinkStart = overallCycleDuration;
        allCursorAnimations += `<animate attributeName="opacity" values="1;0;1" dur="${fmt(p.cursorBlinkSpeed * 2 || 1.4)}s" begin="${fmt(
          blinkStart
        )}s" repeatCount="indefinite"/>`;
      } else {
        const blinkBegin = p.repeat
          ? `cycle.begin + ${fmt(visibilityStartOffset)}s`
          : "0s";
        allCursorAnimations += `<animate attributeName="opacity" values="1;0" dur="${blinkDur}s" begin="${blinkBegin}" repeatCount="indefinite"/>`;
      }

      cursorElement = cursorElement.replace(
        "/>",
        `>${allCursorAnimations}</rect>`
      );
    } else {
      cursorElement = "";
    }

    // Background rendering logic (solid / gradient / transparent)
    let bgRect = "";
    const borderRadius = fmt(p.borderRadius || 4);
    const strokeAttr = p.border ? 'stroke="#000" stroke-width="1"' : 'stroke="none"';

    if (p.backgroundType === "transparent") {
      bgRect = `<rect x="0.5" y="0.5" width="${fmt(p.width - 1)}" height="${fmt(
        p.height - 1
      )}" fill="none" ${strokeAttr} rx="${borderRadius}"/>`;
    } else if (p.backgroundType === "gradient") {
      const bgGradInfo = parseGradient(p.bgGradient) || { from: "#1e1e2e", to: "#11111b", angle: 45 };
      const { x1, y1, x2, y2 } = getGradientCoordinates(bgGradInfo.angle);
      gradientDefs.push(
        `<linearGradient id="bg-grad" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
          <stop offset="0%" stop-color="${bgGradInfo.from}"/>
          <stop offset="100%" stop-color="${bgGradInfo.to}"/>
        </linearGradient>`
      );
      bgRect = `<rect x="0.5" y="0.5" width="${fmt(p.width - 1)}" height="${fmt(
        p.height - 1
      )}" fill="url(#bg-grad)" fill-opacity="${p.backgroundOpacity}" ${strokeAttr} rx="${borderRadius}"/>`;
    } else {
      // Solid background
      bgRect = `<rect x="0.5" y="0.5" width="${fmt(p.width - 1)}" height="${fmt(
        p.height - 1
      )}" fill="${p.backgroundColor}" fill-opacity="${p.backgroundOpacity}" ${strokeAttr} rx="${borderRadius}"/>`;
    }

    const stylesCSS = `
      ${googleFontsCSS}
      .text-common { 
        dominant-baseline: middle; 
        text-rendering: optimizeLegibility;
        shape-rendering: geometricPrecision;
      }
    `;

    const svg = `<svg width="${fmt(p.width)}" height="${fmt(
      p.height
    )}" viewBox="0 0 ${fmt(p.width)} ${fmt(
      p.height
    )}" xmlns="http://www.w3.org/2000/svg">
  ${bgRect}
  <defs>
    ${
      p.repeat
        ? `<animate id="cycle" begin="0s;cycle.end" dur="${fmt(
            overallCycleDuration
          )}s"/>`
        : ""
    }
    <clipPath id="master-clip"><rect x="0" y="0" width="${fmt(
      p.width
    )}" height="${fmt(p.height)}"/></clipPath>
    ${gradientDefs.join("\n    ")}
    <style type="text/css"><![CDATA[
${stylesCSS.trim()}
    ]]></style>
  </defs>
  <g clip-path="url(#master-clip)">
    ${allTextElements.join("")}
    ${cursorElement}
  </g>
</svg>`;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }
    return new NextResponse(
      JSON.stringify({ error: "An unknown error occurred" }),
      { status: 500 }
    );
  }
}

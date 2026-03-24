import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

import type { PortfolioImage, WorkSeries } from "@/content/portfolio";

const publicImagesDir = path.join(process.cwd(), "public", "images");
const optimizedAiDir = path.join(process.cwd(), "public", ".optimized-ai");

const TARGET_MAX_HEIGHT_PX = 1400;
const SHOULD_OPTIMIZE_AT_RUNTIME = process.env.VERCEL !== "1";

let sharpSingleton: typeof import("sharp") | null = null;

async function optimizeImageToWebp(inputFullPath: string, outFullPath: string) {
  fs.statSync(inputFullPath); // ensure file exists
  const parent = path.dirname(outFullPath);
  if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });

  if (fs.existsSync(outFullPath)) return;

  if (!sharpSingleton) {
    sharpSingleton = (await import("sharp")) as unknown as typeof import("sharp");
  }
  const sharp = sharpSingleton;

  await sharp(inputFullPath)
    .rotate()
    .toColorspace("srgb")
    .resize({ height: TARGET_MAX_HEIGHT_PX, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(outFullPath);
}

function naturalSort(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function listImageFiles(dirFullPath: string) {
  const entries = fs.readdirSync(dirFullPath, { withFileTypes: true });

  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => {
      const lower = name.toLowerCase();
      return lower.endsWith(".png");
    })
    .sort(naturalSort);
}

function listPngOnlySeriesDirs() {
  const entries = fs.readdirSync(publicImagesDir, { withFileTypes: true });

  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort(naturalSort)
    .filter((dirName) => {
      const files = fs.readdirSync(path.join(publicImagesDir, dirName), {
        withFileTypes: true,
      });
      const imageFiles = files.filter((f) => f.isFile()).map((f) => f.name);
      if (imageFiles.length === 0) return false;

      const pngFiles = imageFiles.filter((n) => n.toLowerCase().endsWith(".png"));
      // Include only if the directory is purely PNG (no JPG/JPEG/etc).
      return pngFiles.length === imageFiles.length;
    });
}

function toTitleCase(id: string) {
  if (id.toUpperCase() === id) return id;
  return id
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function defaultRowSizes(count: number): number[] {
  if (count === 5) return [3, 2];
  if (count === 6) return [3, 3];
  if (count === 4) return [2, 2];
  if (count === 3) return [3];
  if (count === 2) return [2];
  return [count];
}

export async function getAiSeries(): Promise<WorkSeries[]> {
  const dirs = listPngOnlySeriesDirs();
  const series: WorkSeries[] = [];

  for (const dirName of dirs) {
    const inputFiles = listImageFiles(path.join(publicImagesDir, dirName));
    if (inputFiles.length === 0) continue;

    let rowSizes = defaultRowSizes(inputFiles.length);

    // Panda Cool requested layout:
    // Top row (2): Daddy Cool! then Mommy Chic
    // Bottom row (3): Daughter Panda, then Kiddo Chill!, then Baby Panda
    if (dirName === "Panda Cool" && inputFiles.length === 5) {
      rowSizes = [2, 3];
    }

    const images: PortfolioImage[] = [];
    const orderedFiles = (() => {
      if (dirName === "ChatMurai") {
        // Exact placement request for ChatMurai (5 images => 3 + 2):
        // - Top row (3): 1st = "Paw-sitive vibes" (Geichat), 3rd = Cat-astrophic
        // - Bottom row (2): left = Kitty Cat-Ana, right = Paw-tner in crime!

        const pawPositiveIdx = inputFiles.findIndex((f) =>
          f.toLowerCase().includes("geichat")
        );
        const moProblemIdx = inputFiles.findIndex((f) => {
          const l = f.toLowerCase();
          return l.includes("mo money") || l.includes("mo problem");
        });
        const catAstIdx = inputFiles.findIndex((f) =>
          f.toLowerCase().includes("cat-astrophic")
        );
        const kittyAnaIdx = inputFiles.findIndex((f) =>
          f.toLowerCase().includes("kitty cat")
        );
        const pawTnerIdx = inputFiles.findIndex((f) =>
          f.toLowerCase().includes("paw-tner")
        );

        if (
          pawPositiveIdx === -1 ||
          moProblemIdx === -1 ||
          catAstIdx === -1 ||
          kittyAnaIdx === -1 ||
          pawTnerIdx === -1
        ) {
          return inputFiles;
        }

        const pawPositiveFile = inputFiles[pawPositiveIdx]!;
        const moFile = inputFiles[moProblemIdx]!;
        const catFile = inputFiles[catAstIdx]!;
        const kittyFile = inputFiles[kittyAnaIdx]!;
        const pawTnerFile = inputFiles[pawTnerIdx]!;

        return [
          pawPositiveFile,
          moFile,
          catFile,
          kittyFile,
          pawTnerFile,
        ];
      }

      if (dirName === "Panda Cool") {
        const daddyIdx = inputFiles.findIndex((f) =>
          f.toLowerCase().includes("daddy")
        );
        const mommyIdx = inputFiles.findIndex((f) =>
          f.toLowerCase().includes("mommy chic")
        );
        const daughterIdx = inputFiles.findIndex((f) =>
          f.toLowerCase().includes("daughter")
        );
        const kiddoIdx = inputFiles.findIndex((f) =>
          f.toLowerCase().includes("kiddo")
        );
        const babyIdx = inputFiles.findIndex((f) =>
          f.toLowerCase().includes("baby panda")
        );

        if (
          daddyIdx === -1 ||
          mommyIdx === -1 ||
          daughterIdx === -1 ||
          kiddoIdx === -1 ||
          babyIdx === -1
        ) {
          return inputFiles;
        }

        const daddyFile = inputFiles[daddyIdx]!;
        const mommyFile = inputFiles[mommyIdx]!;
        const daughterFile = inputFiles[daughterIdx]!;
        const kiddoFile = inputFiles[kiddoIdx]!;
        const babyFile = inputFiles[babyIdx]!;

        // With rowSizes=[2,3], order maps to:
        // [top1, top2, bottom1, bottom2, bottom3]
        return [daddyFile, mommyFile, daughterFile, kiddoFile, babyFile];
      }

      if (dirName === "Classic tatoo") {
        // Requested layout for 5 images: 2 + 2 + 1
        // Top row: Classic tatooed Camera, Instrumheart
        // Middle row: Baby Vibes, Riding the Vibes
        // Bottom row: Surfy Vibe
        rowSizes = [2, 2, 1];

        const cameraIdx = inputFiles.findIndex((f) =>
          f.toLowerCase().includes("classic tatooed camera")
        );
        const instrumheartIdx = inputFiles.findIndex((f) =>
          f.toLowerCase().includes("instrumheart")
        );
        const ridingIdx = inputFiles.findIndex((f) =>
          f.toLowerCase().includes("riding the vibes")
        );
        const babyIdx = inputFiles.findIndex((f) =>
          f.toLowerCase().includes("baby vibes")
        );
        const surfyIdx = inputFiles.findIndex((f) =>
          f.toLowerCase().includes("surfy vibe")
        );

        if (
          cameraIdx === -1 ||
          instrumheartIdx === -1 ||
          ridingIdx === -1 ||
          babyIdx === -1 ||
          surfyIdx === -1
        ) {
          return inputFiles;
        }

        const cameraFile = inputFiles[cameraIdx]!;
        const instrumheartFile = inputFiles[instrumheartIdx]!;
        const ridingFile = inputFiles[ridingIdx]!;
        const babyFile = inputFiles[babyIdx]!;
        const surfyFile = inputFiles[surfyIdx]!;

        return [
          cameraFile,
          instrumheartFile,
          babyFile,
          ridingFile,
          surfyFile,
        ];
      }

      return inputFiles;
    })();

    for (const fileName of orderedFiles) {
      const inputFullPath = path.join(publicImagesDir, dirName, fileName);

      if (!SHOULD_OPTIMIZE_AT_RUNTIME) {
        images.push({
          src: `/images/${encodeURIComponent(dirName)}/${encodeURIComponent(fileName)}`,
          alt: `${dirName} image ${images.length + 1}`,
        });
        continue;
      }

      const st = fs.statSync(inputFullPath);
      const cacheKey = `${st.mtimeMs}:${st.size}`;
      const hash = crypto.createHash("sha1").update(cacheKey).digest("hex").slice(0, 10);

      const base = path.parse(fileName).name.replace(/\s+/g, "_");
      const outName = `${hash}-${base}.webp`;
      const outFullPath = path.join(optimizedAiDir, dirName, outName);

      await optimizeImageToWebp(inputFullPath, outFullPath);

      images.push({
        src: `/.optimized-ai/${encodeURIComponent(dirName)}/${encodeURIComponent(outName)}`,
        alt: `${dirName} image ${images.length + 1}`,
      });
    }

    series.push({
      id: dirName,
      title: toTitleCase(dirName),
      descriptor: `${inputFiles.length} images`,
      rowSizes,
      images,
    });
  }

  // Swap "Classic tatoo" and "Panda Cool" series blocks as requested.
  const classicId = "Classic tatoo";
  const pandaId = "Panda Cool";
  const classicIndex = series.findIndex((s) => s.id === classicId);
  const pandaIndex = series.findIndex((s) => s.id === pandaId);
  if (classicIndex !== -1 && pandaIndex !== -1 && classicIndex !== pandaIndex) {
    const tmp = series[classicIndex]!;
    series[classicIndex] = series[pandaIndex]!;
    series[pandaIndex] = tmp;
  }

  return series;
}


import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

import type { PortfolioImage, WorkSeries } from "@/content/portfolio";
import { workLayoutOverrides } from "@/content/workLayoutOverrides";

const publicImagesDir = path.join(process.cwd(), "public", "images");
const optimizedWorkDir = path.join(
  process.cwd(),
  "public",
  ".optimized-work"
);
const TARGET_MAX_HEIGHT_PX = 1400;

let sharpSingleton: typeof import("sharp") | null = null;

async function optimizeImageToWebp(inputFullPath: string, outFullPath: string) {
  fs.statSync(inputFullPath); // ensure file exists
  const parent = path.dirname(outFullPath);
  if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });

  // If already exists, assume it's correct (hash in name covers updates).
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

  // No need to stamp mtime: output file name is already content-addressed.
}

function toTitleCase(id: string) {
  if (id.toUpperCase() === id) return id; // Preserve all-caps abbreviations like "SF"
  return id
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
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
      return (
        lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".png") ||
        lower.endsWith(".webp") ||
        lower.endsWith(".gif") ||
        lower.endsWith(".svg")
      );
    })
    .sort(naturalSort);
}

function isPngOnlySeries(files: string[]) {
  // If a directory contains only PNG images, it's considered AI Visuals content and
  // must not appear under Photography (/work).
  return files.length > 0 && files.every((f) => f.toLowerCase().endsWith(".png"));
}

function listSeriesDirs() {
  const entries = fs.readdirSync(publicImagesDir, { withFileTypes: true });

  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort(naturalSort);
}

function trailingNumber(fileName: string): number | null {
  // Matches "Boat 4.jpg" -> 4 (works with common "name <n>.<ext>" patterns)
  const match = fileName.match(/(\d+)(?=\.[^.]+$)/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

function defaultRowSizes(count: number): number[] {
  if (count === 5) return [3, 2];
  if (count === 6) return [3, 3];
  if (count === 4) return [2, 2];
  if (count === 3) return [3];
  if (count === 2) return [2];
  return [count];
}

export async function getWorkSeries(): Promise<WorkSeries[]> {
  const dirs = listSeriesDirs();
  const series: WorkSeries[] = [];

  for (const dirName of dirs) {
    const files = listImageFiles(path.join(publicImagesDir, dirName));
    if (files.length === 0) continue;
    if (isPngOnlySeries(files)) continue;

    const count = files.length;
    const override = workLayoutOverrides[dirName]?.rowSizes;
    const rowSizes = override ?? defaultRowSizes(count);

    const reorderByNumbers = workLayoutOverrides[dirName]?.reorderByNumbers;
    const reorderedFiles = (() => {
      if (!reorderByNumbers || reorderByNumbers.length === 0) return files;

      const byNumber = new Map<number, string>();
      for (const fileName of files) {
        const n = trailingNumber(fileName);
        if (n == null) continue;
        byNumber.set(n, fileName);
      }

      const used = new Set<string>();
      const ordered: string[] = [];
      for (const n of reorderByNumbers) {
        const fileName = byNumber.get(n);
        if (!fileName) continue;
        if (used.has(fileName)) continue;
        used.add(fileName);
        ordered.push(fileName);
      }

      const rest = files.filter((f) => !used.has(f));
      return [...ordered, ...rest];
    })();

    const images: PortfolioImage[] = [];
    for (let idx = 0; idx < reorderedFiles.length; idx++) {
      const fileName = reorderedFiles[idx]!;
      const inputFullPath = path.join(publicImagesDir, dirName, fileName);

      const st = fs.statSync(inputFullPath);
      const cacheKey = `${st.mtimeMs}:${st.size}`;
      const hash = crypto
        .createHash("sha1")
        .update(cacheKey)
        .digest("hex")
        .slice(0, 10);

      const base = path.parse(fileName).name.replace(/\s+/g, "_");
      const outName = `${hash}-${base}.webp`;
      const outFullPath = path.join(optimizedWorkDir, dirName, outName);

      await optimizeImageToWebp(inputFullPath, outFullPath);

      images.push({
        src: `/.optimized-work/${encodeURIComponent(dirName)}/${encodeURIComponent(
          outName
        )}`,
        alt: `${dirName} image ${idx + 1}`,
      });
    }

    series.push({
      id: dirName,
      title: toTitleCase(dirName),
      descriptor: `${count} images`,
      rowSizes,
      images,
    });
  }

  // Make sure the "Dappking" block starts the Work page.
  const firstId = "Dappking";
  const firstIndex = series.findIndex((s) => s.id === firstId);
  if (firstIndex > 0) {
    const [first] = series.splice(firstIndex, 1);
    series.unshift(first);
  }

  // Then place "Casino" right after "Dappking".
  const secondId = "Casino";
  const secondIndex = series.findIndex((s) => s.id === secondId);
  if (secondIndex > 1) {
    const [second] = series.splice(secondIndex, 1);
    series.splice(1, 0, second);
  }

  // Then place "Edito" right after "Dappking" + "Casino".
  const thirdId = "Edito";
  const thirdIndex = series.findIndex((s) => s.id === thirdId);
  if (thirdIndex > 2) {
    const [third] = series.splice(thirdIndex, 1);
    series.splice(2, 0, third);
  }

  // Then place "LNQL" right after "Dappking" + "Casino" + "Edito".
  const lnqlId = "LNQL";
  const lnqlIndex = series.findIndex((s) => s.id === lnqlId);
  if (lnqlIndex > -1 && lnqlIndex !== 3) {
    const [lnql] = series.splice(lnqlIndex, 1);
    series.splice(3, 0, lnql);
  }

  // Then chain: Jimmy -> Duke -> Mechanhumanimal after LNQL.
  const chainAfterId = "LNQL";
  const chainAfterIndex = series.findIndex((s) => s.id === chainAfterId);
  const chain = ["Jimmy", "Duke", "Mechanhumanimal"];
  if (chainAfterIndex !== -1) {
    for (let offset = 0; offset < chain.length; offset++) {
      const id = chain[offset]!;
      const idx = series.findIndex((s) => s.id === id);
      if (idx === -1) continue;
      const targetIndex = chainAfterIndex + 1 + offset;
      if (idx === targetIndex) continue;
      const [item] = series.splice(idx, 1);
      series.splice(targetIndex, 0, item);
    }
  }

  // Then place: Random then Perdition after Mechanhumanimal.
  const anchorId = "Mechanhumanimal";
  const anchorIndex = series.findIndex((s) => s.id === anchorId);
  if (anchorIndex !== -1) {
    const chainTail = ["Random", "Perdition"];
    let insertIndex = anchorIndex + 1;

    for (const id of chainTail) {
      const currentIndex = series.findIndex((s) => s.id === id);
      if (currentIndex === -1) continue;

      if (currentIndex !== insertIndex) {
        const [item] = series.splice(currentIndex, 1);

        // If we removed an item before the insertion point, the insertion point shifts left.
        if (currentIndex < insertIndex) insertIndex -= 1;

        series.splice(insertIndex, 0, item);
      }

      insertIndex += 1;
    }
  }

  // Inverse "Random" and "Mechanhumanimal" positions.
  const randomId = "Random";
  const mechaId = "Mechanhumanimal";
  const randomIndex = series.findIndex((s) => s.id === randomId);
  const mechaIndex = series.findIndex((s) => s.id === mechaId);
  if (randomIndex !== -1 && mechaIndex !== -1 && randomIndex !== mechaIndex) {
    const tmp = series[randomIndex]!;
    series[randomIndex] = series[mechaIndex]!;
    series[mechaIndex] = tmp;
  }

  // Place "Tree" right after "Perdition".
  const perditionId = "Perdition";
  const treeId = "Tree";
  const perditionIndex = series.findIndex((s) => s.id === perditionId);
  const treeIndex = series.findIndex((s) => s.id === treeId);
  if (perditionIndex !== -1 && treeIndex !== -1) {
    const desiredIndex = perditionIndex + 1;
    if (treeIndex !== desiredIndex) {
      const [tree] = series.splice(treeIndex, 1);
      // If we removed something before the desired index, shift the target.
      const adjustedDesiredIndex =
        treeIndex < desiredIndex ? desiredIndex - 1 : desiredIndex;
      series.splice(adjustedDesiredIndex, 0, tree);
    }
  }

  // Enforce explicit final order from user instructions.
  const desiredOrder = [
    "Dappking",
    "Casino",
    "Edito",
    "LNQL",
    "Jimmy",
    "Duke",
    "Random",
    // Invert Mecha and Perdition as requested
    "Perdition",
    "Mechanhumanimal",
    "Tree",
    "SF",
    "Alcatraz",
    "Boat",
  ];

  const byId = new Map(series.map((s) => [s.id, s]));
  const ordered = desiredOrder
    .map((id) => byId.get(id))
    .filter(Boolean) as WorkSeries[];

  const remaining = series.filter((s) => !desiredOrder.includes(s.id));

  return [...ordered, ...remaining];
}


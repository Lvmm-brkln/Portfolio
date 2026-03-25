import type { PortfolioImage, WorkSeries } from "@/content/portfolio";

function toTitleCase(id: string) {
  if (id.toUpperCase() === id) return id; // Preserve all-caps abbreviations like "SF"
  return id
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

type WorkManifestEntry = {
  id: string;
  rowSizes: number[];
  files: Array<string | { src: string; altLabel?: string }>;
};

const WORK_MANIFEST: WorkManifestEntry[] = [
  { id: "Dappking", rowSizes: [3], files: ["Dappking 1.jpg", "Dappking 2.jpg", "Dappking 3.jpg"] },
  { id: "Casino", rowSizes: [3], files: ["Casino 3.jpg", "Casino 2.jpg", "Casino 1.jpg"] },
  { id: "Edito", rowSizes: [3], files: ["Edito mode 1.jpg", "Edito Mode 2.jpg", "Edito Mode 3.jpg"] },
  {
    id: "LNQL",
    rowSizes: [3, 2],
    files: [
      "LNQL 4.jpg",
      { src: "/.optimized-work/LNQL/59fa5a77c4-LNQL_3.webp", altLabel: "LNQL 3" },
      "LNQL 1.jpg",
      "LNQL 5.jpg",
      "LNQL 2.jpg",
    ],
  },
  { id: "Jimmy", rowSizes: [3], files: ["Jimmy 1.jpg", "Jimmy 2.jpg", "Jimmy 3.jpg"] },
  { id: "Duke", rowSizes: [3, 2], files: ["Duke 1.jpg", "Duke 2.jpg", "Duke 3.jpg", "Duke 5.jpg", "Duke 4.jpg"] },
  { id: "Random", rowSizes: [2], files: ["Random 1.jpg", "Random 2.jpg"] },
  { id: "Perdition", rowSizes: [3, 3], files: ["Perdition 1.jpg", "Perdition 2.jpg", "Perdition 3.jpg", "Perdition 4.jpg", "Perdition 5.jpg", "Perdition 6.jpg"] },
  { id: "Mechanhumanimal", rowSizes: [3], files: ["Mechanhumanimal 1.jpg", "Mechanhumanimal 2.jpg", "Mechanhumanimal 3.jpg"] },
  { id: "Tree", rowSizes: [1], files: ["Tree.jpg"] },
  { id: "SF", rowSizes: [3], files: ["SF 1.jpg", "SF 2.jpg", "SF 3.jpg"] },
  { id: "Alcatraz", rowSizes: [3], files: ["Alcatraz 1.jpg", "Alcatraz 2.jpg", "Alcatraz 3.jpg"] },
  { id: "Boat", rowSizes: [3, 2], files: ["Boat 4.jpg", "Boat 2.jpg", "Boat 5.jpg", "Boat 1.jpg", "Boat 3.jpg"] },
];

const WORK_MOBILE_OVERRIDES: Record<
  string,
  { mobileOrder: number[]; mobileHideIndices?: number[] }
> = {
  Dappking: { mobileOrder: [2, 3, 1] },
  Casino: { mobileOrder: [3, 1, 2] },
  Edito: { mobileOrder: [1, 3, 2] },
  LNQL: { mobileOrder: [1, 4, 3, 2, 5] },
  Jimmy: { mobileOrder: [2, 1, 3] },
  Duke: { mobileOrder: [2, 4, 5, 3, 1] },
  Random: { mobileOrder: [1, 2] },
  Perdition: { mobileOrder: [1, 2, 3, 4, 5, 6] },
  Mechanhumanimal: { mobileOrder: [2, 3, 1] },
  Tree: { mobileOrder: [1] },
  SF: { mobileOrder: [2, 1, 3] },
  Alcatraz: { mobileOrder: [3, 2, 1] },
  Boat: {
    mobileOrder: [3, 1, 2],
    mobileHideIndices: [4, 5], // hide old #4 and #5 only on mobile feed
  },
};

export async function getWorkSeries(): Promise<WorkSeries[]> {
  const series: WorkSeries[] = WORK_MANIFEST.map((entry) => {
    const overrides = WORK_MOBILE_OVERRIDES[entry.id];
    const images: PortfolioImage[] = entry.files.map((fileRef, idx) => {
      if (typeof fileRef === "string") {
        return {
          src: `/images/${encodeURIComponent(entry.id)}/${encodeURIComponent(fileRef)}`,
          alt: `${entry.id} image ${idx + 1}`,
        };
      }

      return {
        src: fileRef.src,
        alt: fileRef.altLabel ? `${fileRef.altLabel}` : `${entry.id} image ${idx + 1}`,
      };
    });

    return {
      id: entry.id,
      title: toTitleCase(entry.id),
      descriptor: `${entry.files.length} images`,
      rowSizes: entry.rowSizes,
      images,
      mobileOrder: overrides?.mobileOrder,
      mobileHideIndices: overrides?.mobileHideIndices,
    };
  });

  return series;
}


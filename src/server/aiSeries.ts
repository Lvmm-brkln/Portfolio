import type { PortfolioImage, WorkSeries } from "@/content/portfolio";

function toTitleCase(id: string) {
  if (id.toUpperCase() === id) return id;
  return id
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

type AiManifestEntry = {
  id: string;
  rowSizes: number[];
  files: string[];
};

const AI_MANIFEST: AiManifestEntry[] = [
  {
    id: "ChatMurai",
    rowSizes: [3, 2],
    files: [
      "Geichat.png",
      "Mo Money Mo Problem copie.png",
      "Cat-astrophic.png",
      "Kitty Cat-Ana.png",
      "Paw-tner in crime!.png",
    ],
  },
  {
    id: "Panda Cool",
    rowSizes: [2, 3],
    files: [
      "Daddy Cool!.png",
      "Mommy Chic.png",
      "Daughter Panda.png",
      "Kiddo Chill!.png",
      "Baby Panda.png",
    ],
  },
  {
    id: "Classic tatoo",
    rowSizes: [2, 2, 1],
    files: [
      "Classic tatooed Camera.png",
      "Instrumheart.png",
      "Baby Vibes.png",
      "Riding the Vibes.png",
      "Surfy Vibe.png",
    ],
  },
];

const AI_MOBILE_OVERRIDES: Record<string, { mobileOrder: number[] }> = {
  ChatMurai: { mobileOrder: [1, 2, 3, 4, 5] },
  "Panda Cool": { mobileOrder: [1, 2, 3, 4, 5] },
  "Classic tatoo": { mobileOrder: [1, 2, 4, 3, 5] },
};

export async function getAiSeries(): Promise<WorkSeries[]> {
  return AI_MANIFEST.map((entry) => {
    const overrides = AI_MOBILE_OVERRIDES[entry.id];
    const images: PortfolioImage[] = entry.files.map((fileName, idx) => ({
      src: `/images/${encodeURIComponent(entry.id)}/${encodeURIComponent(fileName)}`,
      alt: `${entry.id} image ${idx + 1}`,
    }));

    return {
      id: entry.id,
      title: toTitleCase(entry.id),
      descriptor: `${entry.files.length} images`,
      rowSizes: entry.rowSizes,
      images,
      mobileOrder: overrides?.mobileOrder,
    };
  });
}


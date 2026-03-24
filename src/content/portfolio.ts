export type PortfolioImage = {
  src: string;
  alt: string;
  aspectRatio?: string; // CSS aspect-ratio value, e.g. "4 / 5"
};

export type WorkSeries = {
  id: string;
  title: string;
  descriptor?: string;
  rowSizes?: number[]; // e.g. [3,2] or [2,3] for 5 images
  images: PortfolioImage[];
};

const placeholder = (n: number) =>
  `/images/selected-${String(n).padStart(2, "0")}.svg`;

const images: PortfolioImage[] = [
  { src: placeholder(1), alt: "Selected image 01", aspectRatio: "4 / 5" },
  { src: placeholder(2), alt: "Selected image 02", aspectRatio: "4 / 5" },
  { src: placeholder(3), alt: "Selected image 03", aspectRatio: "4 / 5" },
  { src: placeholder(4), alt: "Selected image 04", aspectRatio: "4 / 5" },
  { src: placeholder(5), alt: "Selected image 05", aspectRatio: "4 / 5" },
  { src: placeholder(6), alt: "Selected image 06", aspectRatio: "4 / 5" },
  { src: placeholder(1), alt: "Selected image 07", aspectRatio: "4 / 5" },
  { src: placeholder(2), alt: "Selected image 08", aspectRatio: "4 / 5" },
  { src: placeholder(3), alt: "Selected image 09", aspectRatio: "4 / 5" },
  { src: placeholder(4), alt: "Selected image 10", aspectRatio: "4 / 5" },
  { src: placeholder(5), alt: "Selected image 11", aspectRatio: "4 / 5" },
  { src: placeholder(6), alt: "Selected image 12", aspectRatio: "4 / 5" },
];

export const selectedImages: PortfolioImage[] = images;


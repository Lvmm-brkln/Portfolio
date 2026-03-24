export const workLayoutOverrides: Record<
  string,
  {
    // If provided, overrides how 5-image series are split into rows (e.g. [3,2] vs [2,3]).
    rowSizes?: number[];
    // If provided, reorders images by numeric indices, e.g. [4,5,1,2,3].
    // This is applied to file names like "Boat 4.jpg".
    reorderByNumbers?: number[];
  }
> = {
  // Defaults (5 images): 3 + 2 (top row has 3, bottom row has 2)
  // Update these when you want a different split for a specific folder.
  // Boat 4, then Boat 2, then Boat 5 (requires 3+2 split so 2 can be between)
  Boat: { rowSizes: [3, 2], reorderByNumbers: [4, 2, 5, 1, 3] },
  // Inverse Duke 4 and Duke 5 => order: 1,2,3,5,4
  Duke: { rowSizes: [3, 2], reorderByNumbers: [1, 2, 3, 5, 4] },
  // Inverse Casino 1 and Casino 3 => display order: 3,2,1
  Casino: { rowSizes: [3], reorderByNumbers: [3, 2, 1] },
  // Current base order for LNQL: 2,3,1,5,4
  // Inverse LNQL 4 and LNQL 2 => order: 4,3,1,5,2
  LNQL: { rowSizes: [3, 2], reorderByNumbers: [4, 3, 1, 5, 2] },
};


export const site = {
  name: "Jeremie de Gueltzl",
  subtitle: "Photographer, AI visual curator, image tutor mindset",
  heroStatement:
    "I build visual systems where composition, lighting, and color are explicit decisions. My photography and AI-led image work are curated like training data: intentional, readable, and critique-ready.",
  workPageIntro:
    "A curated sequence of photographic series focused on narrative clarity, tonal control, and high signal composition.",
  about:
    "My background is in photography with a focus on editorial storytelling and controlled image direction. I work across concept, light, color, and composition, then refine each frame in post-production so every visual decision is legible and intentional.",
  xaiPitch:
    "This portfolio is built to demonstrate visual judgment for AI systems: curation quality, stylistic consistency, and concise critique of why an image works or fails.",
  visualCriteria: [
    "Composition: subject hierarchy, framing pressure, and gaze routing.",
    "Lighting: source logic, falloff discipline, and highlight integrity.",
    "Color: palette intent, separation, and emotional temperature.",
    "Story: readability, tension, and narrative economy.",
  ],
  critiqueExamples: [
    {
      title: "Composition signal",
      insight:
        "Frames are selected when subject hierarchy reads instantly and secondary elements support the narrative instead of competing with it.",
    },
    {
      title: "Lighting discipline",
      insight:
        "I favor images where light direction is clear, highlight rolloff is controlled, and skin/texture remain believable after grading.",
    },
    {
      title: "Color intent",
      insight:
        "Final picks preserve palette separation and emotional tone while avoiding decorative color shifts that reduce readability.",
    },
    {
      title: "Story clarity",
      insight:
        "Images pass when the viewer can infer tension, context, or character in seconds, without additional explanation.",
    },
  ],
  aiProcess: [
    "Prompt intention is defined before generation (subject, mood, lens logic, palette constraints).",
    "Outputs are iterated through comparative critique, not random variation.",
    "Final selection is curated for signal quality: coherence, taste, and compositional rigor.",
  ],
  curationSignals: {
    pass: [
      "Clear visual hierarchy and intentional focal routing.",
      "Coherent light logic and controlled tonal range.",
      "Style consistency with the target series language.",
    ],
    reject: [
      "Ambiguous focal point or noisy framing decisions.",
      "Artificial texture, unstable anatomy, or incoherent materials.",
      "Palette drift that breaks emotional continuity.",
    ],
  },
  xaiFit: [
    "Visual annotation mindset: I articulate strengths and weaknesses with concise, reproducible criteria.",
    "Curation discipline: I prioritize tasteful, high-signal outputs over volume.",
    "AI image fluency: I iterate with intent and evaluate outputs against composition, lighting, and style goals.",
  ],
  contact: {
    email: "hello@yourdomain.com",
    instagramUrl: "https://instagram.com/yourhandle",
    instagramHandle: "yourhandle",
    resumeUrl: "/resume.pdf",
  },
} as const;


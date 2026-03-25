export const site = {
  name: "Jeremie de Gueltzl",
  subtitle: "Photographer, AI visual curator, image tutor mindset",
  heroStatement:
    "I build visual systems where composition, lighting, and color are explicit decisions. My photography and AI-led image work are curated like training data: intentional, readable, and critique-ready.",
  workPageIntro:
    "A curated sequence of photographic series focused on narrative clarity, tonal control, and high signal composition.",
  about:
    "I started photography at 12 and later worked professionally across portrait, fashion, and real estate. That background trained my eye through real production work: composition, light, color, atmosphere, image selection, and the level of precision required to make an image feel clear, intentional, and resolved.\n\nAlongside photography, I built a strong foundation in retouching and post-production. That part of the work shaped me just as much. It taught me to care about structure, consistency, restraint, and the small decisions that separate a good image from one that truly holds up.\n\nOver time, that same curiosity extended beyond photography. I completed The Hacking Project bootcamp in Paris out of curiosity, to better understand the digital world around me and how things are built within it, then began exploring product ideas more seriously through prototyping, generative tools, and AI-assisted workflows. I am comfortable working with tools like Cursor to develop concepts, test directions, and turn ideas into working digital prototypes.\n\nMore recently, I have been focused on a product related to timestamped, hashed proof for contract and evidence workflows.\n\nWhat defines my work today is the combination of a real visual background, strong post-production discipline, and a grounded approach to building digital work with clarity, utility, and care.",
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


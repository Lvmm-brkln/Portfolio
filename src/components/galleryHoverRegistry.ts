type HoverShift = { shiftX: number; shiftY: number };

type HoverSubscriber = {
  activate: (shift: HoverShift) => void;
  deactivate: () => void;
  setDimOpacity: (opacity: number) => void;
};

const subscribers = new Map<string, HoverSubscriber>();
let activeId: string | null = null;
let dimInitialized = false;

function register(id: string, subscriber: HoverSubscriber) {
  subscribers.set(id, subscriber);

  if (!dimInitialized) {
    subscriber.setDimOpacity(1);
    return;
  }

  subscriber.setDimOpacity(id === activeId ? 1 : 0.38);
}

function unregister(id: string) {
  subscribers.delete(id);

  if (activeId === id) {
    activeId = null;
    dimInitialized = false;
    subscribers.forEach((s) => s.setDimOpacity(1));
  }
}

function setActive(id: string, shift: HoverShift) {
  if (activeId === id) return;

  const prevId = activeId;
  activeId = id;

  if (!dimInitialized) {
    dimInitialized = true;
    subscribers.forEach((s, sid) => s.setDimOpacity(sid === id ? 1 : 0.38));
  } else {
    if (prevId) {
      subscribers.get(prevId)?.setDimOpacity(0.38);
    }
    subscribers.get(id)?.setDimOpacity(1);
  }

  if (prevId) subscribers.get(prevId)?.deactivate();
  subscribers.get(id)?.activate(shift);
}

function clearActiveIfMatches(id: string) {
  if (activeId !== id) return;

  activeId = null;
  dimInitialized = false;
  subscribers.forEach((s) => s.setDimOpacity(1));
  subscribers.get(id)?.deactivate();
}

export const galleryHoverRegistry = {
  register,
  unregister,
  setActive,
  clearActiveIfMatches,
};


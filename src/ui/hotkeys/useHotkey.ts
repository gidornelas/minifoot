import { useEffect } from "react";

interface UseHotkeyOptions {
  enabled?: boolean;
  enableOnFormTags?: boolean;
  preventDefault?: boolean;
}

export function useHotkey(
  key: string,
  handler: (event: KeyboardEvent) => void,
  options: UseHotkeyOptions = {},
): void {
  const { enabled = true, enableOnFormTags = false, preventDefault = true } = options;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!enableOnFormTags && isFormTarget(event.target)) {
        return;
      }

      if (!matchesKey(event, key)) {
        return;
      }

      if (preventDefault) {
        event.preventDefault();
      }

      handler(event);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [enableOnFormTags, enabled, handler, key, preventDefault]);
}

function isFormTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

function matchesKey(event: KeyboardEvent, key: string): boolean {
  if (key === "mod+s") {
    return (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";
  }

  if (key === "space") {
    return event.key === " " || event.code === "Space";
  }

  if (key === "?") {
    return event.key === "?";
  }

  if (key === "escape") {
    return event.key === "Escape";
  }

  return event.key.toLowerCase() === key.toLowerCase();
}

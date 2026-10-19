import type { GuitarInteraction } from './strings';

const STRING_BUTTON_SELECTOR = 'button[data-guitar-string]';

const KEY_DIRECTIONS: Readonly<Record<string, 1 | -1>> = {
  ArrowUp: -1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowRight: 1,
};

export function isStringDisabled(button: HTMLButtonElement): boolean {
  return button.disabled || button.getAttribute('aria-disabled') === 'true';
}

export function stringIndexFromButton(button: HTMLButtonElement): number | null {
  const raw: string | undefined = button.dataset.stringIndex;
  if (raw === undefined || raw.length === 0) {
    return null;
  }
  const index: number = Number(raw);
  if (!Number.isInteger(index)) {
    return null;
  }
  return index;
}

export function setPressedString(buttons: readonly HTMLButtonElement[], stringIndex: number): void {
  for (const button of buttons) {
    const index: number | null = stringIndexFromButton(button);
    button.setAttribute('aria-pressed', index === stringIndex ? 'true' : 'false');
  }
}

function mod(value: number, count: number): number {
  return ((value % count) + count) % count;
}

export function focusAdjacentString(
  buttons: readonly HTMLButtonElement[],
  current: HTMLButtonElement,
  direction: 1 | -1,
): void {
  const start: number = buttons.indexOf(current);
  if (start < 0 || buttons.length === 0) {
    return;
  }

  for (let step = 1; step < buttons.length; step += 1) {
    const index: number = mod(start + direction * step, buttons.length);
    const candidate: HTMLButtonElement | undefined = buttons[index];
    if (candidate && !isStringDisabled(candidate)) {
      candidate.focus();
      return;
    }
  }
}

function activateString(
  button: HTMLButtonElement,
  buttons: readonly HTMLButtonElement[],
  onStringActivate: GuitarInteraction,
): void {
  if (isStringDisabled(button)) {
    return;
  }
  const stringIndex: number | null = stringIndexFromButton(button);
  if (stringIndex === null) {
    return;
  }
  setPressedString(buttons, stringIndex);
  onStringActivate(stringIndex);
}

const TOUCH_MOVE_TOLERANCE = 12;

type TouchOrigin = {
  x: number;
  y: number;
};

export function bindGuitar(root: HTMLElement, onStringActivate: GuitarInteraction): () => void {
  const buttons: HTMLButtonElement[] = Array.from(
    root.querySelectorAll<HTMLButtonElement>(STRING_BUTTON_SELECTOR),
  );
  let touchedAt = 0;
  let touchOrigin: TouchOrigin | null = null;
  let touchMoved = false;

  function onClick(event: MouseEvent): void {
    if (Date.now() - touchedAt < 700) {
      touchedAt = 0;
      return;
    }
    const button: EventTarget | null = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    activateString(button, buttons, onStringActivate);
  }

  function onTouchStart(event: TouchEvent): void {
    const touch: Touch | undefined = event.changedTouches[0];
    if (!touch) {
      return;
    }
    touchOrigin = { x: touch.clientX, y: touch.clientY };
    touchMoved = false;
  }

  function onTouchMove(event: TouchEvent): void {
    const touch: Touch | undefined = event.changedTouches[0];
    if (!touch || !touchOrigin) {
      return;
    }
    const movedX: number = Math.abs(touch.clientX - touchOrigin.x);
    const movedY: number = Math.abs(touch.clientY - touchOrigin.y);
    if (movedX > TOUCH_MOVE_TOLERANCE || movedY > TOUCH_MOVE_TOLERANCE) {
      touchMoved = true;
    }
  }

  function onTouchEnd(event: TouchEvent): void {
    const button: EventTarget | null = event.currentTarget;
    const moved: boolean = touchMoved;
    touchOrigin = null;
    touchMoved = false;
    if (!(button instanceof HTMLButtonElement) || moved) {
      return;
    }
    touchedAt = Date.now();
    if (!isStringDisabled(button)) {
      button.focus();
    }
    activateString(button, buttons, onStringActivate);
  }

  function onKeyDown(event: KeyboardEvent): void {
    const direction: 1 | -1 | undefined = KEY_DIRECTIONS[event.key];
    if (direction === undefined) {
      return;
    }
    const button: EventTarget | null = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    event.preventDefault();
    focusAdjacentString(buttons, button, direction);
  }

  for (const button of buttons) {
    button.addEventListener('click', onClick);
    button.addEventListener('touchstart', onTouchStart, { passive: true });
    button.addEventListener('touchmove', onTouchMove, { passive: true });
    button.addEventListener('touchend', onTouchEnd);
    button.addEventListener('keydown', onKeyDown);
  }

  return (): void => {
    for (const button of buttons) {
      button.removeEventListener('click', onClick);
      button.removeEventListener('touchstart', onTouchStart);
      button.removeEventListener('touchmove', onTouchMove);
      button.removeEventListener('touchend', onTouchEnd);
      button.removeEventListener('keydown', onKeyDown);
    }
  };
}

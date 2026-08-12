export function getUiRoot(): HTMLDivElement {
  const root = document.querySelector<HTMLDivElement>("#ui-root");
  if (!root) throw new Error("Missing #ui-root host");
  return root;
}

export function renderScreen(className: string): HTMLElement {
  const root = getUiRoot();
  root.replaceChildren();
  const screen = document.createElement("section");
  screen.className = `screen ${className}`;
  root.append(screen);
  return screen;
}

export function createButton(label: string, onClick: () => void, variant = "primary"): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `game-button game-button--${variant}`;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

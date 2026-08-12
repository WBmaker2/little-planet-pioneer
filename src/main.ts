import "./styles.css";
import type { RendererRoots } from "./bootstrap/start-legacy-renderer";

const rendererMode = new URLSearchParams(window.location.search).get("renderer");
const roots: RendererRoots = {
  threeRoot: document.querySelector<HTMLElement>("#three-root"),
  threeUiRoot: document.querySelector<HTMLElement>("#three-ui-root"),
  legacyRoot: document.querySelector<HTMLElement>("#game-root"),
  legacyUiRoot: document.querySelector<HTMLElement>("#ui-root"),
};

function startLegacy(): void {
  void import("./bootstrap/start-legacy-renderer").then(({ startLegacyRenderer }) => {
    startLegacyRenderer(roots);
  });
}

if (rendererMode === "2d") {
  startLegacy();
} else {
  if (roots.legacyRoot) roots.legacyRoot.hidden = true;
  if (roots.legacyUiRoot) roots.legacyUiRoot.hidden = true;
  void import("./bootstrap/start-three-renderer").then(({ startThreeRenderer }) => {
    return startThreeRenderer(roots, startLegacy);
  });
}

export interface CanvasProbe {
  getContext: (contextId: string) => unknown;
}

export function detectWebGLSupport(
  createCanvas: () => CanvasProbe = () => document.createElement("canvas"),
): boolean {
  try {
    const canvas = createCanvas();
    return Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

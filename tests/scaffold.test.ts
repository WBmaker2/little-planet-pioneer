import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function loadDocumentTitle(): string {
  const indexPath = resolve("index.html");

  if (!existsSync(indexPath)) {
    return "";
  }

  const html = readFileSync(indexPath, "utf8");
  return html.match(/<title>(.*?)<\/title>/s)?.[1]?.trim() ?? "";
}

describe("project scaffold", () => {
  it("exposes the game title", () => {
    document.title = loadDocumentTitle();
    expect(document.title).toBe("꼬마 행성 개척자");
  });
});

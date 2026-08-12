import { expect, test } from "@playwright/test";

test("opens the 3D exploration shell with a game HUD", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  await expect(page.locator("canvas.three-canvas")).toBeVisible();
  await expect(page.getByRole("heading", { name: "별빛 개척대" })).toBeVisible();
  await expect(page.getByText("첫 번째 착륙 지점을 찾아보세요")).toBeVisible();
  await expect(page.getByRole("button", { name: "탐험 시작" })).toBeVisible();
  await expect(page.locator("#ui-root")).toBeHidden();
  await page.screenshot({ path: "docs/superpowers/verification/screenshots/3d-shell-1024x768.png", fullPage: true });

  await page.getByRole("button", { name: "탐험 시작" }).click();
  await expect(page.getByText("탐험 중")).toBeVisible();
  await page.mouse.click(525, 300);
  await expect(page.getByText("발견 성공! 다음 신호를 찾아보세요.")).toBeVisible();
  await expect(page.getByText("반짝이는 발견 지점을 찾아보세요 · 1/3")).toBeVisible();
  await page.keyboard.down("d");
  await page.waitForTimeout(300);
  await page.keyboard.up("d");
  await page.screenshot({ path: "docs/superpowers/verification/screenshots/3d-exploring-1024x768.png", fullPage: true });
});

test("shows the 2D safety mode when requested", async ({ page }) => {
  await page.goto("/?renderer=2d");

  await expect(page.locator("canvas.three-canvas")).toHaveCount(0);
  await expect(page.getByText("꼬마 행성 개척자", { exact: true })).toBeVisible();
});

test("loads only the selected renderer entry on boot", async ({ page }) => {
  const scripts: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") scripts.push(request.url());
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect.poll(() => scripts.some((url) => url.includes("start-three-renderer"))).toBe(true);
  expect(scripts.some((url) => url.includes("start-legacy-renderer"))).toBe(false);
});

test("opens the 3D operation panel for a support robot", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page.getByRole("button", { name: "작전 패널" }).click();

  await expect(page.getByRole("heading", { name: "지원 로봇" })).toBeVisible();
  await page.getByRole("button", { name: /워터드롭/ }).click();
  await expect(page.getByRole("button", { name: /워터드롭/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".three-hud__turn-preview strong")).toHaveText("다음 생산 턴 물 +2");
  await expect(page.locator("[data-resource='water']")).toHaveText("8");
  await page.screenshot({ path: "docs/superpowers/verification/screenshots/3d-operation-panel-1280x720.png", fullPage: true });
});

test("places a facility and runs its next production turn", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page.getByRole("button", { name: "작전 패널" }).click();

  await page.getByRole("button", { name: /태양광 발전기/ }).click();
  await expect(page.locator(".three-hud__turn-preview strong")).toHaveText("예상 생산 에너지 +3 · 건설 부품 -2");
  await page.getByRole("button", { name: "배치하기" }).click();
  await expect(page.getByText("태양광 발전기를 배치했어요")).toBeVisible();
  await expect(page.locator("[data-resource='energy']")).toHaveText("8");

  await page.getByRole("button", { name: "생산 턴 실행" }).click();
  await expect(page.getByText("생산 턴 완료 · 에너지 +3")).toBeVisible();
  await expect(page.locator("[data-resource='energy']")).toHaveText("11");
  await page.screenshot({ path: "docs/superpowers/verification/screenshots/3d-facility-production-1280x720.png", fullPage: true });
});

test("resumes the 3D checkpoint after a reload", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page.getByRole("button", { name: "작전 패널" }).click();
  await page.getByRole("button", { name: /태양광 발전기/ }).click();
  await page.getByRole("button", { name: "배치하기" }).click();
  await expect(page.locator("[data-resource='energy']")).toHaveText("8");

  await page.reload();
  await expect(page.locator("canvas.three-canvas")).toBeVisible();
  await page.getByRole("button", { name: "작전 패널" }).click();
  await expect(page.locator("[data-resource='energy']")).toHaveText("8");
});

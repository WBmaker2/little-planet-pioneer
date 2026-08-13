import { expect, test } from "@playwright/test";

test("opens the 3D exploration shell with a game HUD", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  await expect(page.locator("canvas.three-canvas")).toBeVisible();
  await expect(page.getByRole("heading", { name: "별빛 개척대" })).toBeVisible();
  await expect(page.getByText("반짝이는 보석 3개 찾기")).toBeVisible();
  await expect(page.getByRole("button", { name: "탐험 시작" })).toBeVisible();
  await page.getByRole("button", { name: "업데이트 내역" }).click();
  await expect(page.getByRole("dialog", { name: "업데이트 내역" })).toContainText("2026-08-13");
  await page.getByRole("button", { name: "업데이트 내역 닫기" }).click();
  await expect(page.locator("#ui-root")).toBeHidden();
  await page.screenshot({ path: "docs/superpowers/verification/screenshots/3d-shell-1024x768.png", fullPage: true });

  await page.getByRole("button", { name: "탐험 시작" }).click();
  await expect(page.getByText("탐험 중")).toBeVisible();
  await page.mouse.click(525, 300);
  await expect(page.getByText("발견 성공! 다음 신호를 찾아보세요.")).toBeVisible();
  await expect(page.getByText("반짝이는 보석 찾기 · 1/3")).toBeVisible();
  await page.keyboard.down("d");
  await page.waitForTimeout(300);
  await page.keyboard.up("d");
  await page.screenshot({ path: "docs/superpowers/verification/screenshots/3d-exploring-1024x768.png", fullPage: true });
});

test("discovers a nearby landmark automatically while the rover moves", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page.getByRole("button", { name: "탐험 시작" }).click();

  await page.keyboard.down("d");
  await page.waitForTimeout(900);
  await page.keyboard.up("d");

  await expect(page.getByText("발견 성공! 다음 신호를 찾아보세요.")).toBeVisible();
  await expect(page.getByText("반짝이는 보석 찾기 · 1/3")).toBeVisible();
});

test("guides the player into the operation panel after the first mission", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await expect(page.getByRole("complementary", { name: "루미 AI 가이드" })).toContainText("탐험 시작");
  await page.getByRole("button", { name: "탐험 시작" }).click();

  await page.keyboard.down("d");
  await page.waitForTimeout(720);
  await page.keyboard.up("d");
  await page.keyboard.down("w");
  await page.waitForTimeout(300);
  await page.keyboard.up("w");
  await page.keyboard.down("s");
  await page.waitForTimeout(850);
  await page.keyboard.up("s");
  await page.keyboard.down("a");
  await page.waitForTimeout(1380);
  await page.keyboard.up("a");
  await page.keyboard.down("w");
  await page.waitForTimeout(930);
  await page.keyboard.up("w");

  await expect(page.getByText("보석 3개를 모두 찾았어요!")).toBeVisible();
  const guide = page.getByRole("complementary", { name: "루미 AI 가이드" });
  await expect(guide).toContainText("작전 패널");
  await expect(page.getByRole("heading", { name: "지원 로봇" })).toBeVisible();
  await expect(page.getByText(/2\/5 · 지원 로봇 고르기/)).toBeVisible();
  await expect(page.getByText(/진행 순서: ① 로봇 고르기/)).toBeVisible();
});

test("keeps the operation panel open without a fold toggle", async ({ page }) => {
  await page.setViewportSize({ width: 762, height: 690 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "지원 로봇" })).toBeVisible();
  await expect(page.getByRole("button", { name: "작전 패널" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "작전 패널 닫기" })).toHaveCount(0);
});

test("keeps the operation panel beside the touch controls on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const panel = page.locator(".three-hud__drawer");
  const roverControls = page.locator(".three-hud__rover-controls");
  const panelBox = await panel.boundingBox();
  const roverBox = await roverControls.boundingBox();
  expect(panelBox).not.toBeNull();
  expect(roverBox).not.toBeNull();
  if (!panelBox || !roverBox) return;
  expect(panelBox.x).toBeGreaterThan(roverBox.x + roverBox.width);
});

test("shows low-friction rover controls on a touch-sized viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("button", { name: "위로 이동" })).toBeVisible();
  await expect(page.getByRole("button", { name: "왼쪽 이동" })).toBeVisible();
  await expect(page.getByRole("button", { name: "오른쪽 이동" })).toBeVisible();
  await expect(page.getByRole("button", { name: "아래로 이동" })).toBeVisible();
  const roverRows = page.locator(".three-hud__rover-controls-row");
  await expect(roverRows).toHaveCount(3);
  await expect(roverRows.nth(0).locator("[data-rover-direction]")).toHaveAttribute("data-rover-direction", "forward");
  await expect(roverRows.nth(1).locator("[data-rover-direction]")).toHaveCount(2);
  await expect(roverRows.nth(1).locator("[data-rover-direction]").nth(0)).toHaveAttribute("data-rover-direction", "left");
  await expect(roverRows.nth(1).locator("[data-rover-direction]").nth(1)).toHaveAttribute("data-rover-direction", "right");
  await expect(roverRows.nth(2).locator("[data-rover-direction]")).toHaveAttribute("data-rover-direction", "backward");
  await page.getByRole("button", { name: "탐험 시작" }).click();
  await page.getByRole("button", { name: "오른쪽 이동" }).dispatchEvent("pointerdown");
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "오른쪽 이동" }).dispatchEvent("pointerup");

  await expect(page.getByText("발견 성공! 다음 신호를 찾아보세요.")).toBeVisible();
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

  await page.getByRole("button", { name: /태양광 발전기/ }).click();
  await expect(page.locator(".three-hud__turn-preview strong")).toHaveText("예상 생산 에너지 +3 · 건설 부품 -2");
  await page.getByRole("button", { name: "배치하기" }).click();
  await expect(page.getByText("태양광 발전기를 배치했어요")).toBeVisible();
  await expect(page.locator("[data-resource='energy']")).toHaveText("8");

  await page.getByRole("button", { name: "생산 턴 실행" }).click();
  await expect(page.getByText("생산 턴 완료 · 에너지 +3")).toBeVisible();
  await expect(page.locator("[data-resource='energy']")).toHaveText("11");
  await expect(page.getByRole("complementary", { name: "루미 AI 가이드" })).toContainText("첫 생산 완료");
  const nextExploration = page.getByRole("button", { name: "탐험 계속하기" });
  await expect(nextExploration).toBeVisible();
  await expect(nextExploration).toHaveClass(/gi-pulse/);
  await nextExploration.click();
  await expect(page.getByRole("complementary", { name: "루미 AI 가이드" })).toContainText("탐험 화면으로 돌아왔어");
  await expect(page.getByRole("heading", { name: "지원 로봇" })).toBeVisible();
  await page.screenshot({ path: "docs/superpowers/verification/screenshots/3d-facility-production-1280x720.png", fullPage: true });
});

test("resumes the 3D checkpoint after a reload", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page.getByRole("button", { name: /태양광 발전기/ }).click();
  await page.getByRole("button", { name: "배치하기" }).click();
  await expect(page.locator("[data-resource='energy']")).toHaveText("8");

  await page.reload();
  await expect(page.locator("canvas.three-canvas")).toBeVisible();
  await expect(page.getByRole("heading", { name: "지원 로봇" })).toBeVisible();
  await expect(page.locator("[data-resource='energy']")).toHaveText("8");
});

import { expect, test } from "@playwright/test";

test("starts a short mission from the home screen", async ({ page }) => {
  await page.goto("/?renderer=2d");
  await expect(page.getByText("꼬마 행성 개척자")).toBeVisible();
  await page.getByRole("button", { name: "오늘의 짧은 미션" }).click();
  await expect(page.getByRole("heading", { name: "빛바랜 평원", exact: true })).toBeVisible();
});

test("shows resources, accepts a valid building, and reaches results", async ({ page }) => {
  await page.goto("/?renderer=2d");
  await page.getByRole("button", { name: "오늘의 짧은 미션" }).click();
  await page.getByRole("button", { name: "탐험 시작" }).click();
  await expect(page.getByText("물", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /에너지로 즉시 수리.*필요.*에너지 2.*회복도 \+1/ })).toBeVisible();
  await page.locator(".building-palette").getByRole("button", { name: /태양광 발전기/ }).click();
  await page.locator("[data-tile='1-1']").click();
  await page.getByRole("button", { name: "미션 완료" }).click();
  await expect(page.getByText("개척 배지", { exact: true })).toBeVisible();
  await expect(page.getByText("획득 크레딧", { exact: true })).toBeVisible();
});

test("selects a support robot and previews the production turn", async ({ page }) => {
  await page.goto("/?renderer=2d");
  await page.getByRole("button", { name: "오늘의 짧은 미션" }).click();
  await page.getByRole("button", { name: "탐험 시작" }).click();
  await expect(page.getByText("지원 로봇", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /반짝이/ }).click();
  await expect(page.locator(".robot-status")).toHaveText("반짝이가 선택되었습니다");
  await page.locator(".building-palette").getByRole("button", { name: /태양광 발전기/ }).click();
  await expect(page.getByText(/배치 미리보기.*예상 변화.*에너지 \+4/)).toBeVisible();
  await page.locator("[data-tile='0-0']").click();
  await expect(page.getByText(/생산 턴.*에너지 \+4/)).toBeVisible();
});

test("persists a mission checkpoint and resumes from home", async ({ page }) => {
  await page.goto("/?renderer=2d");
  await page.getByRole("button", { name: "오늘의 짧은 미션" }).click();
  await page.getByRole("button", { name: "탐험 시작" }).click();
  await page.getByRole("button", { name: "저장하고 나가기" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "계속하기" })).toBeVisible();
  await page.getByRole("button", { name: "계속하기" }).click();
  await expect(page.getByText("물", { exact: true })).toBeVisible();
});

test("persists progress and exposes the safe play-time setting", async ({ page }) => {
  await page.goto("/?renderer=2d");
  await page.getByRole("button", { name: "설정" }).click();
  await expect(page.getByText("최대 플레이 시간", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "5분", exact: true }).click();
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(page.getByText("설정이 저장되었습니다", { exact: true })).toBeVisible();
});

test("preserves quotes in the local-only player name", async ({ page }) => {
  await page.goto("/?renderer=2d");
  await page.getByRole("button", { name: "설정" }).click();
  const input = page.getByRole("textbox", { name: "기기 안에서만 사용하는 이름" });
  await input.fill('별빛 "개척자"');
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "설정" }).click();
  await expect(input).toHaveValue('별빛 "개척자"');
});

test("shows a local-only teacher playtest summary", async ({ page }) => {
  await page.goto("/?renderer=2d");
  await page.getByRole("button", { name: "오늘의 짧은 미션" }).click();
  await page.getByRole("button", { name: "탐험 시작" }).click();
  await page.locator("[data-tile='0-0']").click();
  await page.getByRole("button", { name: "저장하고 나가기" }).click();
  await page.getByRole("button", { name: "설정" }).click();
  await page.getByRole("button", { name: "교사용 관찰 요약" }).click();
  await expect(page.getByText(/도움 요청 1회/)).toBeVisible();
  await expect(page.getByText("학생", { exact: true })).toHaveCount(0);
});

test("offers a Korean objective and resumes a 15-minute mission", async ({ page }) => {
  await page.goto("/?renderer=2d");
  await page.getByRole("button", { name: "설정" }).click();
  await page.getByRole("button", { name: "15분", exact: true }).click();
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await page.getByRole("button", { name: "본부로" }).click();
  await page.getByRole("button", { name: "행성 지도" }).click();

  const longMission = page.locator(".mission-card").filter({ hasText: "첫 번째 개척 기지" });
  await expect(longMission.getByText("생태 온실 시설 2개를 완성하세요.")).toBeVisible();
  await longMission.getByRole("button", { name: "탐험 시작" }).click();
  await page.getByRole("button", { name: "저장하고 나가기" }).click();
  await page.getByRole("button", { name: "계속하기" }).click();
  await expect(page.getByRole("heading", { name: "첫 번째 개척 기지" })).toBeVisible();
});

test("keeps the core flow usable with keyboard input", async ({ page }) => {
  await page.goto("/?renderer=2d");
  await expect(page.getByText("꼬마 행성 개척자")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "오늘의 짧은 미션" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "빛바랜 평원", exact: true })).toBeVisible();
});

test("fits landscape and portrait viewports without external requests", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
      externalRequests.push(request.url());
    }
  });

  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/?renderer=2d");
  await expect(page.getByRole("button", { name: "오늘의 짧은 미션" })).toBeVisible();
  await page.screenshot({ path: "docs/superpowers/verification/screenshots/home-1024x768.png", fullPage: true });

  await page.getByRole("button", { name: "오늘의 짧은 미션" }).click();
  await page.getByRole("button", { name: "탐험 시작" }).click();
  await expect(page.locator("[data-tile='4-4']")).toBeVisible();
  await page.screenshot({ path: "docs/superpowers/verification/screenshots/mission-1024x768.png", fullPage: true });

  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.getByRole("button", { name: "미션 완료" })).toBeVisible();
  await expect(page.locator("[data-tile='4-4']")).toBeVisible();
  await page.screenshot({ path: "docs/superpowers/verification/screenshots/mission-768x1024.png", fullPage: true });
  const hasHorizontalOverflow = await page.locator("#ui-root").evaluate(
    (root) => root.scrollWidth > root.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
  expect(externalRequests).toEqual([]);
});

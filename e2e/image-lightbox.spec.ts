import { expect, test } from "@playwright/test";

test("rulebook images open in a zoomable lightbox and restore focus on close", async ({ page }) => {
  await page.goto("/boardgames/zh/games/hegemony/");

  const trigger = page.getByRole("button", { name: /^查看大图/ }).first();
  await trigger.focus();
  await trigger.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("img")).toHaveAttribute("src", /official-components\.jpg$/);

  const zoomOut = dialog.getByRole("button", { name: "缩小" });
  await expect(zoomOut).toBeDisabled();
  await dialog.getByRole("button", { name: "放大" }).click();
  await expect(zoomOut).toBeEnabled();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("interactive-flow JPGs and existing SVG diagrams use the same lightbox", async ({ page }) => {
  await page.goto("/boardgames/zh/games/hegemony/flow/");
  await page.getByRole("button", { name: /^查看大图/ }).first().click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("img")).toHaveAttribute("src", /official-setup\.jpg$/);
  await page.getByTestId("image-lightbox-backdrop").click({ position: { x: 4, y: 4 } });
  await expect(dialog).toBeHidden();

  await page.goto("/boardgames/zh/games/harmonies/");
  await page.getByRole("button", { name: /^查看大图/ }).first().click();
  await expect(page.getByRole("dialog").getByRole("img")).toHaveAttribute("src", /turn\.svg$/);
});

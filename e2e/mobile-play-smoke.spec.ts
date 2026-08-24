import { expect, test } from "@playwright/test";

type PlayRoute = {
  slug: string;
  edition?: string;
};

const routes: PlayRoute[] = [
  { slug: "love-letter", edition: "classic" },
  { slug: "love-letter", edition: "full" },
  { slug: "love-letter", edition: "expansion" },
  { slug: "texas-hold-em" },
  { slug: "6-nimmt-30th-anniversary" },
  { slug: "go", edition: "9x9" },
  { slug: "go", edition: "13x13" },
  { slug: "go", edition: "19x19" },
  { slug: "cabo" },
  { slug: "uno", edition: "classic" },
  { slug: "uno", edition: "flip" },
  { slug: "uno", edition: "no-mercy" },
  { slug: "trio", edition: "simple" },
  { slug: "trio", edition: "spicy" },
  { slug: "rummikub" },
];

function routePath({ slug, edition }: PlayRoute) {
  const query = edition ? `?edition=${edition}` : "";
  return `/boardgames/zh/games/${slug}/play/${query}`;
}

for (const route of routes) {
  test(`${route.slug}${route.edition ? ` · ${route.edition}` : ""} mobile shell`, async ({ page }) => {
    await page.goto(routePath(route));
    await expect(page.getByTestId("play-lobby")).toBeVisible();
    await expect(page.getByTestId("lobby-actions")).toBeVisible();
    const addAi = page.getByRole("button", { name: /加 AI|Add AI/ });
    await expect(addAi).toBeVisible();

    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
      )
      .toBe(true);
  });
}

test("mobile lobby keeps the primary controls stable while adding AI", async ({ page }) => {
  await page.goto(routePath({ slug: "uno", edition: "no-mercy" }));
  const actions = page.getByTestId("lobby-actions");
  const addAi = page.getByRole("button", { name: /加 AI|Add AI/ });
  // Wait for the client-only edition and room state to settle before measuring
  // the user-initiated layout change.
  await page.waitForTimeout(300);
  const before = await actions.boundingBox();
  await addAi.click();
  await expect(actions).toBeVisible();
  const after = await actions.boundingBox();

  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  // A small font/layout settle is allowed on landscape Safari/Chrome; controls
  // must remain in the same action dock rather than being pushed out of view.
  expect(Math.abs((after?.y ?? 0) - (before?.y ?? 0))).toBeLessThanOrEqual(16);
});

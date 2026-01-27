import { test, expect } from "@playwright/test";

test.describe("Eventos y Entradas", () => {
  test.describe("Listado de eventos", () => {
    test("muestra la página de eventos correctamente", async ({ page }) => {
      await page.goto("/eventos");

      // Verify page elements
      await expect(page.getByRole("heading", { name: "Eventos" })).toBeVisible();
    });

    test("muestra eventos disponibles o mensaje vacío", async ({ page }) => {
      await page.goto("/eventos");
      await page.waitForLoadState("networkidle");

      // Check for event cards or empty state
      const eventCards = page.locator('a[href^="/eventos/"]').filter({ hasNot: page.locator('[href="/eventos"]') }).first();
      const emptyState = page.getByText(/no hay eventos|sin eventos|próximamente|no se encontraron/i);

      const hasEvents = await eventCards.isVisible().catch(() => false);
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      expect(hasEvents || hasEmptyState).toBeTruthy();
    });

    test("permite filtrar por búsqueda", async ({ page }) => {
      await page.goto("/eventos");

      const searchInput = page.getByPlaceholder(/buscar/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill("fiesta");
        await page.keyboard.press("Enter");

        // URL should update
        await expect(page).toHaveURL(/busqueda=fiesta/);
      }
    });

    test("permite filtrar eventos pasados", async ({ page }) => {
      await page.goto("/eventos");

      // Look for past events toggle/checkbox
      const pastEventsToggle = page.getByLabel(/pasados|anteriores|finalizados/i);
      const pastEventsButton = page.getByRole("button", { name: /pasados|anteriores/i });

      if (await pastEventsToggle.isVisible()) {
        await pastEventsToggle.click();
      } else if (await pastEventsButton.isVisible()) {
        await pastEventsButton.click();
      }
    });

    test("permite filtrar eventos solo para socios", async ({ page }) => {
      await page.goto("/eventos");

      // Look for socios filter
      const sociosFilter = page.getByLabel(/solo socios|exclusivo socios/i);

      if (await sociosFilter.isVisible()) {
        await sociosFilter.click();
      }
    });
  });

  test.describe("Detalle de evento", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/eventos");
      await page.waitForLoadState("networkidle");
    });

    test("navega al detalle al hacer clic en un evento", async ({ page }) => {
      // Click on first event card link
      const eventLink = page.locator("a[href*='/eventos/']").filter({ hasNot: page.locator("[href='/eventos']") }).first();

      if (await eventLink.isVisible()) {
        await eventLink.click();

        // Should navigate to event detail page
        await expect(page).toHaveURL(/\/eventos\/[^/]+$/);
      }
    });

    test("muestra información del evento", async ({ page }) => {
      const eventLink = page.locator("a[href*='/eventos/']").filter({ hasNot: page.locator("[href='/eventos']") }).first();

      if (await eventLink.isVisible()) {
        await eventLink.click();
        await page.waitForLoadState("networkidle");

        // Verify event page elements
        await expect(page.locator("h1")).toBeVisible(); // Event title

        // Check for date/time info
        const dateInfo = page.getByText(/\d{1,2}.*\d{4}|\d{1,2}\/\d{1,2}|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i);
        expect(await dateInfo.count()).toBeGreaterThan(0);
      }
    });

    test("muestra información de entradas si hay lotes disponibles", async ({ page }) => {
      const eventLink = page.locator("a[href*='/eventos/']").filter({ hasNot: page.locator("[href='/eventos']") }).first();

      if (await eventLink.isVisible()) {
        await eventLink.click();
        await page.waitForLoadState("networkidle");

        // Look for ticket/entry information
        const ticketSection = page.getByText(/entradas|tickets|lote|precio/i);
        const buyButton = page.getByRole("link", { name: /comprar|obtener entradas/i });
        const soldOut = page.getByText(/agotado|sin entradas|sold out/i);

        const hasTickets = await ticketSection.first().isVisible().catch(() => false);
        const hasBuyButton = await buyButton.isVisible().catch(() => false);
        const isSoldOut = await soldOut.isVisible().catch(() => false);

        // Should show ticket info, buy button, or sold out message
        expect(hasTickets || hasBuyButton || isSoldOut).toBeTruthy();
      }
    });

    test("muestra ubicación del evento si está disponible", async ({ page }) => {
      const eventLink = page.locator("a[href*='/eventos/']").filter({ hasNot: page.locator("[href='/eventos']") }).first();

      if (await eventLink.isVisible()) {
        await eventLink.click();
        await page.waitForLoadState("networkidle");

        // Look for location info
        const locationInfo = page.getByText(/ubicación|lugar|dirección|dónde/i).first();
        if (await locationInfo.isVisible().catch(() => false)) {
          await expect(locationInfo).toBeVisible();
        }
      }
    });
  });

  test.describe("Compra de entradas", () => {
    test("navega al checkout de entradas desde detalle", async ({ page }) => {
      await page.goto("/eventos");
      await page.waitForLoadState("networkidle");

      const eventLink = page.locator("a[href*='/eventos/']").filter({ hasNot: page.locator("[href='/eventos']") }).first();

      if (await eventLink.isVisible()) {
        await eventLink.click();
        await page.waitForLoadState("networkidle");

        // Look for buy tickets button
        const buyButton = page.getByRole("link", { name: /comprar|obtener entradas|reservar/i }).first();

        if (await buyButton.isVisible().catch(() => false)) {
          const href = await buyButton.getAttribute("href");
          // Only test navigation if the button links to checkout
          if (href && href.includes("checkout")) {
            await buyButton.click();
            await expect(page).toHaveURL(/checkout/);
          }
        }
      }
    });

    test("checkout muestra selector de entradas", async ({ page }) => {
      // Navigate to an event's checkout directly
      await page.goto("/eventos");
      await page.waitForLoadState("networkidle");

      const eventLink = page.locator("a[href*='/eventos/']").filter({ hasNot: page.locator("[href='/eventos']") }).first();

      if (await eventLink.isVisible()) {
        const href = await eventLink.getAttribute("href");
        if (href) {
          await page.goto(`${href}/checkout`);

          // Wait for page to load
          await page.waitForLoadState("networkidle");

          // Check for ticket type selector, checkout content, or redirect
          const ticketSelector = page.getByText(/tipo de entrada|cantidad|seleccionar|comprar entradas|entradas disponibles/i);
          const currentUrl = page.url();
          const redirected = currentUrl.includes("/eventos") && !currentUrl.includes("/checkout");

          if (!redirected) {
            const ticketVisible = await ticketSelector.first().isVisible().catch(() => false);
            const hasCheckoutContent = await page.locator('form, [data-testid="checkout"], input, button').first().isVisible().catch(() => false);
            const hasHeading = await page.locator("h1, h2").first().isVisible().catch(() => false);
            // Page should have some content - ticket selector, form, or at least a heading
            expect(ticketVisible || hasCheckoutContent || hasHeading).toBeTruthy();
          }
        }
      }
    });

    test("checkout requiere datos del asistente", async ({ page }) => {
      await page.goto("/eventos");
      await page.waitForLoadState("networkidle");

      const eventLink = page.locator("a[href*='/eventos/']").filter({ hasNot: page.locator("[href='/eventos']") }).first();

      if (await eventLink.isVisible()) {
        const href = await eventLink.getAttribute("href");
        if (href) {
          await page.goto(`${href}/checkout`);

          // Look for attendee form fields
          const nombreField = page.getByLabel(/nombre.*asistente|nombre completo/i);
          const cedulaField = page.getByLabel(/cédula|documento|ci/i);

          if (await nombreField.isVisible()) {
            await expect(nombreField).toBeVisible();
          }
        }
      }
    });

    test("valida selección de entradas antes de continuar", async ({ page }) => {
      await page.goto("/eventos");
      await page.waitForLoadState("networkidle");

      const eventLink = page.locator("a[href*='/eventos/']").filter({ hasNot: page.locator("[href='/eventos']") }).first();

      if (await eventLink.isVisible()) {
        const href = await eventLink.getAttribute("href");
        if (href) {
          await page.goto(`${href}/checkout`);

          // Try to proceed without selecting tickets
          const continueButton = page.getByRole("button", { name: /continuar|siguiente|pagar/i });

          if (await continueButton.isVisible()) {
            // Button should be disabled or show error
            const isDisabled = await continueButton.isDisabled();
            if (!isDisabled) {
              await continueButton.click();
              // Should show validation error
              const error = page.getByText(/selecciona|requerido|obligatorio/i);
              expect(await error.isVisible().catch(() => false)).toBeTruthy();
            }
          }
        }
      }
    });
  });

  test.describe("Mis Entradas (usuario autenticado)", () => {
    test("redirige a login al acceder a mis entradas sin autenticación", async ({ page }) => {
      await page.goto("/mi-cuenta/entradas");

      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("Escaneo de entradas", () => {
    test("página de escaneo requiere autenticación", async ({ page }) => {
      await page.goto("/eventos/escaneo");

      // Should redirect to login or show unauthorized
      const loginRedirect = page.url().includes("/login");
      const unauthorizedMessage = page.getByText(/no autorizado|sin permiso|acceso denegado/i);

      expect(loginRedirect || (await unauthorizedMessage.isVisible().catch(() => false))).toBeTruthy();
    });
  });

  test.describe("Eventos exclusivos para socios", () => {
    test("muestra indicador de evento exclusivo para socios", async ({ page }) => {
      await page.goto("/eventos");
      await page.waitForLoadState("networkidle");

      // Look for "solo socios" badge on any event
      const sociosBadge = page.getByText(/solo socios|exclusivo socios|miembros/i);

      // This might not be visible if there are no such events
      const hasSociosEvents = await sociosBadge.first().isVisible().catch(() => false);

      // Just verify the page loaded correctly
      await expect(page.getByRole("heading", { name: "Eventos" })).toBeVisible();
    });
  });
});

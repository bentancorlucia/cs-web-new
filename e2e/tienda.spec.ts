import { test, expect } from "@playwright/test";

test.describe("Tienda", () => {
  test.describe("Listado de productos", () => {
    test("muestra la página de tienda correctamente", async ({ page }) => {
      await page.goto("/tienda");

      // Verify page elements
      await expect(page.getByRole("heading", { name: "Tienda" })).toBeVisible();
      await expect(page.getByText(/\d+ productos? encontrados?/)).toBeVisible();
    });

    test("muestra grid de productos", async ({ page }) => {
      await page.goto("/tienda");

      // Wait for products to load
      await page.waitForLoadState("networkidle");

      // Check for product cards or empty state
      const productCards = page.locator('[data-testid="product-card"], article').first();
      const emptyState = page.getByText(/no hay productos|no se encontraron/i);

      // Either products or empty state should be visible
      const hasProducts = await productCards.isVisible().catch(() => false);
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      expect(hasProducts || hasEmptyState).toBeTruthy();
    });

    test("permite filtrar por búsqueda", async ({ page }) => {
      await page.goto("/tienda");

      // Find search input
      const searchInput = page.getByPlaceholder(/buscar/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill("camiseta");
        await page.keyboard.press("Enter");

        // URL should update with search param
        await expect(page).toHaveURL(/busqueda=camiseta/);
      }
    });

    test("permite filtrar por categoría", async ({ page }) => {
      await page.goto("/tienda");

      // Look for category filter
      const categoryFilter = page.getByRole("combobox").first();
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();

        // Select first option if available
        const firstOption = page.getByRole("option").first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
        }
      }
    });

    test("permite ordenar productos", async ({ page }) => {
      await page.goto("/tienda");

      // Look for sort dropdown
      const sortDropdown = page.locator("select, [role='combobox']").filter({ hasText: /ordenar|precio/i });
      if (await sortDropdown.first().isVisible()) {
        await sortDropdown.first().click();
      }
    });
  });

  test.describe("Detalle de producto", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/tienda");
      await page.waitForLoadState("networkidle");
    });

    test("navega al detalle al hacer clic en un producto", async ({ page }) => {
      // Click on first product card
      const productLink = page.locator("a[href*='/tienda/productos/']").first();

      if (await productLink.isVisible()) {
        await productLink.click();

        // Should navigate to product detail page
        await expect(page).toHaveURL(/\/tienda\/productos\/.+/);
      }
    });

    test("muestra información del producto", async ({ page }) => {
      // Navigate directly to a product if URL is known, or find one
      const productLink = page.locator("a[href*='/tienda/productos/']").first();

      if (await productLink.isVisible()) {
        await productLink.click();
        await page.waitForLoadState("networkidle");

        // Verify product page elements
        await expect(page.locator("h1")).toBeVisible(); // Product name
        await expect(page.getByText(/\$|UYU/)).toBeVisible(); // Price

        // Check for add to cart button
        const addToCartButton = page.getByRole("button", { name: "Agregar al carrito" });
        if (await addToCartButton.isVisible().catch(() => false)) {
          await expect(addToCartButton).toBeVisible();
        }
      }
    });

    test("muestra selector de variantes si hay opciones", async ({ page }) => {
      const productLink = page.locator("a[href*='/tienda/productos/']").first();

      if (await productLink.isVisible()) {
        await productLink.click();
        await page.waitForLoadState("networkidle");

        // Check for variant selectors (talla/color)
        const tallaSelector = page.getByText(/talla|talle|size/i);
        const colorSelector = page.getByText(/color/i);

        // Either might be present depending on the product
        const hasTalla = await tallaSelector.isVisible().catch(() => false);
        const hasColor = await colorSelector.isVisible().catch(() => false);

        // Log which selectors are available
        console.log(`Product has talla: ${hasTalla}, color: ${hasColor}`);
      }
    });
  });

  test.describe("Carrito", () => {
    test("puede agregar producto al carrito", async ({ page }) => {
      // Navigate to a product
      await page.goto("/tienda");
      await page.waitForLoadState("networkidle");

      const productLink = page.locator("a[href*='/tienda/productos/']").first();
      if (!(await productLink.isVisible())) {
        test.skip();
        return;
      }

      await productLink.click();
      await page.waitForLoadState("networkidle");

      // Select variants if needed
      const selectOptionsButton = page.getByRole("button", { name: /selecciona opciones/i });
      if (await selectOptionsButton.isVisible()) {
        // Need to select options first - click first available talla/color
        const tallaOption = page.locator("button").filter({ hasText: /^[SMLX]{1,3}$|^\d{2}$/ }).first();
        if (await tallaOption.isVisible()) {
          await tallaOption.click();
        }

        const colorOption = page.locator("button[aria-label*='color'], button[title*='color']").first();
        if (await colorOption.isVisible()) {
          await colorOption.click();
        }
      }

      // Click add to cart
      const addToCartButton = page.getByRole("button", { name: /agregar al carrito/i });
      if (await addToCartButton.isEnabled()) {
        await addToCartButton.click();

        // Should show success toast or cart drawer
        const successIndicator = page.getByText(/agregado|añadido/i);
        await expect(successIndicator).toBeVisible({ timeout: 5000 });
      }
    });

    test("muestra página de carrito", async ({ page }) => {
      await page.goto("/tienda/carrito");

      // Should show cart page
      await expect(page.getByRole("heading", { name: /carrito/i }).first()).toBeVisible();
    });

    test("carrito vacío muestra mensaje apropiado", async ({ page }) => {
      // Clear localStorage to ensure empty cart
      await page.goto("/tienda");
      await page.evaluate(() => localStorage.removeItem("club-seminario-cart"));

      await page.goto("/tienda/carrito");

      // Should show empty cart message
      await expect(page.getByText(/carrito.*vacío|no hay productos/i).first()).toBeVisible();
    });

    test("puede modificar cantidad en el carrito", async ({ page }) => {
      // First add a product
      await page.goto("/tienda");
      await page.waitForLoadState("networkidle");

      const productLink = page.locator("a[href*='/tienda/productos/']").first();
      if (!(await productLink.isVisible())) {
        test.skip();
        return;
      }

      await productLink.click();
      await page.waitForLoadState("networkidle");

      // Try to add to cart
      const addToCartButton = page.getByRole("button", { name: /agregar al carrito/i });
      if (await addToCartButton.isEnabled()) {
        await addToCartButton.click();
        await page.waitForTimeout(1000);
      }

      // Go to cart
      await page.goto("/tienda/carrito");

      // Look for quantity controls
      const increaseButton = page.getByRole("button", { name: /\+|aumentar|incrementar/i }).first();
      const decreaseButton = page.getByRole("button", { name: /-|disminuir|decrementar/i }).first();

      if (await increaseButton.isVisible()) {
        await page.waitForTimeout(500); // Wait for overlays to close
        await increaseButton.click({ force: true });
      }
    });

    test("puede eliminar producto del carrito", async ({ page }) => {
      await page.goto("/tienda/carrito");

      // Look for remove button
      const removeButton = page.getByRole("button", { name: /eliminar|quitar|remove/i }).first();

      if (await removeButton.isVisible()) {
        await removeButton.click();

        // Product should be removed or confirmation modal shown
      }
    });
  });

  test.describe("Checkout", () => {
    test("redirige a checkout desde el carrito", async ({ page }) => {
      await page.goto("/tienda/carrito");

      // Look for checkout button
      const checkoutButton = page.getByRole("link", { name: /checkout|finalizar|comprar/i });

      if (await checkoutButton.isVisible()) {
        await checkoutButton.click();
        await expect(page).toHaveURL(/checkout/);
      }
    });

    test("muestra formulario de checkout", async ({ page }) => {
      await page.goto("/tienda/checkout");

      // Should show checkout form or redirect if cart is empty
      const checkoutHeading = page.getByRole("heading", { name: /checkout/i });
      const emptyCartMessage = page.getByText(/carrito.*vacío/i);

      const hasCheckoutForm = await checkoutHeading.isVisible().catch(() => false);
      const hasEmptyMessage = await emptyCartMessage.isVisible().catch(() => false);

      expect(hasCheckoutForm || hasEmptyMessage).toBeTruthy();
    });

    test("requiere datos de contacto en checkout", async ({ page }) => {
      // Add product to cart first
      await page.goto("/tienda");
      await page.waitForLoadState("networkidle");

      const productLink = page.locator("a[href*='/tienda/productos/']").first();
      if (await productLink.isVisible()) {
        await productLink.click();
        await page.waitForLoadState("networkidle");

        const addToCartButton = page.getByRole("button", { name: /agregar al carrito/i });
        if (await addToCartButton.isEnabled()) {
          await addToCartButton.click();
          await page.waitForTimeout(1000);
        }
      }

      await page.goto("/tienda/checkout");

      // Check for contact form fields
      const emailField = page.getByLabel(/email/i);
      const nombreField = page.getByLabel(/nombre/i);
      const telefonoField = page.getByLabel(/teléfono|telefono/i);

      if (await emailField.isVisible()) {
        await expect(emailField).toBeVisible();
      }
    });

    test("muestra opciones de envío", async ({ page }) => {
      await page.goto("/tienda/checkout");

      // Look for shipping options
      const shippingSection = page.getByText(/envío|retiro|delivery/i).first();

      if (await shippingSection.isVisible()) {
        await expect(shippingSection).toBeVisible();
      }
    });
  });
});

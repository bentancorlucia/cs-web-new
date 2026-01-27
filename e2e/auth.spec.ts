import { test, expect } from "@playwright/test";

test.describe("Autenticación", () => {
  test.describe("Login", () => {
    test("muestra el formulario de login correctamente", async ({ page }) => {
      await page.goto("/login");

      // Verify form elements are visible
      await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
      await expect(page.getByPlaceholder("tu@email.com")).toBeVisible();
      await expect(page.getByPlaceholder("Tu contraseña")).toBeVisible();
      await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
      await expect(page.getByText("¿Olvidaste tu contraseña?")).toBeVisible();
      await expect(page.getByText("¿No tienes cuenta?")).toBeVisible();
    });

    test("muestra error con credenciales incorrectas", async ({ page }) => {
      await page.goto("/login");

      await page.getByPlaceholder("tu@email.com").fill("invalid@email.com");
      await page.getByPlaceholder("Tu contraseña").fill("wrongpassword");
      await page.getByRole("button", { name: "Iniciar sesión" }).click();

      // Should show error message
      await expect(page.getByText(/incorrectos|error/i)).toBeVisible({ timeout: 10000 });
    });

    test("permite toggle de visibilidad de contraseña", async ({ page }) => {
      await page.goto("/login");

      const passwordInput = page.getByPlaceholder("Tu contraseña");
      const toggleButton = page.getByRole("button", { name: /mostrar contraseña/i });

      // Initially password is hidden
      await expect(passwordInput).toHaveAttribute("type", "password");

      // Click toggle to show password
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute("type", "text");

      // Click again to hide
      await page.getByRole("button", { name: /ocultar contraseña/i }).click();
      await expect(passwordInput).toHaveAttribute("type", "password");
    });

    test("navega a registro desde login", async ({ page }) => {
      await page.goto("/login");

      await page.getByRole("link", { name: "Regístrate" }).click();

      await expect(page).toHaveURL("/registro");
      await expect(page.getByRole("heading", { name: "Crear cuenta" })).toBeVisible();
    });

    test("navega a recuperar contraseña desde login", async ({ page }) => {
      await page.goto("/login");

      await page.getByText("¿Olvidaste tu contraseña?").click();

      await expect(page).toHaveURL("/recuperar");
    });
  });

  test.describe("Registro", () => {
    test("muestra el formulario de registro correctamente", async ({ page }) => {
      await page.goto("/registro");

      await expect(page.getByRole("heading", { name: "Crear cuenta" })).toBeVisible();
      await expect(page.getByLabel("Nombre")).toBeVisible();
      await expect(page.getByLabel("Apellido")).toBeVisible();
      await expect(page.getByLabel("Cédula")).toBeVisible();
      await expect(page.getByLabel("Teléfono")).toBeVisible();
      await expect(page.getByLabel("Email")).toBeVisible();
      await expect(page.getByLabel("Contraseña", { exact: true })).toBeVisible();
      await expect(page.getByLabel("Confirmar contraseña", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Crear cuenta" })).toBeVisible();
    });

    test("valida campos requeridos", async ({ page }) => {
      await page.goto("/registro");

      // Submit empty form
      await page.getByRole("button", { name: "Crear cuenta" }).click();

      // Should show validation errors
      await expect(page.getByText("El nombre es requerido")).toBeVisible();
      await expect(page.getByText("El apellido es requerido")).toBeVisible();
      await expect(page.getByText("La cédula es requerida")).toBeVisible();
      await expect(page.getByText("El teléfono es requerido")).toBeVisible();
      await expect(page.getByText("El email es requerido")).toBeVisible();
      await expect(page.getByText("La contraseña es requerida")).toBeVisible();
    });

    test("valida formato de cédula", async ({ page }) => {
      await page.goto("/registro");

      await page.getByLabel("Cédula").fill("abc");
      await page.getByRole("button", { name: "Crear cuenta" }).click();

      await expect(page.getByText(/cédula válida/i)).toBeVisible();
    });

    test("valida formato de teléfono", async ({ page }) => {
      await page.goto("/registro");

      await page.getByLabel("Teléfono").fill("123");
      await page.getByRole("button", { name: "Crear cuenta" }).click();

      await expect(page.getByText(/teléfono válido/i)).toBeVisible();
    });

    test("valida formato de email", async ({ page }) => {
      await page.goto("/registro");

      const emailInput = page.getByLabel("Email");
      await emailInput.fill("invalid-email");
      await page.getByRole("button", { name: "Crear cuenta" }).click();

      // HTML5 email validation kicks in - check the input is invalid
      // The browser prevents submission and shows native validation
      await expect(emailInput).toHaveAttribute("type", "email");

      // Check input validity state via aria-invalid or CSS :invalid
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isInvalid).toBeTruthy();
    });

    test("valida longitud de contraseña", async ({ page }) => {
      await page.goto("/registro");

      await page.getByLabel("Contraseña", { exact: true }).fill("short");
      await page.getByRole("button", { name: "Crear cuenta" }).click();

      await expect(page.getByText(/al menos 8 caracteres/i)).toBeVisible();
    });

    test("valida que las contraseñas coincidan", async ({ page }) => {
      await page.goto("/registro");

      await page.getByLabel("Contraseña", { exact: true }).fill("password123");
      await page.getByLabel("Confirmar contraseña", { exact: true }).fill("different123");
      await page.getByRole("button", { name: "Crear cuenta" }).click();

      await expect(page.getByText("Las contraseñas no coinciden")).toBeVisible();
    });

    test("navega a login desde registro", async ({ page }) => {
      await page.goto("/registro");

      await page.getByRole("link", { name: "Inicia sesión" }).click();

      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Recuperar contraseña", () => {
    test("muestra el formulario de recuperación correctamente", async ({ page }) => {
      await page.goto("/recuperar");

      await expect(page.getByRole("heading", { name: /recuperar|restablecer/i })).toBeVisible();
      await expect(page.getByPlaceholder(/email/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /enviar|recuperar/i })).toBeVisible();
    });

    test("valida email requerido", async ({ page }) => {
      await page.goto("/recuperar");

      await page.getByRole("button", { name: /enviar|recuperar/i }).click();

      // Should show validation error or HTML5 validation prevents submission
      const emailInput = page.getByPlaceholder(/email/i);
      await expect(emailInput).toHaveAttribute("required", "");
    });
  });

  test.describe("Rutas protegidas", () => {
    test("redirige a login al acceder a mi-cuenta sin autenticación", async ({ page }) => {
      await page.goto("/mi-cuenta");

      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });

    test("redirige a login al acceder a mi-cuenta/perfil sin autenticación", async ({ page }) => {
      await page.goto("/mi-cuenta/perfil");

      await expect(page).toHaveURL(/login/);
    });

    test("redirige a login al acceder a mi-cuenta/pedidos sin autenticación", async ({ page }) => {
      await page.goto("/mi-cuenta/pedidos");

      await expect(page).toHaveURL(/login/);
    });

    test("redirige a login al acceder a admin sin autenticación", async ({ page }) => {
      await page.goto("/admin");

      await expect(page).toHaveURL(/login/);
    });
  });
});

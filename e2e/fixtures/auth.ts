import { test as base, Page } from "@playwright/test";

// Test user credentials (should be set up in test environment)
export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || "test@clubseminario.com.uy",
  password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
  nombre: "Usuario",
  apellido: "Test",
};

export const ADMIN_USER = {
  email: process.env.ADMIN_USER_EMAIL || "admin@clubseminario.com.uy",
  password: process.env.ADMIN_USER_PASSWORD || "AdminPassword123!",
};

// Helper to login a user
export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("tu@email.com").fill(email);
  await page.getByPlaceholder("Tu contraseña").fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL(/mi-cuenta|admin/);
}

// Helper to logout
export async function logout(page: Page) {
  // Look for the user menu or logout button
  const userMenuButton = page.locator('[data-testid="user-menu"]');
  if (await userMenuButton.isVisible()) {
    await userMenuButton.click();
    await page.getByRole("button", { name: /cerrar sesión/i }).click();
  }
}

// Extended test fixture with authenticated user
export const test = base.extend<{ authenticatedPage: Page; adminPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await use(page);
  },
  adminPage: async ({ page }, use) => {
    await login(page, ADMIN_USER.email, ADMIN_USER.password);
    await use(page);
  },
});

export { expect } from "@playwright/test";

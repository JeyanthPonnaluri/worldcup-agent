/**
 * Reusable helper functions for KhelMitra E2E testing
 */

export async function navigateToTab(page, tabName) {
  // tabName can be: home, chat, stats, itinerary, settings, profile, login, signup
  if (tabName === "signup" && !(await page.locator("#nav-signup").isVisible())) {
    await page.waitForSelector("#landing-signup-btn");
    await page.click("#landing-signup-btn");
    return;
  }
  if (tabName === "login" && !(await page.locator("#nav-login").isVisible())) {
    await page.waitForSelector("#landing-signin-btn");
    await page.click("#landing-signin-btn");
    return;
  }
  const selector = `#nav-${tabName}`;
  await page.waitForSelector(selector);
  await page.click(selector);
}

export async function login(page, usernameOrEmail, password) {
  await navigateToTab(page, "login");
  await page.waitForSelector("#email");
  await page.fill("#email", usernameOrEmail);
  await page.fill("#password", password);
  await page.click('button[type="submit"]:has-text("Sign In")');
}

export async function signup(page, { username, email, password, dietary = [], favoriteTeam = "", preferredGate = "", crowdTolerance = "medium" }) {
  await navigateToTab(page, "signup");
  await page.waitForSelector("#username");
  await page.fill("#username", username);
  await page.fill("#email", email);
  await page.fill("#password", password);

  // Check dietary requirements
  for (const pref of dietary) {
    // Locate the checkbox containing the label value or similar
    const checkbox = page.locator(`label:has-text("${pref}") input[type="checkbox"]`);
    if (await checkbox.isVisible()) {
      await checkbox.check();
    }
  }

  // Favorite Team
  if (favoriteTeam) {
    await page.selectOption("#favorite-team", { value: favoriteTeam });
  }

  // Preferred Entrance Gate
  if (preferredGate) {
    await page.selectOption("#preferred-gate", { value: preferredGate });
  }

  // Crowd Tolerance
  if (crowdTolerance) {
    const radio = page.locator(`input[name="crowd-tolerance"][value="${crowdTolerance}"]`);
    if (await radio.isVisible()) {
      await radio.check();
    }
  }

  await page.click('button[type="submit"]:has-text("Create Account")');
}

export async function logout(page) {
  await navigateToTab(page, "logout");
}

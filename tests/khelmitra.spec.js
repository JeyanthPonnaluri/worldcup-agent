import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { DashboardPage } from "../pages/DashboardPage";
import { navigateToTab, login, signup, logout } from "../utils/helpers";

test.describe("KhelMitra AI Frontend E2E Tests", () => {

  test.beforeEach(async ({ page }) => {
    // Log console messages from the browser
    page.on("console", msg => {
      console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
    });
    // Automatically accept all dialogs/alerts
    page.on("dialog", async dialog => {
      console.log(`DIALOG APPEARED: [${dialog.type()}] ${dialog.message()}`);
      await dialog.accept();
    });
    // Navigate to homepage
    await page.goto("/");
  });

  test("1. Landing page loads successfully", async ({ page }) => {
    // Check that landing page branding and options are visible
    await expect(page.locator('text=Alexandria').first()).toBeVisible();
    await expect(page.locator('text=The Future of the Beautiful Game').first()).toBeVisible();
    await expect(page.locator('#landing-signin-btn')).toBeVisible();
    await expect(page.locator('#landing-signup-btn')).toBeVisible();
  });

  test("2. Stadium cards/data render correctly", async ({ page }) => {
    const signupPage = new SignupPage(page);
    await navigateToTab(page, "signup");
    const uniqueUser = {
      username: `cards_${Date.now()}`,
      email: `cards_${Date.now()}@example.com`,
      password: "Password123!"
    };
    await signupPage.signup(uniqueUser.username, uniqueUser.email, uniqueUser.password);
    await expect(page.locator('h2:has-text("Welcome Back")')).toBeVisible();
    
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.login(uniqueUser.username, uniqueUser.password);
    
    // Now on dashboard!
    const dashboard = new DashboardPage(page);
    await expect(dashboard.homeTitle).toBeVisible();
    
    // Check that upcoming matches section has stadium info
    await expect(page.locator('text=Wankhede Stadium Mumbai').first()).toBeVisible();
    await expect(page.locator('text=Narendra Modi Stadium Ahmedabad').first()).toBeVisible();
    
    // Verify match cards team icons/text exactly matching team abbreviation strings
    await expect(page.locator('span').filter({ hasText: /^MI$/ }).first()).toBeVisible();
    await expect(page.locator('span').filter({ hasText: /^CSK$/ }).first()).toBeVisible();
    await expect(page.locator('span').filter({ hasText: /^RCB$/ }).first()).toBeVisible();
    await expect(page.locator('span').filter({ hasText: /^KKR$/ }).first()).toBeVisible();
  });

  test("3. Venue detail page navigation works", async ({ page }) => {
    const signupPage = new SignupPage(page);
    await navigateToTab(page, "signup");
    const uniqueUser = {
      username: `venue_${Date.now()}`,
      email: `venue_${Date.now()}@example.com`,
      password: "Password123!"
    };
    await signupPage.signup(uniqueUser.username, uniqueUser.email, uniqueUser.password);
    await expect(page.locator('h2:has-text("Welcome Back")')).toBeVisible();
    
    const loginPage = new LoginPage(page);
    await loginPage.login(uniqueUser.username, uniqueUser.password);
    
    const dashboard = new DashboardPage(page);
    await dashboard.navStats.click();
    
    // Verify Stats page and gate status components are visible
    await expect(dashboard.gateStatusHeader).toBeVisible();
    await expect(dashboard.opsSimulatorHeader).toBeVisible();
    
    // Test Zones / Infra heat map tabs
    await dashboard.heatmapInfraButton.click();
    // Verify North restrooms or other infra items appear
    await expect(page.locator('text=Restrooms (North)')).toBeVisible();
    
    await dashboard.heatmapZonesButton.click();
    await expect(page.locator('text=Gate A').first()).toBeVisible();
  });

  test("4. Login failure flow (empty form and invalid credentials)", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await navigateToTab(page, "login");
    
    // Test empty submit
    await loginPage.submitButton.click();
    await expect(loginPage.errorAlert).toBeVisible();
    await expect(loginPage.errorAlert).toContainText("Please fill in all fields.");

    // Test invalid credentials
    await loginPage.login("non_existent_user", "wrong_password");
    await expect(loginPage.errorAlert).toBeVisible();
    await expect(loginPage.errorAlert).toContainText("Invalid username/email or password");
  });

  test("5. Signup success flow", async ({ page }) => {
    const signupPage = new SignupPage(page);
    await navigateToTab(page, "signup");
    
    const uniqueUser = {
      username: `sign_${Date.now()}`,
      email: `sign_${Date.now()}@example.com`,
      password: "Password123!"
    };

    await signupPage.signup(
      uniqueUser.username,
      uniqueUser.email,
      uniqueUser.password
    );

    // Should navigate to signin tab automatically on successful registration
    await expect(page.locator('h2:has-text("Welcome Back")')).toBeVisible();
  });

  test("6. Duplicate signup validation", async ({ page }) => {
    const signupPage = new SignupPage(page);
    const duplicateUser = {
      username: `dup_${Date.now()}`,
      email: `dup_${Date.now()}@example.com`,
      password: "Password123!"
    };

    // Sign up once
    await navigateToTab(page, "signup");
    await signupPage.signup(duplicateUser.username, duplicateUser.email, duplicateUser.password);

    // Wait for the first signup to complete and redirect to signin tab
    await expect(page.locator('h2:has-text("Welcome Back")')).toBeVisible();

    // Navigate back to signup page
    await navigateToTab(page, "signup");

    // Try signing up with the same details again
    await signupPage.signup(
      duplicateUser.username,
      duplicateUser.email,
      duplicateUser.password
    );

    // Should render duplicate validation error
    await expect(signupPage.errorAlert).toBeVisible();
    await expect(signupPage.errorAlert).toContainText("duplicate");
  });

  test("7. Login success flow", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const signupPage = new SignupPage(page);
    
    const loginUser = {
      username: `login_${Date.now()}`,
      email: `login_${Date.now()}@example.com`,
      password: "Password123!"
    };

    // Register user
    await navigateToTab(page, "signup");
    await signupPage.signup(loginUser.username, loginUser.email, loginUser.password);

    // Wait for redirect to signin tab automatically on success
    await expect(page.locator('h2:has-text("Welcome Back")')).toBeVisible();

    // Login with the credentials
    await loginPage.login(loginUser.username, loginUser.password);
    
    // Header should now display Profile/Logout links
    await expect(page.locator("#nav-profile")).toBeVisible();
    await expect(page.locator("#nav-logout")).toBeVisible();
  });

  test("8. Feedback submission flow (and empty validation check)", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const signupPage = new SignupPage(page);
    
    const feedbackUser = {
      username: `feed_${Date.now()}`,
      email: `feed_${Date.now()}@example.com`,
      password: "Password123!"
    };

    // 1. Register user
    await navigateToTab(page, "signup");
    await signupPage.signup(feedbackUser.username, feedbackUser.email, feedbackUser.password);

    // Wait for redirect to signin tab automatically on success
    await expect(page.locator('h2:has-text("Welcome Back")')).toBeVisible();

    // 2. Authenticate user
    await login(page, feedbackUser.username, feedbackUser.password);

    // Wait for login flow and profile loading to settle
    await expect(page.locator("#nav-profile")).toBeVisible();
    
    // 3. Navigate to Itinerary -> Feedback subtab
    await dashboard.navItinerary.click();
    await dashboard.subtabFeedback.click();
    
    // 4. Test empty feedback inputs validation
    await dashboard.acceptedRecInput.fill("");
    await dashboard.rejectedRecInput.fill("");
    await dashboard.submitFeedbackBtn.click();
    await expect(dashboard.feedbackErrorAlert).toBeVisible();
    await expect(dashboard.feedbackErrorAlert).toContainText("Please fill in both accepted and rejected recommendations.");
    
    // 5. Fill in valid feedback details
    await dashboard.acceptedRecInput.fill("Route via Gate A and Wankhede Concessions");
    await dashboard.rejectedRecInput.fill("Pre-ordering Gujarati Dhokla House");
    await dashboard.routeSatisfactionSelect.selectOption({ value: "5" });
    await dashboard.foodSatisfactionSelect.selectOption({ value: "4" });
    await dashboard.gateSatisfactionSelect.selectOption({ value: "5" });
    
    await dashboard.submitFeedbackBtn.click();
    
    // 6. Assert successful submission
    await expect(dashboard.feedbackSuccessAlert).toBeVisible();
    await expect(dashboard.feedbackSuccessAlert).toContainText("Feedback recorded successfully!");
  });

  test("9. Crowd telemetry updates reflected in UI", async ({ page }) => {
    const signupPage = new SignupPage(page);
    await navigateToTab(page, "signup");
    const uniqueUser = {
      username: `telemetry_${Date.now()}`,
      email: `telemetry_${Date.now()}@example.com`,
      password: "Password123!"
    };
    await signupPage.signup(uniqueUser.username, uniqueUser.email, uniqueUser.password);
    await expect(page.locator('h2:has-text("Welcome Back")')).toBeVisible();
    
    const loginPage = new LoginPage(page);
    await loginPage.login(uniqueUser.username, uniqueUser.password);

    const dashboard = new DashboardPage(page);
    await dashboard.navStats.click();
    
    // Get original waiting time text for Gate A dynamically (e.g. 42m)
    const gateALabel = page.locator('div.justify-between').filter({ hasText: 'Gate A' }).locator('span').filter({ hasText: /\d+m/ }).first();
    await expect(gateALabel).toBeVisible();
    const originalWaitTime = await gateALabel.innerText();
    
    // Click "Toggle Queue" button for Gate A.
    // In our simulator, the list order corresponds to Gate A, Gate B, VIP Gate
    const firstToggleBtn = dashboard.toggleQueueButtons.nth(0);
    await firstToggleBtn.click();
    
    // Assert wait time text changed (from e.g. 42m to another number)
    await expect.poll(async () => {
      const currentText = await gateALabel.innerText();
      return currentText;
    }).not.toBe(originalWaitTime);
  });

  test("10. Logout flow and protected route access restriction", async ({ page }) => {
    const signupPage = new SignupPage(page);
    
    const logoutUser = {
      username: `logout_${Date.now()}`,
      email: `logout_${Date.now()}@example.com`,
      password: "Password123!"
    };

    // 1. Register user
    await navigateToTab(page, "signup");
    await signupPage.signup(logoutUser.username, logoutUser.email, logoutUser.password);

    // Wait for redirect to signin tab automatically on success
    await expect(page.locator('h2:has-text("Welcome Back")')).toBeVisible();

    // 2. Log in
    await login(page, logoutUser.username, logoutUser.password);
    await expect(page.locator("#nav-profile")).toBeVisible();
    
    // 3. Perform logout
    await logout(page);
    
    // 4. Profile tab should no longer be visible in the header
    await expect(page.locator("#nav-profile")).not.toBeVisible();
    await expect(page.locator("#nav-logout")).not.toBeVisible();
    
    // 5. Local storage token should be deleted
    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeNull();
  });
});

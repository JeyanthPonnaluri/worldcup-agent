export class SignupPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator("#username");
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.favoriteTeamSelect = page.locator("#favorite-team");
    this.preferredGateSelect = page.locator("#preferred-gate");
    this.submitButton = page.locator('button[type="submit"]');
    this.signInLinkButton = page.locator('button:has-text("Sign In")');
    this.errorAlert = page.locator('.bg-error-container');
  }

  async signup(username, email, password, { favoriteTeam = "", preferredGate = "", crowdTolerance = "medium", dietary = [] } = {}) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    // Select dietary preferences
    for (const pref of dietary) {
      const checkbox = this.page.locator(`label:has-text("${pref}") input[type="checkbox"]`);
      if (await checkbox.isVisible()) {
        await checkbox.check();
      }
    }

    if (favoriteTeam) {
      await this.favoriteTeamSelect.selectOption({ value: favoriteTeam });
    }

    if (preferredGate) {
      await this.preferredGateSelect.selectOption({ value: preferredGate });
    }

    if (crowdTolerance) {
      const radio = this.page.locator(`input[name="crowd-tolerance"][value="${crowdTolerance}"]`);
      if (await radio.isVisible()) {
        await radio.check();
      }
    }

    await this.submitButton.click();
  }
}

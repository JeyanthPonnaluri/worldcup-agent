export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.submitButton = page.locator('button[type="submit"]');
    this.forgotPasswordButton = page.locator('button:has-text("Forgot Password?")');
    this.joinNowButton = page.locator('button:has-text("Join Now")');
    this.errorAlert = page.locator('.bg-error-container');
  }

  async login(usernameOrEmail, password) {
    await this.emailInput.fill(usernameOrEmail);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

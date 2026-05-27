export class DashboardPage {
  constructor(page) {
    this.page = page;
    
    // Home tab elements
    this.homeTitle = page.locator('h1:has-text("KHELMITRA AI")');
    this.upcomingMatchesHeading = page.locator('h3:has-text("Upcoming Matches")');
    this.stadiumCards = page.locator('div:has-text("Stadium Wankhede")');
    
    // Navigation / Tabs
    this.navHome = page.locator("#nav-home");
    this.navChat = page.locator("#nav-chat");
    this.navStats = page.locator("#nav-stats");
    this.navItinerary = page.locator("#nav-itinerary");
    this.navSettings = page.locator("#nav-settings");
    this.navProfile = page.locator("#nav-profile");
    this.navLogout = page.locator("#nav-logout");
    this.navLogin = page.locator("#nav-login");
    this.navSignup = page.locator("#nav-signup");

    // Stats tab elements
    this.activeStadiumSelect = page.locator('select:near(h3:has-text("Active Match Arena"))'); // Fallback to label-based
    this.gateStatusHeader = page.locator('h3:has-text("Gate Status")');
    this.opsSimulatorHeader = page.locator('h3:has-text("Operations Simulator")');
    this.toggleQueueButtons = page.locator('button:has-text("Toggle Queue")');
    this.refreshDataButton = page.locator('button:has-text("Refresh Data")');
    this.heatmapZonesButton = page.locator('button:has-text("Zones")');
    this.heatmapInfraButton = page.locator('button:has-text("Infra")');
    this.trendGraphContainer = page.locator('text=30-Minute Gate Wait Time Trend');

    // Itinerary tab elements
    this.subtabActive = page.locator("#subtab-active");
    this.subtabHistory = page.locator("#subtab-history");
    this.subtabFeedback = page.locator("#subtab-feedback");
    
    // Feedback form sub-tab elements
    this.feedbackForm = page.locator("#feedback-form");
    this.feedbackUsernameInput = page.locator("#feedback-username");
    this.acceptedRecInput = page.locator("#accepted-rec");
    this.rejectedRecInput = page.locator("#rejected-rec");
    this.routeSatisfactionSelect = page.locator("#route-satisfaction");
    this.foodSatisfactionSelect = page.locator("#food-satisfaction");
    this.gateSatisfactionSelect = page.locator("#gate-satisfaction");
    this.submitFeedbackBtn = page.locator("#submit-feedback-btn");
    this.feedbackSuccessAlert = page.locator("#feedback-success");
    this.feedbackErrorAlert = page.locator("#feedback-error");
  }

  async selectStadium(stadiumName) {
    // Select the stadium from the profile settings
    await this.navProfile.click();
    await this.page.waitForSelector('#active-stadium');
    await this.page.selectOption('#active-stadium', { label: stadiumName });
  }

  async submitFeedback({ username, accepted, rejected, route = "5", food = "5", gate = "5" }) {
    await this.navItinerary.click();
    await this.subtabFeedback.click();
    
    if (username && (await this.feedbackUsernameInput.isVisible())) {
      await this.feedbackUsernameInput.fill(username);
    }
    await this.acceptedRecInput.fill(accepted);
    await this.rejectedRecInput.fill(rejected);
    await this.routeSatisfactionSelect.selectOption({ value: route });
    await this.foodSatisfactionSelect.selectOption({ value: food });
    await this.gateSatisfactionSelect.selectOption({ value: gate });
    await this.submitFeedbackBtn.click();
  }
}

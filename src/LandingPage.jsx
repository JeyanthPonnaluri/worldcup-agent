import React from "react";

export default function LandingPage({ onSignIn, onSignUp }) {
  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-md border-b border-outline-variant/30 transition-all duration-300">
        <nav className="flex justify-between items-center h-20 px-6 md:px-12 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <a className="font-headline text-2xl font-bold tracking-tight text-on-surface hover:opacity-80 transition-opacity" href="#">
              Alexandria
            </a>
            <div className="hidden md:flex gap-6 items-center">
              <a className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors" href="#experience">Experience</a>
              <a className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors" href="#features">Features</a>
              <a className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors" href="#intel">Stadium Intel</a>
              <a className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors" href="#waitlist">Join Waitlist</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              id="landing-signin-btn"
              onClick={onSignIn}
              className="text-on-surface-variant hover:text-on-surface font-label text-xs font-bold uppercase tracking-widest px-4 py-2 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button 
              id="landing-signup-btn"
              onClick={onSignUp}
              className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-full font-label text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Join Now
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section id="experience" className="relative min-h-[80vh] flex items-center px-6 md:px-12 overflow-hidden py-12">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
            <div className="z-10 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full shadow-sm">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span className="font-label text-[10px] font-bold uppercase tracking-widest">Premium Curator</span>
              </div>
              <h1 className="font-headline text-5xl md:text-7xl leading-tight text-on-surface max-w-2xl">
                The Future of the <span className="italic text-primary">Beautiful Game</span>, Curated for You.
              </h1>
              <p className="font-body text-lg md:text-xl text-on-surface-variant max-w-lg leading-relaxed">
                Experience the World Cup with a personal AI Smart Agent that masters the stadium so you can master the match.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  id="landing-hero-signup-btn"
                  onClick={onSignUp}
                  className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-4 rounded-full font-label text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Start Your Journey
                </button>
                <a 
                  href="#features"
                  className="bg-surface-container-high text-primary px-8 py-4 rounded-full font-label text-sm font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-all flex items-center gap-2 cursor-pointer border border-outline-variant/30"
                >
                  Explore Intel <span className="material-symbols-outlined text-base">arrow_forward</span>
                </a>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl border border-outline-variant/20">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Sleek World Cup Stadium Aerial Dusk Shot"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZa-KoHjMMmE5jp-QtM-izJpCPR2gRXB_egAislea8VMrCQo3Z8ufHQayAu_GBbI85OntVxK7VkPN9PqwkL-h2amYYczK7XX2BDKe17xl7_c4cY2WcpqHtEbkZeRscd-0PrISSVO6ylQ04ziht3cetqEoZKhjNtMUZXc5L5J1A1uxXqW4s1SVSWD9vPe2apYkzb9jlac-tupSD09OIArmCRt6oujbNRmjMOa_h7Ctx-4DKG2Zzip-5YBT3AxFwJ6HkQMVneXNN-Ns"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-surface/85 backdrop-blur-xl rounded-2xl border border-outline-variant/15 shadow-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
                      <span className="material-symbols-outlined text-lg">smart_toy</span>
                    </div>
                    <div>
                      <p className="font-label text-[9px] uppercase tracking-wider text-outline">Live Assistant</p>
                      <p className="font-headline font-bold text-sm text-on-surface">Alexandria Intel v.2.6</p>
                    </div>
                  </div>
                  <p className="font-body text-xs text-on-surface-variant italic leading-relaxed">
                    "Stadium gate 4 has zero wait time. Your curated path to Seat 42B is clear. Kick-off in 14 minutes."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Partners */}
        <section className="py-12 bg-surface-container-low border-y border-outline-variant/20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <p className="font-label text-[10px] uppercase tracking-[0.25em] text-center text-outline mb-10">Trusted by Global Institutions</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
              <span className="font-headline text-2xl font-bold italic tracking-tighter text-on-surface">FIFA</span>
              <span className="font-headline text-2xl font-bold tracking-tight text-on-surface">SOFI STADIUM</span>
              <span className="font-headline text-2xl font-bold tracking-widest text-on-surface">AZTECA</span>
              <span className="font-headline text-2xl font-bold italic text-on-surface">LUSAIL</span>
              <span className="font-headline text-2xl font-bold tracking-tighter text-on-surface">BC PLACE</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 md:px-12 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center max-w-3xl mx-auto space-y-4">
              <h2 className="font-headline text-4xl md:text-5xl text-on-surface">Master the Match-Day</h2>
              <div className="h-1 w-20 bg-primary mx-auto mb-4"></div>
              <p className="font-body text-lg text-on-surface-variant">Elevating your tournament experience through scholarly data analysis and real-time behavioral insights.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="group bg-surface-container-lowest p-8 border border-outline-variant/20 hover:border-primary/30 transition-all duration-300 rounded-2xl flex flex-col h-full shadow-sm hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">query_stats</span>
                </div>
                <h3 className="font-headline text-2xl text-on-surface mb-4">Tactical Match-Day Intelligence</h3>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-8">
                  Advanced tactical breakdowns delivered to your device pre-match, analyzing formation shifts and individual heatmaps in real-time.
                </p>
                <div onClick={onSignUp} className="mt-auto flex items-center text-primary font-label text-xs font-bold gap-2 cursor-pointer group-hover:translate-x-2 transition-all">
                  View Analytics Sample <span className="material-symbols-outlined text-sm">north_east</span>
                </div>
              </div>
              {/* Feature Card 2 */}
              <div className="group bg-surface-container-lowest p-8 border border-outline-variant/20 hover:border-primary/30 transition-all duration-300 rounded-2xl flex flex-col h-full shadow-sm hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">route</span>
                </div>
                <h3 className="font-headline text-2xl text-on-surface mb-4">Personalized Stadium Itineraries</h3>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-8">
                  AI-optimized routes from your residence to your seat, including curated hospitality stops and private entrance logistics.
                </p>
                <div onClick={onSignUp} className="mt-auto flex items-center text-primary font-label text-xs font-bold gap-2 cursor-pointer group-hover:translate-x-2 transition-all">
                  Design My Path <span className="material-symbols-outlined text-sm">north_east</span>
                </div>
              </div>
              {/* Feature Card 3 */}
              <div className="group bg-surface-container-lowest p-8 border border-outline-variant/20 hover:border-primary/30 transition-all duration-300 rounded-2xl flex flex-col h-full shadow-sm hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-secondary-container/20 text-secondary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">groups_2</span>
                </div>
                <h3 className="font-headline text-2xl text-on-surface mb-4">Live Crowd Insights</h3>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-8">
                  Real-time heatmaps of stadium density, enabling you to avoid queues for amenities and find the most vibrant atmosphere zones.
                </p>
                <div onClick={onSignUp} className="mt-auto flex items-center text-primary font-label text-xs font-bold gap-2 cursor-pointer group-hover:translate-x-2 transition-all">
                  See Live Map <span className="material-symbols-outlined text-sm">north_east</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Visualization Section */}
        <section id="intel" className="py-24 px-6 md:px-12 bg-surface-container-high relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="bg-surface rounded-3xl overflow-hidden grid lg:grid-cols-2 shadow-2xl border border-outline-variant/20">
              <div className="p-12 md:p-20 flex flex-col justify-center space-y-6">
                <h2 className="font-headline text-4xl md:text-5xl text-on-surface">Data-Driven Fanhood</h2>
                <p className="font-body text-base text-on-surface-variant leading-relaxed">
                  Alexandria isn't just an app; it's a scholarly companion for the discerning fan. We synthesize millions of data points—from transit delays to player performance metrics—into a single, seamless stream of consciousness.
                </p>
                <ul className="space-y-6 pt-4">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-xs text-primary font-bold">done</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-sm text-on-surface">Predictive Hospitality</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">Reservations secured based on your team's scoreline and crowd mood.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-xs text-primary font-bold">done</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-sm text-on-surface">Hyper-Local Intel</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">Gate-specific wait times updated every 45 seconds via computer vision.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative min-h-[400px]">
                <img 
                  className="w-full h-full object-cover" 
                  alt="High-tech digital analytics displayed on a tablet"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLpN6L4aJkpdXEpUhdfM4_9ktZkQzwIJfInYvj4TH_2oQqAH6B_BJL82ENL01aXJGNxO-pjliFf4K01hMIXVNmlfNIO7TIxuSWbIjXqscZBSqTnluqjubgaVfvApTL3Rs3M3efZQb2_da2trfLpSbT8wgwfeQ7IWEJ3iglrjdqs1nNLLLiVJXIGYK1bgP1XvC0xy2i1748FWVppSgne0CHBNZTMxj00c2VT2IBAYUSlxmL9TdONGMNmwZBLpkrRlOtEqizoOJtq0k"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="waitlist" className="py-32 px-6 text-center bg-background">
          <div className="max-w-3xl mx-auto space-y-10">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-primary font-bold">Limited Enrollment</span>
            <h2 className="font-headline text-5xl text-on-surface leading-tight">Be Part of the Curated Era.</h2>
            <p className="font-body text-lg text-on-surface-variant">Join the waitlist for Alexandria FanHub 2026 and experience football as it was meant to be seen: perfectly orchestrated.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 max-w-lg mx-auto">
              <input 
                id="waitlist-email"
                className="px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary w-full font-body text-sm text-on-surface" 
                placeholder="Enter your email address" 
                type="email"
              />
              <button 
                onClick={onSignUp}
                className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-4 rounded-full font-label text-sm font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Request Invite
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 md:px-12 mt-auto bg-surface-container-lowest border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="font-headline text-xl font-bold text-primary">Alexandria</span>
            <p className="font-body text-xs text-on-surface-variant max-w-xs text-center md:text-left leading-relaxed">
              © 2026 Alexandria FanHub. Scholarly insights for the beautiful game.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-label text-xs uppercase tracking-wider">
            <a className="text-on-surface-variant hover:text-on-surface transition-all" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-on-surface transition-all" href="#">Terms of Service</a>
            <a className="text-on-surface-variant hover:text-on-surface transition-all" href="#">FIFA Partnership</a>
            <a className="text-on-surface-variant hover:text-on-surface transition-all" href="#">Support</a>
          </div>
          <div className="flex gap-6">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined">language</span>
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined">share</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

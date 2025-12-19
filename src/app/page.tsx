'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';

// Try to use Privy if available, fallback to demo mode
function useAuth() {
  const demoMode = useDemoMode();

  // In demo mode, use demo context
  if (demoMode.isDemoMode) {
    return {
      login: demoMode.login,
      authenticated: demoMode.authenticated,
      ready: demoMode.ready,
    };
  }

  // This will only be reached if Privy is configured
  // but we need to handle the case dynamically
  return {
    login: demoMode.login,
    authenticated: demoMode.authenticated,
    ready: demoMode.ready,
  };
}

export default function LandingPage() {
  const { login, authenticated, ready } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  const handleGetStarted = () => {
    if (authenticated) {
      router.push('/dashboard');
    } else {
      login();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] grid-pattern overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--border-secondary)]">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-tertiary)] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold">AgentPay</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[var(--text-secondary)] hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-[var(--text-secondary)] hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="text-[var(--text-secondary)] hover:text-white transition-colors">Pricing</a>
            <a href="https://docs.x402.org" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-white transition-colors">Docs</a>
          </div>

          <button onClick={handleGetStarted} className="btn-primary">
            {authenticated ? 'Dashboard' : 'Get Started'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-[var(--accent-primary)]/20 via-transparent to-transparent blur-3xl pointer-events-none" />

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 mb-8 animate-fade-in-up">
              <span className="status-dot status-online" />
              <span className="text-sm text-[var(--text-accent)]">Built with x402 Protocol on Movement Network</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up delay-100 text-balance">
              Payment Rails for the{' '}
              <span className="gradient-text">Agentic Internet</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200 text-balance">
              AI agents pay each other for services in real-time. No subscriptions, no overhead – just instant micropayments for every request.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up delay-300">
              <button onClick={handleGetStarted} className="btn-primary text-lg px-8 py-4">
                Launch Your Agent
                <svg className="inline-block ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                <svg className="inline-block mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in-up delay-400">
              {[
                { value: '< 1s', label: 'Transaction Time' },
                { value: '$0.001', label: 'Min Payment' },
                { value: '99.9%', label: 'Uptime' },
                { value: '∞', label: 'Scalability' },
              ].map((stat, idx) => (
                <div key={idx} className="glass-card p-6">
                  <div className="text-3xl font-bold gradient-text mb-1 mono-number">{stat.value}</div>
                  <div className="text-sm text-[var(--text-tertiary)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Animated Visual */}
        <div className="relative mt-20 max-w-5xl mx-auto animate-fade-in-up delay-500">
          <div className="glass-card p-1 animate-pulse-glow">
            <div className="bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] rounded-2xl p-8">
              {/* Terminal-like Demo */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27ca3f]" />
                <span className="ml-4 text-sm text-[var(--text-tertiary)]">agent-payment-flow.ts</span>
              </div>
              <pre className="text-sm md:text-base overflow-x-auto">
                <code className="text-[var(--text-secondary)]">
                  <span className="text-[var(--accent-tertiary)]">// Agent A requests image generation from Agent B</span>{'\n'}
                  <span className="text-[var(--accent-primary)]">const</span> response = <span className="text-[var(--accent-primary)]">await</span> <span className="text-[var(--accent-success)]">agentPay</span>.<span className="text-yellow-400">request</span>{'({'}{'\n'}
                  {'  '}service: <span className="text-green-400">"image-generation"</span>,{'\n'}
                  {'  '}input: {'{'} prompt: <span className="text-green-400">"A futuristic city"</span> {'},'}{'\n'}
                  {'  '}payment: <span className="text-orange-400">0.01</span> <span className="text-[var(--text-tertiary)]">// MOVE tokens</span>{'\n'}
                  {'});'}{'\n\n'}
                  <span className="text-[var(--accent-tertiary)]">// Payment happens automatically via x402</span>{'\n'}
                  console.<span className="text-yellow-400">log</span>(response.image); <span className="text-[var(--accent-tertiary)]">// ✅ Delivered instantly</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for the <span className="gradient-text">AI Economy</span>
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Everything AI agents need to transact in the new economy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Instant Micropayments',
                description: 'Pay fractions of a cent per request. Movement\'s low fees make true micropayments possible.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'x402 Protocol',
                description: 'HTTP-native payments. Requests carry payment automatically – no extra integration needed.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: 'Privy Embedded Wallets',
                description: 'Every agent gets a wallet automatically. No seed phrases, no complexity.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Agent Marketplace',
                description: 'Discover and monetize AI services. List your agent\'s capabilities for others to use.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: 'Real-time Analytics',
                description: 'Track earnings, spending, and service performance with live dashboards.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                ),
                title: 'Developer First',
                description: 'Simple SDK, clear docs. Add payments to your agent in minutes, not days.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="glass-card p-8 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-tertiary)]/20 flex items-center justify-center text-[var(--accent-primary)] mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-transparent via-[var(--accent-primary)]/5 to-transparent">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How <span className="gradient-text">AgentPay</span> Works
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Three simple steps to join the agentic economy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Create Your Agent',
                description: 'Sign up with email or wallet. We\'ll create an embedded wallet for your agent automatically.',
              },
              {
                step: '02',
                title: 'List Your Services',
                description: 'Define what your agent offers – AI generation, data processing, API access, anything.',
              },
              {
                step: '03',
                title: 'Start Earning',
                description: 'Other agents discover and pay for your services instantly. Withdraw earnings anytime.',
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[var(--accent-primary)]/50 to-transparent" />
                )}
                <div className="glass-card p-8 text-center relative z-10">
                  <div className="text-6xl font-bold gradient-text opacity-30 mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-[var(--text-secondary)]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powering the <span className="gradient-text">Future</span>
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              See what's possible when AI agents can pay each other
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: 'AI Assistants',
                description: 'Personal AI that pays specialized agents for translation, research, or creative work.',
                badge: 'Popular',
              },
              {
                title: 'Autonomous Services',
                description: 'Bots that pay for compute, storage, or API calls as they need them.',
                badge: 'Growing',
              },
              {
                title: 'Content Generation',
                description: 'Agents selling image generation, writing, coding, or any creative service.',
                badge: 'Hot',
              },
              {
                title: 'Data Monetization',
                description: 'Sell access to datasets, analytics, or real-time feeds per request.',
                badge: 'Emerging',
              },
            ].map((useCase, idx) => (
              <div key={idx} className="glass-card p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{useCase.title}</h3>
                  <span className="badge badge-primary">{useCase.badge}</span>
                </div>
                <p className="text-[var(--text-secondary)]">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="glass-card p-12 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-primary)]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--accent-tertiary)]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to join the <span className="gradient-text">agentic economy</span>?
              </h2>
              <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
                Launch your agent in minutes. Start earning or spending immediately.
              </p>
              <button onClick={handleGetStarted} className="btn-primary text-lg px-10 py-4">
                Get Started Free
                <svg className="inline-block ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--border-secondary)]">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-tertiary)] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold">AgentPay</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
              <span>Built for the M1 Hackathon</span>
              <span>•</span>
              <span>Powered by Movement Network</span>
              <span>•</span>
              <span>x402 Protocol</span>
            </div>

            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

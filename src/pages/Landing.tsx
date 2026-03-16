import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Check, 
  ChevronDown, 
  Layers, 
  Zap, 
  Shield, 
  Users, 
  BarChart3, 
  Globe,
  Upload,
  Database,
  Layout,
  Snowflake
} from 'lucide-react';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="glass p-8 rounded-2xl border border-white/10 hover:border-accent/30 transition-colors group"
  >
    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-medium mb-3 tracking-tight">{title}</h3>
    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
      {description}
    </p>
  </motion.div>
);

const PricingCard = ({ tier, price, features, highlighted, onGetStarted }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className={cn(
      "glass p-8 rounded-3xl border flex flex-col space-y-8 relative overflow-hidden",
      highlighted ? "border-accent/50 ring-1 ring-accent/20" : "border-white/10"
    )}
  >
    {highlighted && (
      <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
        Popular
      </div>
    )}
    <div>
      <h3 className="text-sm font-medium uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-2">{tier}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-medium tracking-tighter">${price}</span>
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">/mo</span>
      </div>
    </div>
    <ul className="space-y-4 flex-1">
      {features.map((feature: string, i: number) => (
        <li key={i} className="flex items-center gap-3 text-sm">
          <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <Check size={12} />
          </div>
          <span className="text-text-secondary-light dark:text-text-secondary-dark">{feature}</span>
        </li>
      ))}
    </ul>
    <Button 
      variant={highlighted ? 'primary' : 'secondary'} 
      className="w-full py-6 text-sm"
      onClick={onGetStarted}
    >
      Get Started
    </Button>
  </motion.div>
);

const FAQItem = ({ question, answer }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-sm font-medium group-hover:text-accent transition-colors">{question}</span>
        <ChevronDown 
          size={16} 
          className={cn("text-text-secondary-light transition-transform duration-300", isOpen && "rotate-180")} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Landing = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark font-sans selection:bg-accent/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
              <Snowflake size={18} className="animate-pulse" />
            </div>
            <span className="text-lg font-medium tracking-tight">Snowflakes CRM</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
            <a href="#features" className="hover:text-accent transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-accent transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-accent transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onGetStarted}>Log in</Button>
            <Button size="sm" onClick={onGetStarted} className="px-6">Sign up</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/10 blur-[120px] rounded-full -z-10 opacity-50" />
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold uppercase tracking-widest text-accent"
          >
            <Zap size={10} />
            <span>Introducing Snowflakes 2.0</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-8xl font-medium tracking-tighter leading-[0.9]"
          >
            The CRM for <br />
            <span className="text-accent">modern teams.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto leading-relaxed font-light"
          >
            Streamline your sales pipeline, automate follow-ups, and close deals faster with our minimalist, high-performance CRM.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button size="lg" onClick={onGetStarted} className="px-10 py-7 text-base gap-2 group">
              Get Started for Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="secondary" size="lg" className="px-10 py-7 text-base">
              Book a Demo
            </Button>
          </motion.div>
        </div>

        {/* Hero Image / Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="max-w-6xl mx-auto mt-24 relative"
        >
          <div className="absolute inset-0 bg-accent/20 blur-[100px] -z-10 rounded-full opacity-30" />
          <div className="glass rounded-3xl border border-white/10 p-4 shadow-2xl overflow-hidden">
            <img 
              src="https://picsum.photos/seed/crm-dashboard/1600/900" 
              alt="Dashboard Preview" 
              className="rounded-2xl w-full h-auto opacity-90 grayscale-[0.2]"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl font-medium tracking-tight">Built for speed.</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-xl mx-auto font-light">
            Everything you need to manage your pipeline without the bloat of traditional CRMs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Zap}
            title="Lightning Fast"
            description="Optimized for performance. No loading spinners, just instant actions and real-time updates."
            delay={0.1}
          />
          <FeatureCard 
            icon={Shield}
            title="Enterprise Security"
            description="Your data is encrypted and secure. We follow industry best practices to keep your leads safe."
            delay={0.2}
          />
          <FeatureCard 
            icon={Users}
            title="Team Collaboration"
            description="Shared pipelines, mentions, and collaborative task management for your entire sales team."
            delay={0.3}
          />
          <FeatureCard 
            icon={BarChart3}
            title="Advanced Analytics"
            description="Deep insights into your sales velocity, win rates, and revenue forecasts with beautiful charts."
            delay={0.4}
          />
          <FeatureCard 
            icon={Globe}
            title="Global Scale"
            description="Manage leads across time zones and currencies. Snowflakes grows with your business."
            delay={0.5}
          />
          <FeatureCard 
            icon={Layers}
            title="Custom Workflows"
            description="Build the perfect sales process with customizable stages, tags, and automated triggers."
            delay={0.6}
          />
        </div>
      </section>

      {/* How it Works - Animated Timeline */}
      <section id="how-it-works" className="py-32 px-6 bg-black/5 dark:bg-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-medium tracking-tight">From zero to pipeline <br />in seconds.</h2>
                <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-md font-light">
                  We've streamlined the onboarding process so you can focus on selling, not configuring.
                </p>
              </div>

              <div className="space-y-12 relative">
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/10" />
                
                {[
                  { icon: Upload, title: "Upload your data", desc: "Import your leads from CSV, Google Sheets, or Excel in one click." },
                  { icon: Database, title: "Map your fields", desc: "Our AI automatically detects your columns and maps them to our schema." },
                  { icon: Layout, title: "Pipeline is ready", desc: "Start managing your deals immediately with our intuitive drag-and-drop interface." }
                ].map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="flex gap-8 relative z-10"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white shrink-0 shadow-lg shadow-accent/20">
                      <step.icon size={18} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-light">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, rotateY: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="glass rounded-3xl border border-white/10 p-8 shadow-2xl aspect-square flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-30">Pipeline View</div>
                </div>
                
                <div className="flex-1 grid grid-cols-3 gap-4">
                  {[
                    { label: 'Lead', color: 'bg-blue-500/20' },
                    { label: 'Contacted', color: 'bg-amber-500/20' },
                    { label: 'Closed', color: 'bg-emerald-500/20' }
                  ].map((col, i) => (
                    <div key={i} className="space-y-3">
                      <div className="text-[8px] uppercase tracking-widest opacity-40 font-bold mb-4">{col.label}</div>
                      {[1, 2, 3].map(j => (
                        <motion.div 
                          key={j}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: (i * 0.3) + (j * 0.1) }}
                          className={cn("h-16 rounded-xl border border-white/5", col.color)}
                        >
                          <div className="p-2 space-y-1">
                            <div className="h-1 w-1/2 bg-white/20 rounded-full" />
                            <div className="h-1 w-3/4 bg-white/10 rounded-full" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="pt-8 flex justify-center">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 0 0px rgba(99, 102, 241, 0)",
                        "0 0 0 20px rgba(99, 102, 241, 0.1)",
                        "0 0 0 0px rgba(99, 102, 241, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white shadow-xl shadow-accent/20"
                  >
                    <Zap size={24} />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-medium tracking-tight">Loved by teams worldwide.</h2>
        </div>
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass p-8 rounded-2xl border border-white/10 w-[400px] shrink-0 space-y-4">
              <div className="flex gap-1 text-accent">
                {[1, 2, 3, 4, 5].map(j => <Zap key={j} size={12} fill="currentColor" />)}
              </div>
              <p className="text-sm italic text-text-secondary-light dark:text-text-secondary-dark whitespace-normal leading-relaxed">
                "Snowflakes has completely transformed how our sales team operates. The minimalist interface is a breath of fresh air compared to Salesforce."
              </p>
              <div className="flex items-center gap-3 pt-4">
                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Avatar" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="text-sm font-medium">Alex Rivera</p>
                  <p className="text-[10px] text-text-secondary-light uppercase tracking-widest">Head of Sales, TechFlow</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl font-medium tracking-tight">Simple, transparent pricing.</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-xl mx-auto font-light">
            Choose the plan that's right for your team. No hidden fees.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard 
            tier="Starter"
            price="0"
            onGetStarted={onGetStarted}
            features={[
              "Up to 100 leads",
              "1 pipeline",
              "Basic analytics",
              "Community support"
            ]}
          />
          <PricingCard 
            tier="Pro"
            price="49"
            highlighted
            onGetStarted={onGetStarted}
            features={[
              "Unlimited leads",
              "Unlimited pipelines",
              "Advanced analytics",
              "Priority support",
              "Custom tags & fields",
              "Team collaboration"
            ]}
          />
          <PricingCard 
            tier="Enterprise"
            price="199"
            onGetStarted={onGetStarted}
            features={[
              "Everything in Pro",
              "Custom integrations",
              "Dedicated account manager",
              "SLA guarantees",
              "SSO & advanced security"
            ]}
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-medium tracking-tight">Common questions.</h2>
        </div>
        <div className="glass rounded-3xl border border-white/10 p-8">
          <FAQItem 
            question="How long does it take to set up?"
            answer="You can be up and running in less than 5 minutes. Our onboarding process is designed to be as frictionless as possible."
          />
          <FAQItem 
            question="Can I import data from other CRMs?"
            answer="Yes, we support easy imports from Salesforce, HubSpot, Pipedrive, and standard CSV files."
          />
          <FAQItem 
            question="Is there a free trial for the Pro plan?"
            answer="Absolutely. You can try any of our paid plans for free for 14 days, no credit card required."
          />
          <FAQItem 
            question="How secure is my data?"
            answer="We use bank-level encryption and follow strict security protocols to ensure your data is always protected."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto glass rounded-[40px] border border-accent/20 p-16 text-center space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/5 -z-10" />
          <h2 className="text-5xl md:text-6xl font-medium tracking-tight leading-tight">
            Ready to scale your <br />sales process?
          </h2>
          <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark max-w-xl mx-auto font-light">
            Join thousands of modern teams who trust Snowflakes to manage their pipeline.
          </p>
          <div className="pt-4">
            <Button size="lg" onClick={onGetStarted} className="px-12 py-8 text-lg gap-2 group">
              Get Started Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
                <Snowflake size={18} />
              </div>
              <span className="text-lg font-medium tracking-tight">Snowflakes CRM</span>
            </div>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed font-light">
              The minimalist CRM for high-performance sales teams.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-text-secondary-light dark:text-text-secondary-dark font-light">
              <li><a href="#" className="hover:text-accent transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-text-secondary-light dark:text-text-secondary-dark font-light">
              <li><a href="#" className="hover:text-accent transition-colors">About</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-text-secondary-light dark:text-text-secondary-dark font-light">
              <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-light">
            © 2026 Snowflakes CRM. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-text-secondary-light hover:text-accent transition-colors"><Globe size={16} /></a>
            <a href="#" className="text-text-secondary-light hover:text-accent transition-colors"><Zap size={16} /></a>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
};

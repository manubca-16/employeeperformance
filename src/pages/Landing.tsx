import { useNavigate } from "react-router-dom";
import { BarChart3, ClipboardList, TrendingUp, Gift, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: ClipboardList, title: "Daily Task Tracking", description: "Assign, monitor, and complete tasks with clear deadlines and accountability." },
  { icon: TrendingUp, title: "Weekly Performance Monitoring", description: "Track employee progress with weekly KPI scores and trend analysis." },
  { icon: BarChart3, title: "Productivity Analytics", description: "Visualize performance data with clear, actionable charts and reports." },
  { icon: Gift, title: "Bonus Reward System", description: "Announce bonus opportunities and reward outstanding performance transparently." },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="h-16 bg-card border-b border-border flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
        <span className="font-heading text-xl font-bold">PerfTrack</span>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#about" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">About</a>
          <button
            onClick={() => navigate("/signin")}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-heading font-medium hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </div>
        <button
          onClick={() => navigate("/signin")}
          className="md:hidden bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-heading font-medium"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section className="py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-heading font-bold leading-tight tracking-tight">
            Smart Employee Performance
            <br />
            Tracking System
          </h1>
          <p className="mt-6 text-lg text-muted-foreground font-body max-w-2xl mx-auto">
            Track employee productivity, monitor progress, and reward outstanding performance. 
            A calm, structured approach to organizational growth.
          </p>
          <button
            onClick={() => navigate("/signin")}
            className="mt-8 bg-primary text-primary-foreground px-8 py-3 rounded-md font-heading font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            Get Started <ArrowRight size={18} />
          </button>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground font-body">
            <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-data-green" /> Role-based access</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-data-green" /> Real-time analytics</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-data-green" /> Bonus management</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 lg:px-12 bg-card border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-heading font-bold text-center mb-12">Core Capabilities</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="kpi-card">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-muted-foreground" />
                </div>
                <h3 className="font-heading font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground font-body mt-2">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-heading font-bold mb-6">Built for Clarity</h2>
          <p className="text-muted-foreground font-body leading-relaxed">
            PerfTrack replaces the anxiety of performance tracking with calm, structured visibility. 
            Designed for Admins, HR, and Employees alike — each role sees exactly what they need, nothing more. 
            Performance data is presented as a natural rhythm, not a stressful judgment.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-heading font-bold">PerfTrack</p>
            <p className="text-xs text-muted-foreground font-body mt-1">© 2026 PerfTrack. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground font-body">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <span>contact@perftrack.io</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

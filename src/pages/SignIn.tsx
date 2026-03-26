import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = await login(email, password);
    if (ok) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold">Sign in to PerfTrack</h1>
          <p className="text-sm text-muted-foreground font-body mt-2">Enter your credentials to access the dashboard</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-heading font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring/30"
                placeholder="admin@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-heading font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring/30"
                placeholder="Enter your password"
                required
              />
            </div>
            {error && <p className="text-sm text-data-red">{error}</p>}
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-heading font-medium hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default SignIn;

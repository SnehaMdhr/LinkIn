import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import ThemeDropdown from "../components/ThemeDropdown";

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-card px-4 relative">
      {/* Dark mode toggle in top-right corner */}
      <div className="absolute top-6 right-6">
        <ThemeDropdown />
      </div>
      <div className="text-center max-w-xl">
        <h1 className="text-5xl font-bold text-foreground mb-4">LinkIn</h1>
        <p className="text-lg text-muted-foreground mb-8">
          One link for everything you are. Share all your social profiles,
          portfolio, and content with a single link.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/register">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
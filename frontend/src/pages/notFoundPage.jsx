import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="text-muted-foreground">Page Not Found</p>
      <Button asChild>
        <Link to="/">Go Home</Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
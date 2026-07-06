import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="text-center max-w-xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">LinkIn</h1>
        <p className="text-lg text-gray-600 mb-8">
          One link for everything you are. Share all your social profiles,
          portfolio, and content with a single link.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
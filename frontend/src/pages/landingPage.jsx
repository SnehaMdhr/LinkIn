import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Navbar,
  Hero,
  TrustedBy,
  Features,
  HowItWorks,
  DashboardShowcase,
  Stats,
  Testimonials,
  FAQ,
  CTA,
  Footer,
  LoginDialog,
  RegisterDialog,
} from "../components/landing";

function LandingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loginOpen, setLoginOpen] = useState(searchParams.get("auth") === "login");
  const [registerOpen, setRegisterOpen] = useState(false);

  const openLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  const openRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };

  const handleLoginClose = (val) => {
    setLoginOpen(val);
    if (!val) searchParams.delete("auth");
    if (!val) setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLoginOpen={openLogin} onRegisterOpen={openRegister} />
      <main>
        <Hero onRegisterOpen={openRegister} />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <DashboardShowcase />
        <Stats />
        <Testimonials />
        <FAQ />
        <CTA onRegisterOpen={openRegister} />
      </main>
      <Footer />

      <LoginDialog
        open={loginOpen}
        onOpenChange={handleLoginClose}
        onSwitchToRegister={openRegister}
      />
      <RegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSwitchToLogin={openLogin}
      />
    </div>
  );
}

export default LandingPage;
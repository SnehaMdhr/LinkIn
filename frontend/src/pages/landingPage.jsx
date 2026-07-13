import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Navbar,
  Hero,
  Features,
  HowItWorks,
  DashboardShowcase,
  Testimonials,
  FAQ,
  CTA,
  Footer,
  LoginDialog,
  RegisterDialog,
  ForgotPasswordDialog,
} from "../components/landing";

function LandingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loginOpen, setLoginOpen] = useState(searchParams.get("auth") === "login");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const openLogin = () => {
    setRegisterOpen(false);
    setForgotPasswordOpen(false);
    setLoginOpen(true);
  };

  const openRegister = () => {
    setLoginOpen(false);
    setForgotPasswordOpen(false);
    setRegisterOpen(true);
  };

  const openForgotPassword = () => {
    setLoginOpen(false);
    setRegisterOpen(false);
    setForgotPasswordOpen(true);
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
        <Features />
        <HowItWorks />
        <DashboardShowcase />
        <Testimonials />
        <FAQ />
        <CTA onRegisterOpen={openRegister} />
      </main>
      <Footer />

      <LoginDialog
        open={loginOpen}
        onOpenChange={handleLoginClose}
        onSwitchToRegister={openRegister}
        onSwitchToForgotPassword={openForgotPassword}
      />
      <RegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSwitchToLogin={openLogin}
      />
      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
        onSwitchToLogin={openLogin}
      />
    </div>
  );
}

export default LandingPage;
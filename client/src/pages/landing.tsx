import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import SearchSection from "@/components/search-section";
import PricingSection from "@/components/pricing-section";
import OrderForm from "@/components/order-form";
import Footer from "@/components/footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slenocard-dark text-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <SearchSection />
      <PricingSection />
      <OrderForm />
      <Footer />
    </div>
  );
}

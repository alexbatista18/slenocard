import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import SearchSection from "@/components/search-section";
import { useRef } from "react";
import PricingSection, { PlanOption } from "@/components/pricing-section";
import Footer from "@/components/footer";
import OrderForm from "@/components/order-form";

export default function Landing() {
  const orderFormRef = useRef<any>(null);

  // Função para setar o plano no formulário
  const handleSelectPlan = (plan: PlanOption) => {
    if (orderFormRef.current && orderFormRef.current.setPlan) {
      orderFormRef.current.setPlan(plan);
    }
  };

  return (
    <div className="min-h-screen bg-slenocard-dark text-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <SearchSection />
      <PricingSection onSelectPlan={handleSelectPlan} />
      <section id="pedido">
        <OrderForm ref={orderFormRef} />
      </section>
      <Footer />
    </div>
  );
}

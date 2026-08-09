import { CtaSection } from "@/components/landing/cta-section";
import { ExamsSection } from "@/components/landing/exams-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TelegramPreviewSection } from "@/components/landing/telegram-preview-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { getExamsForMarketing } from "@/services/exam.service";

export default async function Home() {
  const exams = await getExamsForMarketing();

  return (
    <main>
      <HeroSection />
      <ExamsSection exams={exams} />
      <HowItWorksSection />
      <FeaturesSection />
      <TelegramPreviewSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </main>
  );
}

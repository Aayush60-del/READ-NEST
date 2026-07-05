import React, { useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MobileLandingMotion from "../components/landing/MobileLandingMotion";
import LandingAdvancedEffects from "../components/landing/LandingAdvancedEffects";

import Navbar from "../components/Navbar";
import CustomCursor from "../components/CustomCursor";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import BenefitsSection from "../components/landing/BenefitsSection";
import ScrollTextSection from "../components/landing/ScrollTextSection";
import ReaderShowcase from "../components/landing/ReaderShowcase";
import StatsSection from "../components/landing/StatsSection";
import HorizontalScrollSection from "../components/landing/HorizontalScrollSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import CTASection from "../components/landing/CTASection";
import FooterSection from "../components/landing/FooterSection";
import api, { ENDPOINTS } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const [publicStats, setPublicStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const res = await api.get(ENDPOINTS.PUBLIC.STATS);
        setPublicStats(res?.data || null);
      } catch (err) {
        console.error("Failed to load public stats:", err);
        setPublicStats(null);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchPublicStats();
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const canUseSmoothScroll = window.matchMedia(
      "(min-width: 769px) and (pointer: fine) and (hover: hover)"
    ).matches;

    if (prefersReducedMotion || !canUseSmoothScroll) return undefined;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.15,
    });

    const raf = (time) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    window.lenis = lenis;
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  return (
    <div className="relative landing-page bg-[#f6f4ef] text-slate-950 overflow-x-hidden">
      <CustomCursor />
          <MobileLandingMotion />
      <LandingAdvancedEffects />
      <Navbar />

      <HeroSection stats={publicStats} statsLoading={statsLoading} />
      <FeaturesSection />
      <BenefitsSection />
      <ScrollTextSection />
      <HorizontalScrollSection />
      <ReaderShowcase />
      <StatsSection stats={publicStats} loading={statsLoading} />
      <TestimonialsSection />
      <CTASection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;


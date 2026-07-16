import { type JSX, useEffect, useState } from "react";

import {Loader} from "@/components/common/loader";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { StatsBar } from "@/components/sections/stats-bar";
import { LogoStrip } from "@/components/sections/logo-stripe";
import { GanttChart } from "@/components/sections/gantt";
import { Capacity } from "@/components/sections/capacity";
import { FeatureLineup } from "@/components/sections/feature-lineup";
import { Automation } from "@/components/sections/automation";
import { Testimonials } from "@/components/sections/testimonial";
import { Pricing } from "@/components/sections/pricing";
import { Cta } from "@/components/sections/cta";

function Home(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader label="Loading your schedule" />;
  }

  return (
    <main className="min-h-screen">
      <Navbar />
        <Hero />
        <StatsBar />
        <LogoStrip />
        <GanttChart />
        <Capacity />
        <FeatureLineup />
        <Automation />
        <Testimonials />
        <Pricing />
        <Cta />
      <Footer />
    </main>
  );
}

export default Home;
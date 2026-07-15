import { type JSX } from "react";
import { Navbar } from "./components/sections/navbar";
import { Footer } from "./components/sections/footer";
import { Hero } from "./components/sections/hero";
import { StatsBar } from "./components/sections/stats-bar";
import { LogoStrip } from "./components/sections/logo-stripe";
import { GanttChart } from "./components/sections/gantt";
import { Capacity } from "./components/sections/capacity";
import { FeatureLineup } from "./components/sections/feature-lineup";

function App(): JSX.Element {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero/>
      <StatsBar/>
      <LogoStrip/>
      <GanttChart/>
      <Capacity/>
      <FeatureLineup/>
      <Footer/>
    </div>
  );
}

export default App;

import { type JSX } from "react";
import { Navbar } from "./components/sections/navbar";
import { Footer } from "./components/sections/footer";
import { Hero } from "./components/sections/hero";
import { StatsBar } from "./components/sections/stats-bar";

function App(): JSX.Element {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero/>
      <StatsBar/>
      <Footer/>
    </div>
  );
}

export default App;
import Hero from "./components/Hero";
import Work from "./components/Work";
import Footer from "./components/Footer";

function App() {
  return (
    <div
      className="min-h-screen text-white 
  bg-[radial-gradient(ellipse_at_top,_#111827_0%,_#020617_60%)]"
    >
      <Hero />
      <Work />
      <Footer />
    </div>
  );
}

export default App;

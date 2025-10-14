import Categories from "../../componets/Categories/Categories";
import Footer from "../../componets/Footer/Footer";
import HeroSection from "../../componets/HeroSection/HeroSection";
import JoinUs from "../../componets/JoinUS/JoinUs";
import Navbar from "../../componets/navBar/Navbar";
import PlatosSection from "../../componets/PlatosSection/PlatosSection";


export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <Categories/>
      <PlatosSection />
      <JoinUs/>
      <Footer/>
    </>
  )
}

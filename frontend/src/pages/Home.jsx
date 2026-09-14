import Hero from '../components/hero/Hero';
import BookingSearch from '../components/home/BookingSearch';
import Destinations from '../components/home/Destinations';
import WhyChooseUs from '../components/home/WhyChooseUs';
import HotDeals from '../components/home/HotDeals';
import FeaturedTours from '../components/home/FeaturedTours';
import Statistics from '../components/home/Statistics';
import AboutSection from '../components/home/AboutSection';
import GallerySection from '../components/home/GallerySection';
import VideoSection from '../components/home/VideoSection';
import ReviewsSection from '../components/home/ReviewsSection';
import FAQSection from '../components/home/FAQSection';
import ContactSection from '../components/home/ContactSection';

// Composes the homepage from real sections, in the original section order.
// Phase 1's <SectionPending> placeholders are fully replaced now.
export default function Home() {
  return (
    <>
      <Hero />
      <BookingSearch />
      <Destinations />
      <WhyChooseUs />
      <HotDeals />
      <FeaturedTours />
      <Statistics />
      <AboutSection />
      <GallerySection />
      <VideoSection />
      <ReviewsSection />
      <FAQSection />
      <ContactSection />
    </>
  );
}

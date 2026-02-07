import Header from '../../components/customer/Header'
import Footer from '../../components/customer/Footer'
import HeroSection from '../../components/customer/HeroSection'
import AboutSection from '../../components/customer/AboutSection'
import CategoriesSection from '../../components/customer/CategoriesSection'
import FeaturedProducts from '../../components/customer/FeaturedProducts'
import WhatsAppButton from '../../components/customer/WhatsAppButton'
import './StorePage.css'

export default function StorePage() {
    return (
        <div className="store-page">
            <Header />

            <main>
                <HeroSection />
                <AboutSection />
                <CategoriesSection />
                <FeaturedProducts />
            </main>

            <Footer />
            <WhatsAppButton />
        </div>
    )
}

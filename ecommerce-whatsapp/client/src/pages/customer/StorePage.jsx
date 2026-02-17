import Header from '../../components/customer/Header'
import Footer from '../../components/customer/Footer'
import HeroSection from '../../components/customer/HeroSection'
import AboutSection from '../../components/customer/AboutSection'
import CategoriesSection from '../../components/customer/CategoriesSection'
import FeaturedProducts from '../../components/customer/FeaturedProducts'
import WhatsAppButton from '../../components/customer/WhatsAppButton'
import SEO from '../../components/common/SEO'
import './StorePage.css'

export default function StorePage() {
    return (
        <div className="store-page">
            <SEO
                title="Print Shop AR - Remeras Franco Colapinto, Rock, Cristianas y Más"
                description="Print Shop AR, tienda online especializada en remeras personalizadas de Franco Colapinto, bandas de rock, frases cristianas y populares, además de tazas, gorras, house bags y cuadros art deco personalizados. Comprá online con envío a todo Argentina."
                keywords="printshop-ar, remeras franco colapinto, remeras bandas de rock, remeras cristianas, remeras frases populares, tazas personalizadas Argentina, gorras personalizadas, house bag personalizada, cuadros art deco personalizados, regalos personalizados Jujuy"
                url="https://printshop-ar.com/"
                image="https://printshop-ar.com/logo.jpg"
                type="website"
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'WebPage',
                    '@id': 'https://printshop-ar.com/#home',
                    url: 'https://printshop-ar.com/',
                    name: 'Print Shop AR - Remeras y Productos Personalizados',
                    description:
                        'Tienda online de remeras personalizadas de Franco Colapinto, bandas de rock, frases cristianas y populares, tazas, gorras, house bags y cuadros art deco personalizados.',
                    inLanguage: 'es-AR',
                    isPartOf: {
                        '@id': 'https://printshop-ar.com/#website'
                    },
                    about: [
                        'remeras franco colapinto',
                        'remeras bandas de rock',
                        'remeras frases cristianas',
                        'remeras frases populares',
                        'tazas personalizadas',
                        'gorras personalizadas',
                        'house bags',
                        'cuadros art deco personalizados'
                    ]
                }}
            />
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

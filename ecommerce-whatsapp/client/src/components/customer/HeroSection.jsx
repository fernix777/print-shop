import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getActiveBanners } from '../../services/bannerService'
import './HeroSection.css'

export default function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)

    const defaultSlides = [
        {
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1920&auto=format&fit=crop',
            title: 'Remeras Personalizadas',
            subtitle: 'Llevá tu diseño favorito a todos lados con la mejor calidad textil',
            link: '/productos'
        },
        {
            image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1920&auto=format&fit=crop',
            title: 'Tazas Sublimadas',
            subtitle: 'El regalo perfecto para tus mañanas o para alguien especial',
            link: '/productos'
        },
        {
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1920&auto=format&fit=crop',
            title: 'Buzos y Hoodies',
            subtitle: 'Comodidad y estilo personalizado para el invierno',
            link: '/productos'
        },
        {
            image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1920&auto=format&fit=crop',
            title: 'Gorras con Onda',
            subtitle: 'Completá tu look con nuestras gorras personalizadas',
            link: '/productos'
        }
    ]

    useEffect(() => {
        loadBanners()
    }, [])

    const loadBanners = async () => {
        try {
            const { data } = await getActiveBanners()
            if (data && data.length > 0) {
                const formattedBanners = data.map(b => ({
                    id: b.id,
                    image: b.image_url,
                    title: b.title || '',
                    subtitle: '', // DB doesn't have subtitle yet
                    link: b.link || '/productos'
                }))
                setBanners(formattedBanners)
            }
        } catch (error) {
            console.error('Error loading banners:', error)
        } finally {
            setLoading(false)
        }
    }

    const slides = banners.length > 0 ? banners : defaultSlides

    const activeSlide = slides.length > 0
        ? slides[Math.min(currentSlide, slides.length - 1)]
        : null

    useEffect(() => {
        if (slides.length === 0) return

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)

        return () => clearInterval(timer)
    }, [slides.length])

    if (loading && banners.length === 0) {
        // Optional: return loading skeleton or just show defaults initially
        // For now, we render defaults while loading if we want, or nothing.
        // But since we default to defaultSlides if empty, we can just proceed.
    }

    return (
        <section className="hero-section">
            {/* Slides */}
            {slides.map((slide, index) => {
                const isExternal = slide.link?.startsWith('http')
                const Tag = slide.link ? (isExternal ? 'a' : Link) : 'div'
                const props = slide.link ? (isExternal ? { href: slide.link, target: '_blank', rel: 'noopener noreferrer' } : { to: slide.link }) : {}

                return (
                    <Tag
                        key={index}
                        className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                        {...props}
                    >
                        <div className="hero-overlay"></div>
                    </Tag>
                )
            })}

            {/* Contenido */}
            <div className="hero-content" style={{ display: 'none' }}>
                {activeSlide?.title && (
                    <h1 className="hero-title">{activeSlide.title}</h1>
                )}
                {activeSlide?.subtitle && (
                    <p className="hero-subtitle">{activeSlide.subtitle}</p>
                )}
                
                {activeSlide?.link && (
                    <Link to={activeSlide.link} className="hero-cta">
                        Ver Catálogo
                    </Link>
                )}
            </div>

            {/* Indicadores */}
            {slides.length > 1 && (
                <div className="hero-indicators">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`indicator ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                            aria-label={`Ir a slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

import HeroSection from '../../components/customer/HeroSection'
import FeaturedProducts from '../../components/customer/FeaturedProducts'

export default function Home() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-light)', overflowX: 'hidden' }}>
            {/* Header */}
            <header style={{
                padding: '1.5rem 0',
                backgroundColor: 'var(--white)',
                boxShadow: 'var(--shadow-sm)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>PRINT</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: '400', color: 'var(--black)' }}>SHOP</span>
                    </div>
                    <nav style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                        <a href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Inicio</a>
                        <a href="/productos" style={{ color: 'var(--dark-gray)', textDecoration: 'none', fontWeight: '500' }}>Productos</a>
                        <a href="/contacto" style={{ color: 'var(--dark-gray)', textDecoration: 'none', fontWeight: '500' }}>Contacto</a>
                        <a href="/admin/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: 'var(--text-sm)' }}>
                            Admin
                        </a>
                    </nav>
                </div>
            </header>

            {/* Hero Section (Banners) */}
            <HeroSection />

            {/* Featured Products */}
            <FeaturedProducts />

            {/* Welcome Section */}
            <div className="container" style={{ padding: '4rem 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{
                        fontSize: 'var(--text-4xl)',
                        color: 'var(--primary)',
                        marginBottom: '1rem'
                    }}>
                        Bienvenido a Print Shop
                    </h1>
                    <p style={{
                        fontSize: 'var(--text-xl)',
                        color: 'var(--gray)',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Personalizamos tus ideas en remeras, tazas, buzos y gorras con la mejor calidad.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer style={{
                marginTop: 'auto',
                padding: '2rem 0',
                backgroundColor: 'var(--white)',
                borderTop: '1px solid var(--light-gray)'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--gray)', fontSize: 'var(--text-sm)' }}>
                        © 2026 Print Shop - Impresión Personalizada Profesional
                    </p>
                </div>
            </footer>
        </div>
    )
}

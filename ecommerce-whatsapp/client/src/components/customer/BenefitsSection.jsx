import './BenefitsSection.css'

export default function BenefitsSection() {
    const benefits = [
        {
            icon: '🏪',
            title: 'RETIRO EN TIENDA',
            description: 'Visitanos y lleva tus productos directamente'
        },
        {
            icon: '🚚',
            title: 'ENVÍOS A TODO EL PAÍS',
            description: 'Recibe tus compras en la puerta de tu casa'
        },
        {
            icon: '🛡️',
            title: 'COMPRA SEGURA',
            description: 'Tu información está protegida con nosotros'
        },
        {
            icon: '💬',
            title: 'ATENCIÓN PERSONALIZADA',
            description: 'Te asesoramos por WhatsApp'
        },
        {
            icon: '💰',
            title: 'MEJORES PRECIOS',
            description: 'Calidad al mejor precio del mercado'
        }
    ]

    return (
        <section className="benefits-section">
            <div className="section-container">
                <div className="benefits-grid">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="benefit-card">
                            <div className="benefit-icon">{benefit.icon}</div>
                            <h3>{benefit.title}</h3>
                            <p>{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

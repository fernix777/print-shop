import { useState, useEffect, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProductBySlug } from '../../services/storeService'
import Header from '../../components/customer/Header'
import Footer from '../../components/customer/Footer'
import WhatsAppButton from '../../components/customer/WhatsAppButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { AuthContext } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
// Tracking de Facebook removido
import './ProductDetail.css'
import SEO from '../../components/common/SEO'

export default function ProductDetail() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)
    const { addToCart } = useCart()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [purchaseType, setPurchaseType] = useState('unidad') // solo unidad
    const [selectedColor, setSelectedColor] = useState('')
    const [showNotification, setShowNotification] = useState(false)

    useEffect(() => {
        loadProduct()
    }, [slug])

    const loadProduct = async () => {
        setLoading(true)
        const { data, error } = await getProductBySlug(slug)

        if (error || !data) {
            setLoading(false)
            return
        }

        // Cargar variantes
        let variants = []
        let colors = []

        if (data.variants && data.variants.length > 0) {
            // Filtrar variantes inactivas
            variants = data.variants.filter(v => v.active !== false)
            
            // Extraer colores de variant_value
            colors = variants
                .map(v => v.variant_value || v.name)
        }

        setProduct({
            ...data,
            variants: variants
        })

        // Establecer imagen inicial
        if (data.images && data.images.length > 0) {
            // Buscar imagen primaria
            const primaryIndex = data.images.findIndex(img => img.is_primary)
            setSelectedImage(primaryIndex >= 0 ? primaryIndex : 0)
        }

        // Si hay variantes, preseleccionar la primera
        if (variants.length > 0) {
            // No seleccionamos automáticamente para obligar al usuario a elegir si lo desea
            // o se puede seleccionar el primero:
            // setSelectedVariant(variants[0])
            // setSelectedColor(variants[0].variant_value || variants[0].name)
        }

        setLoading(false)
    }

    useEffect(() => {
        // Sin tracking de Facebook
    }, [product, user]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const formatDescription = (description) => {
        if (!description) return null

        // Detectar si la descripción tiene líneas con asteriscos
        const lines = description.split('\n').map(line => line.trim()).filter(line => line)
        const hasBullets = lines.some(line => line.startsWith('*'))

        if (hasBullets) {
            // Separar el título (primera línea sin asterisco) de los tags
            const titleLine = lines.find(line => !line.startsWith('*'))
            const tagLines = lines.filter(line => line.startsWith('*')).map(line => line.substring(1).trim())

            return (
                <div className="description-container">
                    {titleLine && <p className="description-title">{titleLine}</p>}
                    <div className="description-tags">
                        {tagLines.map((tag, index) => (
                            <span key={index} className="description-tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )
        }

        // Si no tiene viñetas, mostrar línea por línea
        return (
            <div className="description-container">
                {lines.map((line, index) => (
                    <p key={index} className="description-line">
                        {line}
                    </p>
                ))}
            </div>
        )
    }


    const handleAddToCart = () => {
        if (!user) {
            navigate('/login?redirect=' + encodeURIComponent(window.location.pathname))
            return
        }

        

        // Solo validar color si el producto tiene opciones de color
        if (product.has_colors && !selectedColor) {
            alert('Por favor selecciona el color del producto')
            return
        }

        const finalPrice = getFinalPrice() / quantity // Precio unitario

        addToCart(product, quantity, {
            purchaseType,
            selectedColor,
            selectedCondition: purchaseType, // Usar purchaseType como condición
            selectedVariant,
            finalPrice
        })

        // Sin tracking de Facebook

        // Mostrar notificación
        setShowNotification(true)
        setTimeout(() => setShowNotification(false), 3000)

        // Resetear cantidad
        setQuantity(1)
    }

    const getPriceByType = () => {
        const basePrice = product.base_price ?? product.price
        return basePrice
    }

    const getFinalPrice = () => {
        let price = getPriceByType()
        if (selectedVariant && selectedVariant.price_modifier) {
            price += selectedVariant.price_modifier
        }
        return price * quantity
    }

    if (loading) {
        return (
            <div className="product-detail-page">
                <Header />
                <main className="container">
                    <LoadingSpinner size="large" message="Cargando producto..." />
                </main>
                <Footer />
            </div>
        )
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <Header />
                <main className="container">
                    <div className="not-found">
                        <h1>Producto no encontrado</h1>
                        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const images = product.images || []
    const variants = product.variants || []

    const canonicalUrl = `https://printshop-ar.com/producto/${product.slug}`
    const primaryImage = images[selectedImage]?.image_url || images[0]?.image_url || 'https://printshop-ar.com/logo.jpg'
    const seoDescription =
        product.seo_description ||
        (product.description
            ? `${product.name} personalizado en Print Shop AR. ${product.description.substring(0, 140)}`
            : `${product.name} personalizado en Print Shop AR. Remeras personalizadas de Franco Colapinto, bandas de rock, frases cristianas y populares, tazas, gorras, house bags y cuadros art deco personalizados.`)

    return (
        <div className="product-detail-page">
            <Header />

            <main className="container">
                <SEO
                    title={`${product.name} - Producto Personalizado`}
                    description={seoDescription}
                    keywords={[
                        product.name,
                        product.category?.name,
                        'printshop-ar',
                        'remeras personalizadas',
                        'regalos personalizados',
                        'tazas personalizadas',
                        'gorras personalizadas'
                    ]
                        .filter(Boolean)
                        .join(', ')}
                    url={canonicalUrl}
                    image={primaryImage}
                    type="product"
                    structuredData={{
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: product.name,
                        description: seoDescription,
                        image: images.map(img => img.image_url),
                        sku: product.id,
                        category: product.category?.name,
                        url: canonicalUrl,
                        offers: {
                            '@type': 'Offer',
                            availability:
                                product.stock > 0
                                    ? 'https://schema.org/InStock'
                                    : 'https://schema.org/OutOfStock',
                            priceCurrency: 'ARS'
                        }
                    }}
                />
                <div className="breadcrumb">
                    <Link to="/">Inicio</Link>
                    {product.category && (
                        <>
                            <span>/</span>
                            <Link to={`/categoria/${product.category.slug}`}>{product.category.name}</Link>
                        </>
                    )}
                    <span>/</span>
                    <span>{product.name}</span>
                </div>

                <div className="product-detail">
                    {/* Galería de imágenes con descripción abajo */}
                    <div className="product-gallery-section">
                        <div className="product-gallery">
                            <div className="main-image">
                                {images.length > 0 ? (
                                    <img src={images[selectedImage]?.image_url} alt={product.name} />
                                ) : (
                                    <div className="no-image">📷</div>
                                )}
                            </div>
                            {images.length > 1 && (
                                <div className="image-thumbnails">
                                    {images.map((img, index) => (
                                        <div
                                            key={img.id}
                                            className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                            onClick={() => setSelectedImage(index)}
                                        >
                                            <img src={img.image_url} alt={`${product.name} ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Descripción debajo de las fotos */}
                        {product.description && (
                            <div className="product-description-section">
                                {formatDescription(product.description)}
                            </div>
                        )}
                    </div>

                    {/* Información del producto - Panel de compra */}
                    <div className="product-info">
                        <h1>{product.name}</h1>

                        {product.category && (
                            <div className="product-category">
                                <Link to={`/categoria/${product.category.slug}`}>
                                    {product.category.name}
                                </Link>
                            </div>
                        )}

                        {user ? (
                            <div className="product-price">
                                {formatPrice(getFinalPrice())}
                            </div>
                        ) : (
                            <div className="login-required">
                                <i className="fas fa-lock"></i> Inicia sesión para ver precios
                            </div>
                        )}

                        

                        {/* Selector de variante - Solo si el producto tiene variantes */}
                        {product.has_colors && product.variants && product.variants.length > 0 && (
                            <div className="form-group">
                                <label>Color</label>
                                <select
                                    className="form-control"
                                    value={selectedColor}
                                    onChange={(e) => {
                                        setSelectedColor(e.target.value)
                                        // Buscar la variante seleccionada para obtener el modificador de precio
                                        const selected = product.variants.find(v => v.variant_value === e.target.value)
                                        setSelectedVariant(selected || null)
                                    }}
                                >
                                    <option value="">Elige una opción</option>
                                    {product.variants.map((variant) => (
                                        <option key={variant.id} value={variant.variant_value}>
                                            {variant.variant_value}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Acciones de compra */}
                        <div className="purchase-actions">
                            <div className="quantity-wrapper">
                                <div className="product-quantity">
                                    <h3>Cantidad de unidades</h3>
                                    <div className="quantity-selector">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setQuantity(Math.max(1, quantity - 1))
                                            }}
                                        >-</button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            min="1"
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setQuantity(quantity + 1)
                                            }}
                                        >+</button>
                                    </div>
                                </div>

                                {/* Stock */}
                                {product.stock > 0 ? (
                                    <div className="stock-info available">
                                        ✓ Disponible
                                    </div>
                                ) : (
                                    <div className="stock-info unavailable">
                                        ✗ No Disponible
                                    </div>
                                )}
                            </div>

                            {/* Botón de compra */}
                            <button
                                onClick={handleAddToCart}
                                className="btn btn-primary btn-large add-to-cart-btn"
                                disabled={product.stock <= 0 || (product.has_colors && !selectedColor) || !user}
                            >
                                {product.stock <= 0 ? (
                                    <>❌ No Disponible</>
                                ) : (
                                    <>🛒 Agregar al Carrito</>
                                )}
                            </button>
                        </div>

                        {/* Notificación de éxito */}
                        {showNotification && (
                            <div className="success-notification">
                                ✓ Producto agregado al carrito
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
            <WhatsAppButton />
        </div>
    )
}

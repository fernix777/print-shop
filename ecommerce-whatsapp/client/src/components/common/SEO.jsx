import { Helmet } from 'react-helmet-async'
import PropTypes from 'prop-types'

/**
 * SEO Component - Manages meta tags and structured data for individual pages
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - SEO keywords
 * @param {string} props.image - OG image URL
 * @param {string} props.url - Canonical URL
 * @param {string} props.type - OG type (website, article, product)
 * @param {Object} props.structuredData - Additional structured data
 */
export default function SEO({
    title = 'Print Shop AR - Remeras Personalizadas, Tazas, Gorras y Cuadros',
    description = 'Print Shop AR, tienda online de remeras personalizadas de Franco Colapinto, remeras de bandas de rock, frases cristianas y populares, tazas, gorras, house bags y cuadros art deco personalizados. Envíos a todo Argentina.',
    keywords = 'printshop-ar, remeras personalizadas franco colapinto, remeras de bandas de rock, remeras cristianas, remeras frases populares, tazas personalizadas, gorras personalizadas, house bag personalizada, cuadros personalizados art deco, regalos personalizados Argentina',
    image = 'https://printshop-ar.com/logo.jpg',
    url = 'https://printshop-ar.com/',
    type = 'website',
    structuredData = null
}) {
    const fullTitle = title.includes('Print Shop') ? title : `${title} | Print Shop`

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Canonical URL */}
            <link rel="canonical" href={url} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content="Print Shop" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    )
}

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    keywords: PropTypes.string,
    image: PropTypes.string,
    url: PropTypes.string,
    type: PropTypes.string,
    structuredData: PropTypes.object
}

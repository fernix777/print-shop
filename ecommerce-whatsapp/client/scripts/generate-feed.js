import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conectar a Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('✗ Error: Variables de Supabase no encontradas');
    console.error('  Asegúrate de tener .env.local con:');
    console.error('  VITE_SUPABASE_URL=...');
    console.error('  VITE_SUPABASE_ANON_KEY=...');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getProductsFromSupabase() {
    try {
        // Obtener todos los productos
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('✗ Error al obtener productos:', error.message);
            return [];
        }

        // Para cada producto, obtener sus imágenes
        const productsWithImages = await Promise.all(
            (data || []).map(async (product) => {
                const { data: images } = await supabase
                    .from('product_images')
                    .select('*')
                    .eq('product_id', product.id)
                    .order('order', { ascending: true });

                return {
                    ...product,
                    images: images || []
                };
            })
        );

        return productsWithImages;
    } catch (error) {
        console.error('✗ Error de conexión:', error.message);
        return [];
    }
}

function getPrimaryImage(product) {
    if (!product.images || product.images.length === 0) return 'https://www.magnolia-n.com/logo.jpg';
    const primary = product.images.find(img => img.is_primary);
    return primary ? primary.image_url : product.images[0].image_url;
}

function generateRSSFeed(products) {
    const now = new Date().toISOString();
    
    let itemsXml = '';
    
    products.forEach(product => {
        const imageUrl = getPrimaryImage(product);
        const productUrl = `https://www.magnolia-n.com/producto/${product.slug}`;
        
        itemsXml += `
    <item>
        <title>${escapeXml(product.name)}</title>
        <link>${productUrl}</link>
        <description>${escapeXml(product.description || 'Producto de Magnolia Novedades')}</description>
        <price>${(product.price || 0).toFixed(2)}</price>
        <currency>ARS</currency>
        <image>${imageUrl}</image>
        <pubDate>${now}</pubDate>
        <guid>${productUrl}</guid>
    </item>`;
    });

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <channel>
        <title>Magnolia Novedades - Productos</title>
        <link>https://www.magnolia-n.com</link>
        <description>Decoración y regalos únicos en San Salvador de Jujuy, Argentina</description>
        <language>es-ar</language>
        <lastBuildDate>${now}</lastBuildDate>
        <image>
            <url>https://www.magnolia-n.com/logo.jpg</url>
            <title>Magnolia Novedades</title>
            <link>https://www.magnolia-n.com</link>
        </image>
        ${itemsXml}
    </channel>
</rss>`;

    return rss;
}

function escapeXml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

async function saveFeed() {
    try {
        console.log('🔄 Obteniendo productos desde Supabase...');
        const products = await getProductsFromSupabase();
        
        if (products.length === 0) {
            console.warn('⚠ No hay productos disponibles');
        } else {
            console.log(`✓ ${products.length} productos encontrados`);
        }

        const feedContent = generateRSSFeed(products);
        const publicDir = path.join(__dirname, '../public');
        const feedPath = path.join(publicDir, 'feed.xml');

        // Crear directorio public si no existe
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        fs.writeFileSync(feedPath, feedContent, 'utf8');
        console.log('✓ Feed RSS generado exitosamente en: public/feed.xml');
        console.log(`✓ Disponible en: https://www.magnolia-n.com/feed.xml`);
        console.log(`✓ Productos en el feed: ${products.length}`);
    } catch (error) {
        console.error('✗ Error al generar el feed:', error.message);
        process.exit(1);
    }
}

saveFeed();


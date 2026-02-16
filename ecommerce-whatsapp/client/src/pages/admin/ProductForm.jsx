import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
    getProductById,
    createProduct,
    updateProduct,
    addProductImages,
    deleteProductImage,
    updateImageOrders,
    setPrimaryImage
} from '../../services/productService'
import { getCategories } from '../../services/categoryService'
import ImageUploader from '../../components/admin/ImageUploader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import './ProductForm.css'




export default function ProductForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditing = Boolean(id)

    const [loading, setLoading] = useState(isEditing)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        base_price: '',
        stock: 0,
        active: true,
        featured: false,
        has_colors: true,
        variants: [],
        categories: [] // [{ category_id, subcategory_id }]
    })

    const [images, setImages] = useState([])
    const [originalImages, setOriginalImages] = useState([])
    const [newColor, setNewColor] = useState('') // Para agregar color personalizado
    const [errors, setErrors] = useState({})

    useEffect(() => {
        loadCategories()
        if (isEditing) {
            loadProduct()
        }
    }, [id])

    const loadCategories = async () => {
        const { data } = await getCategories({ active: true })
        setCategories(data || [])
    }

    const loadProduct = async () => {
        setLoading(true)
        const { data, error } = await getProductById(id)

        if (error) {
            toast.error('Error al cargar producto')
            navigate('/admin/products')
            return
        }

        // Cargar variantes existentes
        let variants = [];
        let colors = [];

        if (data.variants && data.variants.length > 0) {
            variants = data.variants.map(v => ({
                ...v,
                active: v.active !== undefined ? v.active : true
            }));
        }

        // Cargar categorías
        let productCategories = [];
        if (data.product_categories && data.product_categories.length > 0) {
            productCategories = data.product_categories;
        } else if (data.category_id) {
            // Migración: Si tiene category_id pero no product_categories
            productCategories = [{ 
                category_id: data.category_id, 
                subcategory_id: data.subcategory_id 
            }];
        }

        setFormData({
            name: data.name || '',
            description: data.description || '',
            base_price: data.base_price || '',
            stock: data.stock || 0,
            active: data.active ?? true,
            featured: data.featured ?? false,
            has_colors: data.has_colors ?? true,
            variants: variants,
            categories: productCategories
        })

        // Cargar imágenes existentes
        if (data.images) {
            const mapped = data.images.map(img => ({
                id: img.id,
                image_url: img.image_url,
                preview: img.image_url,
                is_primary: img.is_primary,
                display_order: img.display_order
            }))
            setImages(mapped)
            setOriginalImages(mapped)
        }

        setLoading(false)
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const newFormData = {
                ...prev,
                [name]: newValue
            };

            // Si se desactiva has_colors, limpiar los variantes
            if (name === 'has_colors' && !newValue) {
                return {
                    ...newFormData,
                    variants: []
                };
            }

            return newFormData;
        });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    }

    

    const handleAddCategory = () => {
        setFormData(prev => ({
            ...prev,
            categories: [...prev.categories, { category_id: '', subcategory_id: '', tempId: Date.now() }]
        }))
    }

    const handleRemoveCategory = (index) => {
        setFormData(prev => {
            const newCats = [...prev.categories]
            newCats.splice(index, 1)
            return { ...prev, categories: newCats }
        })
    }

    const handleCategoryChange = (index, field, value) => {
        setFormData(prev => {
            const newCats = [...prev.categories]
            newCats[index] = { ...newCats[index], [field]: value }
            
            // Si cambia la categoría, resetear subcategoría
            if (field === 'category_id') {
                newCats[index].subcategory_id = ''
            }
            
            return { ...prev, categories: newCats }
        })
    }

    const handleAddVariant = () => {
        if (!newColor.trim()) return
        
        // Verificar si ya existe
        const exists = formData.variants.some(v => 
            (v.name || v.variant_value).toLowerCase() === newColor.trim().toLowerCase()
        )
        
        if (exists) {
            toast.error('Este color ya está en la lista')
            return
        }

        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { 
                name: newColor.trim(), 
                variant_value: newColor.trim(), 
                active: true,
                variant_type: 'color'
            }]
        }))
        setNewColor('')
    }

    const handleRemoveVariant = (index) => {
        setFormData(prev => {
            const newVars = [...prev.variants]
            newVars.splice(index, 1)
            return { ...prev, variants: newVars }
        })
    }

    const handleToggleVariantActive = (index) => {
        setFormData(prev => {
            const newVars = [...prev.variants]
            newVars[index] = { ...newVars[index], active: !newVars[index].active }
            return { ...prev, variants: newVars }
        })
    }

    const validate = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido'
        }

        if (!formData.base_price || Number(formData.base_price) <= 0) {
            newErrors.base_price = 'El precio debe ser mayor a 0'
        }

        if (!formData.categories || formData.categories.length === 0) {
            newErrors.categories = 'Selecciona al menos una categoría'
        }

        if (images.length === 0) {
            newErrors.images = 'Agrega al menos una imagen'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validate()) {
            toast.error('Por favor completa todos los campos requeridos')
            return
        }

        setSaving(true)

        try {
            const productData = {
                ...formData,
                base_price: Number(formData.base_price),
                stock: Number(formData.stock),
                // Asignar primera categoría como principal para compatibilidad
                category_id: formData.categories[0]?.category_id ? Number(formData.categories[0].category_id) : null,
                subcategory_id: formData.categories[0]?.subcategory_id ? Number(formData.categories[0].subcategory_id) : null,
                categories: formData.categories,
                has_colors: formData.has_colors,
                // Usar las variantes de formData
                variants: formData.has_colors && formData.variants && formData.variants.length > 0
                    ? formData.variants.map(v => ({
                        name: v.name || v.variant_value,
                        variant_value: v.variant_value || v.name,
                        variant_type: 'color',
                        sku: v.sku || '',
                        active: v.active !== undefined ? v.active : true,
                        price_modifier: 0, 
                        stock: 0 
                    }))
                    : []
            }

            // Obtener solo las imágenes nuevas (que tienen file)
            const newImageFiles = images
                .filter(img => img.file)
                .map(img => img.file)

            let result
            let productId

            if (isEditing) {
                result = await updateProduct(id, productData)
                productId = Number(id)

                const currentExistingImages = images.filter(img => img.id && !img.file)
                const removedImageIds = originalImages
                    .filter(orig => !currentExistingImages.some(curr => curr.id === orig.id))
                    .map(img => img.id)

                if (removedImageIds.length > 0) {
                    await Promise.all(removedImageIds.map(imageId => deleteProductImage(imageId)))
                }

                if (currentExistingImages.length > 0) {
                    const orderUpdates = currentExistingImages.map((img, index) => ({
                        id: img.id,
                        display_order: index
                    }))
                    await updateImageOrders(orderUpdates)

                    const primaryImage = currentExistingImages.find(img => img.is_primary) || currentExistingImages[0]
                    if (primaryImage?.id) {
                        await setPrimaryImage(productId, primaryImage.id)
                    }
                }

                if (newImageFiles.length > 0) {
                    await addProductImages(productId, newImageFiles)
                }
            } else {
                result = await createProduct(productData, newImageFiles)
                productId = result.data?.id
            }

            if (result.error) {
                throw result.error
            }



            toast.success(isEditing ? 'Producto actualizado' : 'Producto creado')
            navigate('/admin/products')
        } catch (error) {
            toast.error('Error al guardar el producto')
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="product-form-page">
                <LoadingSpinner size="large" message="Cargando producto..." />
            </div>
        )
    }

    return (
        <div className="product-form-page">
            <div className="form-header">
                <div>
                    <h1>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h1>
                    <p>Completa la información del producto</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/admin/products')}
                    className="btn btn-outline"
                >
                    Cancelar
                </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
                {/* Información Básica */}
                <section className="form-section">
                    <h2>Información Básica</h2>

                    <div className="form-group">
                        <label htmlFor="name">Nombre del Producto *</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className={errors.name ? 'error' : ''}
                            disabled={saving}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Descripción</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="6"
                            disabled={saving}
                            placeholder="Ingresa la descripción del producto. Usa un asterisco (*) al inicio de cada línea para crear características que se mostrarán como tags redondeados.&#10;&#10;Ejemplo:&#10;Este es mi producto&#10;* 30 LED&#10;* Medida 3 metros&#10;* 3 pilas incluidas"
                        />
                        <small style={{ color: 'var(--gray)', marginTop: 'var(--spacing-xs)' }}>
                            💡 Tip: Usa un asterisco (*) al inicio de cada línea para crear tags. La primera línea sin asterisco será el título.
                        </small>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="base_price">Precio Base *</label>
                            <input
                                id="base_price"
                                name="base_price"
                                type="number"
                                step="0.01"
                                value={formData.base_price}
                                onChange={handleChange}
                                className={errors.base_price ? 'error' : ''}
                                disabled={saving}
                            />
                            {errors.base_price && <span className="error-text">{errors.base_price}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="stock">Disponibilidad</label>
                            <select
                                id="stock"
                                name="stock"
                                value={formData.stock > 0 ? 'available' : 'unavailable'}
                                onChange={(e) => {
                                    const val = e.target.value === 'available' ? 1000 : 0;
                                    setFormData(prev => ({ ...prev, stock: val }))
                                }}
                                disabled={saving}
                                style={{ borderColor: formData.stock > 0 ? 'var(--success)' : 'var(--danger)' }}
                            >
                                <option value="available">Disponible</option>
                                <option value="unavailable">No disponible</option>
                            </select>
                        </div>
                    </div>

                    
                </section>

                {/* Categorización */}
                <section className="form-section">
                    <h2>Categorización</h2>
                    <p className="section-description">Asigna una o más categorías a este producto.</p>

                    {formData.categories.map((cat, index) => {
                        const selectedCategory = categories.find(c => c.id === Number(cat.category_id))
                        const availableSubcategories = selectedCategory?.subcategories || []

                        return (
                            <div key={cat.tempId || index} className="category-row" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                    <label>Categoría {index + 1} *</label>
                                    <select
                                        value={cat.category_id}
                                        onChange={(e) => handleCategoryChange(index, 'category_id', e.target.value)}
                                        disabled={saving}
                                        className={errors.categories && index === 0 && !cat.category_id ? 'error' : ''}
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                    <label>Subcategoría</label>
                                    <select
                                        value={cat.subcategory_id}
                                        onChange={(e) => handleCategoryChange(index, 'subcategory_id', e.target.value)}
                                        disabled={saving || !cat.category_id}
                                    >
                                        <option value="">Sin subcategoría</option>
                                        {availableSubcategories.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleRemoveCategory(index)}
                                    className="btn-icon danger"
                                    title="Eliminar categoría"
                                    style={{ padding: '10px', height: '42px', marginTop: '24px' }}
                                    disabled={formData.categories.length === 1}
                                >
                                    ×
                                </button>
                            </div>
                        )
                    })}

                    <button
                        type="button"
                        onClick={handleAddCategory}
                        className="btn-secondary"
                        style={{ marginTop: '0.5rem' }}
                    >
                        + Agregar otra categoría
                    </button>
                    {errors.categories && <span className="error-text" style={{ display: 'block', marginTop: '0.5rem' }}>{errors.categories}</span>}
                </section>

                {/* Imágenes */}
                <section className="form-section">
                    <h2>Imágenes del Producto</h2>
                    <ImageUploader
                        images={images}
                        onChange={setImages}
                        maxImages={10}
                    />
                    {errors.images && <span className="error-text">{errors.images}</span>}
                </section>



                {/* Configuración de Venta */}
                <section className="form-section">
                    <h2>Configuración de Venta</h2>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                name="has_colors"
                                type="checkbox"
                                checked={formData.has_colors}
                                onChange={handleChange}
                                disabled={saving}
                            />
                            <span>Este producto tiene opciones de color/variantes</span>
                        </label>
                    </div>

                    {/* Gestión de Variantes */}
                    {formData.has_colors && (
                        <div className="form-group">
                            <label>Gestión de Variantes</label>
                            <p className="section-description">Agrega los colores disponibles. Puedes ocultar los que no tengan stock temporalmente.</p>
                            
                            <div className="add-variant-row" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <input
                                    type="text"
                                    value={newColor}
                                    onChange={(e) => setNewColor(e.target.value)}
                                    placeholder="Nombre del color (ej. Celeste)"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVariant())}
                                    style={{ flex: 1 }}
                                />
                                <button 
                                    type="button" 
                                    onClick={handleAddVariant}
                                    className="btn-secondary"
                                    disabled={!newColor.trim()}
                                >
                                    Agregar
                                </button>
                            </div>

                            <div className="variants-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {formData.variants.map((variant, index) => (
                                    <div key={index} className="variant-item" style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        background: '#f3f4f6',
                                        borderRadius: '6px',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        <span style={{ fontWeight: 500 }}>{variant.name || variant.variant_value}</span>
                                        
                                        <div className="variant-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <label className="checkbox-label" style={{ marginBottom: 0, fontSize: '14px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={variant.active}
                                                    onChange={() => handleToggleVariantActive(index)}
                                                />
                                                <span>{variant.active ? 'Visible' : 'Oculto'}</span>
                                            </label>
                                            
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveVariant(index)}
                                                className="btn-icon danger"
                                                title="Eliminar variante"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {formData.variants.length === 0 && (
                                    <p className="no-data-text" style={{ color: 'var(--gray)', fontStyle: 'italic' }}>No hay variantes agregadas.</p>
                                )}
                            </div>
                        </div>
                    )}

                    
                </section>

                {/* Configuración General */}
                <section className="form-section">
                    <h2>Configuración General</h2>

                    <div className="form-checkboxes">
                        <label className="checkbox-label">
                            <input
                                name="active"
                                type="checkbox"
                                checked={formData.active}
                                onChange={handleChange}
                                disabled={saving}
                            />
                            <span>Producto activo (visible en la tienda)</span>
                        </label>

                        <label className="checkbox-label">
                            <input
                                name="featured"
                                type="checkbox"
                                checked={formData.featured}
                                onChange={handleChange}
                                disabled={saving}
                            />
                            <span>Producto destacado</span>
                        </label>
                    </div>
                </section>

                {/* Botones de acción */}
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="btn btn-outline"
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Crear Producto')}
                    </button>
                </div>
            </form>
        </div >
    )
}

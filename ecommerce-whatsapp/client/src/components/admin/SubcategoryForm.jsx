import { useState, useEffect } from 'react'
import { createSubcategory, updateSubcategory } from '../../services/categoryService'
import './CategoryForm.css' // Reuse styles

export default function SubcategoryForm({ category, subcategory, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        display_order: 0,
        category_id: category?.id
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (subcategory) {
            setFormData({
                name: subcategory.name || '',
                description: subcategory.description || '',
                display_order: subcategory.display_order || 0,
                category_id: subcategory.category_id
            })
        } else if (category) {
            setFormData(prev => ({
                ...prev,
                category_id: category.id
            }))
        }
    }, [subcategory, category])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)

        try {
            let result
            if (subcategory) {
                // Update
                result = await updateSubcategory(subcategory.id, formData)
            } else {
                // Create
                result = await createSubcategory(formData)
            }

            if (result.error) {
                setErrors({ submit: result.error.message })
            } else {
                onSuccess()
            }
        } catch (error) {
            setErrors({ submit: 'Error al guardar la subcategoría' })
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="form-modal-overlay" onClick={onClose}>
            <div className="form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="form-modal-header">
                    <h2>
                        {subcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
                        {category && <span className="subtitle"> en {category.name}</span>}
                    </h2>
                    <button onClick={onClose} className="close-button">×</button>
                </div>

                <form onSubmit={handleSubmit} className="category-form">
                    {errors.submit && (
                        <div className="error-banner">
                            {errors.submit}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="name">Nombre *</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className={errors.name ? 'error' : ''}
                            disabled={loading}
                            autoFocus
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
                            rows="3"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="display_order">Orden</label>
                            <input
                                id="display_order"
                                name="display_order"
                                type="number"
                                value={formData.display_order}
                                onChange={handleChange}
                                min="0"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { getCategories, deleteCategory, deleteSubcategory } from '../../services/categoryService'
import CategoryForm from '../../components/admin/CategoryForm'
import SubcategoryForm from '../../components/admin/SubcategoryForm'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import './Categories.css'

export default function Categories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    
    // Category Form State
    const [showForm, setShowForm] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, category: null })
    
    // Subcategory Form State
    const [showSubForm, setShowSubForm] = useState(false)
    const [editingSubcategory, setEditingSubcategory] = useState(null)
    const [targetCategory, setTargetCategory] = useState(null)
    const [deleteSubDialog, setDeleteSubDialog] = useState({ isOpen: false, subcategory: null })

    const [filter, setFilter] = useState('all') // 'all' | 'active' | 'inactive'

    useEffect(() => {
        loadCategories()
    }, [filter])

    const loadCategories = async () => {
        setLoading(true)
        const options = filter === 'all' ? {} : { active: filter === 'active' }
        const { data, error } = await getCategories(options)

        if (error) {
            toast.error('Error al cargar categorías')
            console.error(error)
        } else {
            setCategories(data || [])
        }
        setLoading(false)
    }

    // Category Handlers
    const handleCreate = () => {
        setEditingCategory(null)
        setShowForm(true)
    }

    const handleEdit = (category) => {
        setEditingCategory(category)
        setShowForm(true)
    }

    const handleFormClose = () => {
        setShowForm(false)
        setEditingCategory(null)
    }

    const handleFormSuccess = () => {
        setShowForm(false)
        setEditingCategory(null)
        loadCategories()
        toast.success(editingCategory ? 'Categoría actualizada' : 'Categoría creada')
    }

    const handleDeleteClick = (category) => {
        setDeleteDialog({ isOpen: true, category })
    }

    const handleDeleteConfirm = async () => {
        const { success, error } = await deleteCategory(deleteDialog.category.id)

        if (success) {
            toast.success('Categoría eliminada')
            loadCategories()
        } else {
            toast.error('Error al eliminar categoría')
            console.error(error)
        }

        setDeleteDialog({ isOpen: false, category: null })
    }

    // Subcategory Handlers
    const handleCreateSubcategory = (category) => {
        setTargetCategory(category)
        setEditingSubcategory(null)
        setShowSubForm(true)
    }

    const handleEditSubcategory = (subcategory, category) => {
        setTargetCategory(category)
        setEditingSubcategory(subcategory)
        setShowSubForm(true)
    }

    const handleSubFormClose = () => {
        setShowSubForm(false)
        setEditingSubcategory(null)
        setTargetCategory(null)
    }

    const handleSubFormSuccess = () => {
        setShowSubForm(false)
        setEditingSubcategory(null)
        setTargetCategory(null)
        loadCategories()
        toast.success(editingSubcategory ? 'Subcategoría actualizada' : 'Subcategoría creada')
    }

    const handleDeleteSubcategoryClick = (subcategory) => {
        setDeleteSubDialog({ isOpen: true, subcategory })
    }

    const handleDeleteSubcategoryConfirm = async () => {
        const { success, error } = await deleteSubcategory(deleteSubDialog.subcategory.id)

        if (success) {
            toast.success('Subcategoría eliminada')
            loadCategories()
        } else {
            toast.error('Error al eliminar subcategoría')
            console.error(error)
        }

        setDeleteSubDialog({ isOpen: false, subcategory: null })
    }

    return (
        <div className="categories-page">
            <Toaster position="top-right" />

            <div className="page-header">
                <div>
                    <h1>Categorías</h1>
                    <p>Gestiona las categorías de productos</p>
                </div>
                <button onClick={handleCreate} className="btn btn-primary">
                    + Agregar Categoría
                </button>
            </div>

            <div className="categories-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todas
                </button>
                <button
                    className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Activas
                </button>
                <button
                    className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
                    onClick={() => setFilter('inactive')}
                >
                    Inactivas
                </button>
            </div>

            {loading ? (
                <LoadingSpinner size="large" message="Cargando categorías..." />
            ) : categories.length === 0 ? (
                <div className="empty-state">
                    <p>📦 No hay categorías todavía</p>
                    <button onClick={handleCreate} className="btn btn-primary">
                        Crear primera categoría
                    </button>
                </div>
            ) : (
                <div className="categories-grid">
                    {categories.map(category => (
                        <div key={category.id} className="category-card">
                            {category.image_url && (
                                <div className="category-image">
                                    <img src={category.image_url} alt={category.name} />
                                </div>
                            )}

                            <div className="category-content">
                                <div className="category-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <h3>{category.name}</h3>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(category);
                                            }}
                                            className="btn-icon"
                                            title="Editar Categoría"
                                            style={{ fontSize: '1.2rem' }}
                                        >
                                            ✎
                                        </button>
                                    </div>
                                    <span className={`status-badge ${category.active ? 'active' : 'inactive'}`}>
                                        {category.active ? 'Activa' : 'Inactiva'}
                                    </span>
                                </div>

                                {category.description && (
                                    <p className="category-description">{category.description}</p>
                                )}

                                <div className="subcategories-section">
                                    <div className="subcategories-header">
                                        <h4>Subcategorías ({category.subcategories?.length || 0})</h4>
                                        <button 
                                            onClick={() => handleCreateSubcategory(category)}
                                            className="btn-add-sub"
                                            title="Agregar subcategoría"
                                        >
                                            +
                                        </button>
                                    </div>
                                    
                                    {category.subcategories && category.subcategories.length > 0 ? (
                                        <ul className="subcategory-list">
                                            {category.subcategories.map(sub => (
                                                <li key={sub.id} className="subcategory-item">
                                                    <span className="sub-name">{sub.name}</span>
                                                    <div className="sub-actions">
                                                        <button 
                                                            onClick={() => handleEditSubcategory(sub, category)}
                                                            className="btn-icon"
                                                            title="Editar"
                                                        >
                                                            ✎
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteSubcategoryClick(sub)}
                                                            className="btn-icon danger"
                                                            title="Eliminar"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="no-subcategories">Sin subcategorías</p>
                                    )}
                                </div>
                            </div>

                            <div className="category-actions">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="btn btn-outline btn-sm"
                                >
                                    Editar Categoría
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(category)}
                                    className="btn btn-outline btn-sm btn-danger-outline"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <CategoryForm
                    category={editingCategory}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}

            {showSubForm && (
                <SubcategoryForm
                    category={targetCategory}
                    subcategory={editingSubcategory}
                    onClose={handleSubFormClose}
                    onSuccess={handleSubFormSuccess}
                />
            )}

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, category: null })}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Categoría"
                message={`¿Estás seguro de eliminar "${deleteDialog.category?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                type="danger"
            />

            <ConfirmDialog
                isOpen={deleteSubDialog.isOpen}
                onClose={() => setDeleteSubDialog({ isOpen: false, subcategory: null })}
                onConfirm={handleDeleteSubcategoryConfirm}
                title="Eliminar Subcategoría"
                message={`¿Estás seguro de eliminar "${deleteSubDialog.subcategory?.name}"?`}
                confirmText="Eliminar"
                type="danger"
            />
        </div>
    )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBanners, createBanner, deleteBanner, updateBanner } from '../../services/bannerService'
import toast, { Toaster } from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import './AdminBanners.css'

export default function AdminBanners() {
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [newBanner, setNewBanner] = useState({
        title: '',
        link: '',
        active: true,
        display_order: 0
    })
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)

    useEffect(() => {
        loadBanners()
    }, [])

    const loadBanners = async () => {
        setLoading(true)
        const { data, error } = await getBanners()
        if (error) {
            toast.error('Error al cargar banners')
        } else {
            setBanners(data || [])
        }
        setLoading(false)
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedFile) {
            toast.error('Debes seleccionar una imagen')
            return
        }

        setUploading(true)
        const { data, error } = await createBanner(newBanner, selectedFile)
        setUploading(false)

        if (error) {
            toast.error('Error al crear banner')
        } else {
            toast.success('Banner creado exitosamente')
            setNewBanner({ title: '', link: '', active: true, display_order: 0 })
            setSelectedFile(null)
            setPreviewUrl(null)
            loadBanners()
        }
    }

    const handleDelete = async (id, imageUrl) => {
        if (!window.confirm('¿Estás seguro de eliminar este banner?')) return

        const loadingToast = toast.loading('Eliminando...')
        const { error } = await deleteBanner(id, imageUrl)
        toast.dismiss(loadingToast)

        if (error) {
            toast.error('Error al eliminar banner')
        } else {
            toast.success('Banner eliminado')
            loadBanners()
        }
    }

    const handleToggleActive = async (banner) => {
        const { error } = await updateBanner(banner.id, { active: !banner.active })
        if (error) {
            toast.error('Error al actualizar estado')
        } else {
            loadBanners()
        }
    }

    return (
        <div className="admin-banners-page">
            <Toaster position="top-right" />
            
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/admin/dashboard" className="btn" style={{ textDecoration: 'none', fontSize: '1.2rem' }}>
                        ⬅️
                    </Link>
                    <h1>Gestionar Banners</h1>
                </div>
            </div>

            <div className="banners-content">
                {/* Formulario de creación */}
                <div className="banner-form-card">
                    <h2>Agregar Nuevo Banner</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Imagen del Banner (Recomendado: 1200x400px)</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                required
                            />
                            {previewUrl && (
                                <div className="image-preview">
                                    <img src={previewUrl} alt="Vista previa" />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Título (Opcional)</label>
                            <input 
                                type="text" 
                                value={newBanner.title}
                                onChange={e => setNewBanner({...newBanner, title: e.target.value})}
                                placeholder="Ej: Ofertas de Verano"
                            />
                        </div>

                        <div className="form-group">
                            <label>Enlace (Opcional)</label>
                            <input 
                                type="text" 
                                value={newBanner.link}
                                onChange={e => setNewBanner({...newBanner, link: e.target.value})}
                                placeholder="Ej: /products?category=1"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Orden</label>
                                <input 
                                    type="number" 
                                    value={newBanner.display_order}
                                    onChange={e => setNewBanner({...newBanner, display_order: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={newBanner.active}
                                        onChange={e => setNewBanner({...newBanner, active: e.target.checked})}
                                    />
                                    Activo
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={uploading}>
                            {uploading ? 'Subiendo...' : 'Guardar Banner'}
                        </button>
                    </form>
                </div>

                {/* Lista de banners */}
                <div className="banners-list">
                    <h2>Banners Existentes</h2>
                    {loading ? (
                        <LoadingSpinner />
                    ) : banners.length === 0 ? (
                        <p>No hay banners registrados.</p>
                    ) : (
                        <div className="banners-grid">
                            {banners.map(banner => (
                                <div key={banner.id} className={`banner-card ${!banner.active ? 'inactive' : ''}`}>
                                    <div className="banner-image">
                                        <img src={banner.image_url} alt={banner.title} />
                                        <div className="banner-status">
                                            {banner.active ? 
                                                <span className="badge-active">Activo</span> : 
                                                <span className="badge-inactive">Inactivo</span>
                                            }
                                        </div>
                                    </div>
                                    <div className="banner-info">
                                        <h3>{banner.title || 'Sin título'}</h3>
                                        <p>{banner.link || 'Sin enlace'}</p>
                                        <div className="banner-actions">
                                            <button 
                                                className="btn-toggle"
                                                onClick={() => handleToggleActive(banner)}
                                            >
                                                {banner.active ? 'Desactivar' : 'Activar'}
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDelete(banner.id, banner.image_url)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

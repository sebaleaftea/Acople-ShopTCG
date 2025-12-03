import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../Api/axios'; // Usamos Api con mayúscula según tu estructura
import '../styles/admin.css';
import '../styles/home.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Estados
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  // Estados del Modal "Agregar"
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ 
    nombre: '', 
    slug: '',
    stock: 0, 
    precio: 0,
    descripcion: '',
    category: 'single', // Valor por defecto
    game: 'magic'       // Valor por defecto
  });
  const [addError, setAddError] = useState('');

  // 1. Cargar productos desde el Backend Java
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Backend Java: GET /api/products (devuelve array directo)
      const response = await api.get('/products');
      
      const backendProducts = response.data.map(p => ({
        id: p.id,
        nombre: p.name,
        slug: p.slug, // Crucial para las imágenes
        stock: p.stock,
        precio: p.price,
        descripcion: p.description,
        category: p.category,
        game: p.game,
        isEditing: false
      }));
      
      setRows(backendProducts);
    } catch (err) {
      console.error("Error cargando inventario:", err);
      setError("No se pudo cargar el inventario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
        navigate('/');
        return;
    }
    fetchProducts();
  }, [user, navigate]);

  // 2. Crear Producto (POST)
  const submitAdd = async (e) => {
    e.preventDefault();
    setAddError('');

    if (!addForm.nombre.trim() || !addForm.slug.trim()) {
      return setAddError('Nombre y Slug son obligatorios');
    }

    try {
      // Payload ajustado al modelo Product.java
      const payload = {
        name: addForm.nombre,
        slug: addForm.slug.toLowerCase().replace(/\s+/g, '-'), // Auto-formato básico
        description: addForm.descripcion || 'Sin descripción',
        price: Number(addForm.precio),
        stock: Number(addForm.stock),
        category: addForm.category,
        game: addForm.game
        // Nota: No enviamos 'image' porque usamos la estrategia del slug
      };

      await api.post('/products', payload);
      
      await fetchProducts(); 
      setIsAddOpen(false);
      // Reset del formulario
      setAddForm({ 
        nombre: '', slug: '', stock: 0, precio: 0, descripcion: '', 
        category: 'single', game: 'magic' 
      });
      alert('Producto creado con éxito');

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error al crear producto';
      setAddError(msg);
    }
  };

  // 3. Actualizar Producto (PUT)
  const saveRow = async (id) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;

    setSavingId(id);
    try {
      // Backend Java espera el objeto completo para hacer update
      const payload = {
        name: row.nombre,
        slug: row.slug,
        description: row.descripcion,
        price: Number(row.precio),
        stock: Number(row.stock),
        category: row.category,
        game: row.game
      };

      await api.put(`/products/${id}`, payload);
      toggleEdit(id); // Salir del modo edición después de guardar
      alert('Actualizado correctamente');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar');
    } finally {
      setSavingId(null);
    }
  };

  // 4. Eliminar Producto (DELETE)
  const removeRow = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;

    try {
      await api.delete(`/products/${id}`);
      setRows(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar producto');
    }
  };

  // Manejo local de cambios en la tabla
  const handleLocalChange = (id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const deltaStock = (id, delta) => {
    setRows(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, stock: Math.max(0, Number(r.stock) + delta) };
      }
      return r;
    }));
  };

  // Función para alternar modo edición
  const toggleEdit = (id) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, isEditing: !r.isEditing } : r));
  };

  // Generador automático de slug basado en el nombre
  const handleNameChange = (e) => {
    const val = e.target.value;
    setAddForm(prev => ({
      ...prev,
      nombre: val,
      // Si el usuario no ha escrito un slug personalizado, sugerimos uno
      slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    }));
  };

  return (
    <main className="admin-main">
      <header className="admin-header">
        <h1 className="admin-title">Panel de Administración</h1>
        <div className="admin-header-info">
            <span>{user?.email || user?.username}</span>
            <button onClick={logout} className="admin-logout-btn">
            Cerrar sesión
            </button>
        </div>
      </header>

      {error && <div className="error-message" style={{marginBottom: '1rem'}}>{error}</div>}

      <section className="admin-card">
        <div className="admin-toolbar">
          <h2 className="admin-section-title admin-section-title-margin">
            Inventario (Backend Java)
          </h2>
          <button className="admin-btn-secondary" onClick={() => setIsAddOpen(true)}>
            + Agregar Producto
          </button>
        </div>

        {loading ? (
            <p>Cargando inventario...</p>
        ) : (
            <div className="admin-table-wrapper">
            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Slug</th>
                    <th>Descripción</th>
                    <th>Juego/Categoría</th>
                    <th>Stock</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {rows.length === 0 && (
                    <tr><td colSpan="8" style={{textAlign: 'center', padding: '2rem'}}>No hay productos en la base de datos.</td></tr>
                )}
                {rows.map(r => (
                    <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      {r.isEditing ? (
                        <input
                          type="text"
                          value={r.nombre}
                          onChange={(e) => handleLocalChange(r.id, 'nombre', e.target.value)}
                          className="admin-input"
                          style={{ width: '100%' }}
                        />
                      ) : (
                        r.nombre
                      )}
                    </td>
                    <td>
                      {r.isEditing ? (
                        <input
                          type="text"
                          value={r.slug}
                          onChange={(e) => handleLocalChange(r.id, 'slug', e.target.value)}
                          className="admin-input"
                          style={{ width: '100%', fontFamily: 'monospace' }}
                        />
                      ) : (
                        r.slug
                      )}
                    </td>
                    <td>
                      {r.isEditing ? (
                        <input
                          type="text"
                          value={r.descripcion}
                          onChange={(e) => handleLocalChange(r.id, 'descripcion', e.target.value)}
                          className="admin-input"
                          style={{ width: '100%' }}
                        />
                      ) : (
                        r.descripcion
                      )}
                    </td>
                    <td>
                      {r.isEditing ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <select
                            value={r.game}
                            onChange={(e) => handleLocalChange(r.id, 'game', e.target.value)}
                            style={{ padding: '4px', borderRadius: '4px', background: '#333', color: '#fff', border: '1px solid #555' }}
                          >
                            <option value="magic">Magic</option>
                            <option value="pokemon">Pokémon</option>
                            <option value="yugioh">Yu-Gi-Oh!</option>
                            <option value="accesorio">Accesorio</option>
                          </select>
                          <select
                            value={r.category}
                            onChange={(e) => handleLocalChange(r.id, 'category', e.target.value)}
                            style={{ padding: '4px', borderRadius: '4px', background: '#333', color: '#fff', border: '1px solid #555' }}
                          >
                            <option value="single">Single</option>
                            <option value="carpetas">Carpeta</option>
                            <option value="dados">Dados</option>
                            <option value="playmat">Playmat</option>
                            <option value="portamazos">Portamazo</option>
                            <option value="protectores">Protectores</option>
                          </select>
                        </div>
                      ) : (
                        <span style={{fontSize: '0.85em', background: '#333', padding: '2px 6px', borderRadius: '4px'}}>
                          {r.game} / {r.category}
                        </span>
                      )}
                    </td>
                    <td style={{ minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="admin-btn-outline" onClick={() => deltaStock(r.id, -1)}>-</button>
                        <input
                            type="number"
                            min={0}
                            value={r.stock}
                            onChange={(e) => handleLocalChange(r.id, 'stock', e.target.value)}
                            className="admin-input"
                            style={{ width: 60 }}
                        />
                        <button className="admin-btn-outline" onClick={() => deltaStock(r.id, 1)}>+</button>
                        </div>
                    </td>
                    <td style={{ minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>$</span>
                        <input
                            type="number"
                            min={0}
                            step={100}
                            value={r.precio}
                            onChange={(e) => handleLocalChange(r.id, 'precio', e.target.value)}
                            className="admin-input"
                            style={{ width: 100 }}
                        />
                        </div>
                    </td>
                    <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                        {r.isEditing ? (
                          <>
                            <button
                                className="admin-btn-secondary"
                                onClick={() => saveRow(r.id)}
                                disabled={savingId === r.id}
                                title="Guardar Cambios"
                            >
                                {savingId === r.id ? '...' : 'Guardar'}
                            </button>
                            <button
                                className="admin-btn-outline"
                                onClick={() => toggleEdit(r.id)}
                                title="Cancelar"
                            >
                                Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                                className="admin-btn-secondary"
                                onClick={() => toggleEdit(r.id)}
                                title="Editar"
                            >
                                Editar
                            </button>
                            <button
                                className="admin-btn-outline"
                                onClick={() => removeRow(r.id)}
                                title="Eliminar"
                            >
                                🗑️
                            </button>
                          </>
                        )}
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
      </section>

      {/* Modal Agregar */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsAddOpen(false)}>&times;</button>
            <div className="modal-body">
              <form onSubmit={submitAdd}>
                <h2>Nuevo Producto</h2>
                
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={addForm.nombre}
                    onChange={handleNameChange}
                    required
                    placeholder="Ej: Black Lotus"
                  />
                </div>

                <div className="form-group">
                  <label>Slug (ID para imagen)</label>
                  <input
                    type="text"
                    value={addForm.slug}
                    onChange={(e) => setAddForm({...addForm, slug: e.target.value})}
                    required
                    placeholder="Ej: black-lotus"
                    style={{fontFamily: 'monospace', color: '#4ade80'}}
                  />
                  <small style={{color: '#999'}}>Debe coincidir con el nombre de archivo en assets (sin extensión).</small>
                </div>

                <div className="form-row" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                  <div className="form-group">
                    <label>Juego</label>
                    <select 
                      value={addForm.game} 
                      onChange={(e) => setAddForm({...addForm, game: e.target.value})}
                      style={{width: '100%', padding: '0.75rem', borderRadius: '6px', background: '#333', color: '#fff', border: '1px solid #555'}}
                    >
                      <option value="magic">Magic</option>
                      <option value="pokemon">Pokémon</option>
                      <option value="yugioh">Yu-Gi-Oh!</option>
                      <option value="accesorio">Accesorio</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select 
                      value={addForm.category} 
                      onChange={(e) => setAddForm({...addForm, category: e.target.value})}
                      style={{width: '100%', padding: '0.75rem', borderRadius: '6px', background: '#333', color: '#fff', border: '1px solid #555'}}
                    >
                      <option value="single">Single (Carta)</option>
                      <option value="carpetas">Carpeta</option>
                      <option value="dados">Dados</option>
                      <option value="playmat">Playmat</option>
                      <option value="portamazos">Portamazo</option>
                      <option value="protectores">Protectores</option>
                    </select>
                  </div>
                </div>

                <div className="form-row" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                  <div className="form-group">
                    <label>Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={addForm.stock}
                      onChange={(e) => setAddForm({...addForm, stock: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Precio</label>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={addForm.precio}
                      onChange={(e) => setAddForm({...addForm, precio: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <input
                    type="text"
                    value={addForm.descripcion}
                    onChange={(e) => setAddForm({...addForm, descripcion: e.target.value})}
                    placeholder="Breve descripción..."
                  />
                </div>

                {addError && <div className="error-message">{addError}</div>}
                
                <div style={{ display: 'flex', gap: 12, marginTop: '1rem' }}>
                  <button type="button" className="admin-btn-outline" onClick={() => setIsAddOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="modal-submit-btn" style={{ flex: 1 }}>
                    Crear Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;
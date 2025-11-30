import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios'; // Importamos el cliente API
import '../styles/admin.css';
import '../styles/home.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Usamos el AuthContext real

  // Estados
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null); // Para mostrar "Guardando..." en un item específico
  const [error, setError] = useState('');

  // Estados del Modal "Agregar"
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ 
    nombre: '', 
    stock: 0, 
    precio: 0,
    descripcion: '' // Agregamos descripción
  });
  const [addError, setAddError] = useState('');

  // 1. Cargar productos desde el Backend al iniciar
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Traemos todos los productos (activos)
      const response = await api.get('/products?limit=200&isActive=true');
      
      // Mapeamos la respuesta del backend a la estructura de la tabla
      const backendProducts = response.data.data.products.map(p => ({
        id: p._id,
        nombre: p.name,
        stock: p.stock,
        precio: p.price,
        descripcion: p.description
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
    // Si no es admin, fuera
    // (Nota: idealmente el backend también protege las rutas)
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

    if (!addForm.nombre.trim()) return setAddError('El nombre es obligatorio');

    try {
      // Body para el backend
      const payload = {
        name: addForm.nombre,
        price: Number(addForm.precio),
        stock: Number(addForm.stock),
        description: addForm.descripcion || 'Producto creado desde Admin',
        // Como acordamos, category e images no se guardan en backend todavía,
        // pero podemos enviarlos sin romper nada.
        category: 'General'
      };

      await api.post('/products', payload);
      
      // Recargamos la tabla
      await fetchProducts(); 
      setIsAddOpen(false);
      setAddForm({ nombre: '', stock: 0, precio: 0, descripcion: '' });
      alert('Producto creado con éxito');

    } catch (err) {
      console.error(err);
      setAddError(err.response?.data?.message || 'Error al crear producto');
    }
  };

  // 3. Actualizar Producto (PUT)
  // Esta función guarda los cambios de precio/stock de una fila
  const saveRow = async (id) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;

    setSavingId(id);
    try {
      await api.put(`/products/${id}`, {
        price: Number(row.precio),
        stock: Number(row.stock)
      });
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
      // Actualizamos la UI eliminando la fila localmente
      setRows(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar producto');
    }
  };

  // Helpers para editar los inputs de la tabla en tiempo real (antes de guardar)
  const handleLocalChange = (id, field, value) => {
    setRows(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, [field]: value };
      }
      return r;
    }));
  };

  const deltaStock = (id, delta) => {
    setRows(prev => prev.map(r => {
      if (r.id === id) {
        const newStock = Math.max(0, Number(r.stock) + delta);
        return { ...r, stock: newStock };
      }
      return r;
    }));
  };

  // --- Render ---

  return (
    <main className="admin-main">
      <header className="admin-header">
        <h1 className="admin-title">Panel de Administración</h1>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <span>{user?.email}</span>
            <button onClick={logout} className="admin-logout-btn">
            Cerrar sesión
            </button>
        </div>
      </header>

      {error && <div className="error-message" style={{marginBottom: '1rem'}}>{error}</div>}

      <section className="admin-card">
        <div className="admin-toolbar">
          <h2 className="admin-section-title" style={{ margin: 0 }}>
            Inventario Real (Base de Datos)
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
                    <th>Nombre</th>
                    <th>Stock</th>
                    <th>Precio (CLP)</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {rows.length === 0 && (
                    <tr><td colSpan="4" style={{textAlign: 'center', padding: '2rem'}}>No hay productos en la base de datos.</td></tr>
                )}
                {rows.map(r => (
                    <tr key={r.id}>
                    <td>{r.nombre}</td>
                    
                    {/* Columna Stock */}
                    <td style={{ minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="admin-btn-outline" onClick={() => deltaStock(r.id, -1)}>-</button>
                        <input
                            type="number"
                            min={0}
                            value={r.stock}
                            onChange={(e) => handleLocalChange(r.id, 'stock', e.target.value)}
                            className="admin-input"
                            style={{ width: 80 }}
                        />
                        <button className="admin-btn-outline" onClick={() => deltaStock(r.id, 1)}>+</button>
                        </div>
                    </td>

                    {/* Columna Precio */}
                    <td style={{ minWidth: 160 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>$</span>
                        <input
                            type="number"
                            min={0}
                            step={100}
                            value={r.precio}
                            onChange={(e) => handleLocalChange(r.id, 'precio', e.target.value)}
                            className="admin-input"
                            style={{ width: 120 }}
                        />
                        </div>
                    </td>

                    {/* Acciones */}
                    <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            className="admin-btn-secondary"
                            onClick={() => saveRow(r.id)}
                            disabled={savingId === r.id}
                        >
                            {savingId === r.id ? '...' : '💾'}
                        </button>
                        <button
                            className="admin-btn-outline"
                            onClick={() => removeRow(r.id)}
                            title="Eliminar"
                        >
                            🗑️
                        </button>
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
                    onChange={(e) => setAddForm({...addForm, nombre: e.target.value})}
                    required
                    placeholder="Ej: Mazo Commander"
                  />
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
                  <label>Precio (CLP)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={addForm.precio}
                    onChange={(e) => setAddForm({...addForm, precio: e.target.value})}
                    required
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
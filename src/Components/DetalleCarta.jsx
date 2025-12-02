import React from "react";
import { useParams } from "react-router-dom";
import { allProducts } from "../data/products";
import "../styles/detalle-carta.css";

const DetalleCarta = () => {
  const { id } = useParams();
  const cartaRaw = allProducts.find((c) => String(c.id) === id);
  const carta = cartaRaw && {
    ...cartaRaw,
    nombre: cartaRaw.nombre || cartaRaw.name || 'Sin nombre',
    imagen: cartaRaw.imagen || cartaRaw.image || '',
    precio: cartaRaw.precio ?? cartaRaw.price ?? 0,
    rareza: cartaRaw.rareza || cartaRaw.rarity || '-',
    edicion: cartaRaw.edicion || cartaRaw.edition || cartaRaw.expansion || '-',
    descripcion: cartaRaw.descripcion || cartaRaw.description || '',
    tipo: cartaRaw.tipo || cartaRaw.category || '-',
  };

  if (!carta) {
    return (
      <main className="detalle-carta-container">
        <div className="detalle-carta-flex">
          <div className="detalle-carta-info-col">
            <div className="detalle-carta-error">
              No se encontró la carta solicitada.
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="detalle-carta-container">
      <div className="detalle-carta-flex">
        <div className="detalle-carta-img-col">
          <img
            src={carta.imagen}
            alt={carta.nombre}
            className="detalle-carta-img"
          />
        </div>
        <div className="detalle-carta-info-col">
          <h1 className="detalle-carta-nombre">{carta.nombre}</h1>
          <div className="detalle-carta-info-list">
            <p><strong>Edición:</strong> {carta.edicion}</p>
            <p><strong>Rareza:</strong> {carta.rareza}</p>
            <p><strong>Precio:</strong> ${Number(carta.precio).toLocaleString()}</p>
            <p><strong>N° Coleccionista:</strong> {carta.coleccionista || '-'}</p>
            <p><strong>Tipo:</strong> {carta.tipo}</p>
            {carta.productType === 'single' && (
              <>
                <p><strong>Stock:</strong> {carta.stock}</p>
                <p><strong>Grado:</strong> {carta.grado}</p>
              </>
            )}
          </div>
          <div className="detalle-carta-descripcion">
            <p>{carta.descripcion}</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DetalleCarta;

import React from 'react';
import { FaTag } from 'react-icons/fa';

const isEqual = (a, b) => {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every(key => isEqual(a[key], b[key]));
};

const ListaInformes = ({ informes, seleccionados, onSeleccion, etiquetas = {} }) => {
  const obtenerTodos = (item) => {
    let items = [item];
    if (item.children) {
      item.children.forEach(child => {
        if (typeof child === 'object') {
          items = items.concat(obtenerTodos(child));
        }
      });
    }
    return items;
  };

  const toggleSeleccion = (item) => {
    const todos = obtenerTodos(item);
    const yaSeleccionado = seleccionados.some(sel => isEqual(sel, item));
    if (yaSeleccionado) {
      onSeleccion(prev => prev.filter(sel => !todos.some(t => isEqual(t, sel))));
    } else {
      onSeleccion(prev => [...prev, ...todos.filter(t => !prev.some(sel => isEqual(sel, t)))]);
    }
  };

  const renderizarItems = (items, nivel = 0, renderizados = new Set()) => {
    return items.map((item) => {
      const itemKey = JSON.stringify(item);

      if (renderizados.has(itemKey)) return null;
      renderizados.add(itemKey);

      const seleccionado = seleccionados.some(sel => isEqual(sel, item));
      const etiqueta = etiquetas[itemKey];

      // Etiqueta como elemento 
      const etiquetaItem = etiqueta ? { tipo: 'etiqueta', parent: itemKey, label: etiqueta } : null;
      const etiquetaKey = etiquetaItem ? `etiqueta-${itemKey}` : null;
      const etiquetaSeleccionada = etiquetaItem && seleccionados.some(sel => isEqual(sel, etiquetaItem));

      return (
        <div key={itemKey} style={{ paddingLeft: `${nivel * 20}px` }}>
          <div className="mb-2">
            <div className="d-flex align-items-center">
              <input
                type="checkbox"
                checked={seleccionado}
                onChange={() => toggleSeleccion(item)}
                className="form-check-input me-2"
              />
              <span>{item.title || item}</span>
            </div>

            {/* Mostrar la etiqueta como un item seleccionable */}
            {etiquetaItem && (
              <div
                key={etiquetaKey}
                className="ps-4 mt-1 d-flex align-items-center"
                style={{ paddingLeft: `${(nivel + 1) * 20}px` }}
              >
                <input
                  type="checkbox"
                  checked={etiquetaSeleccionada}
                  onChange={() => toggleSeleccion(etiquetaItem)}
                  className="form-check-input me-2"
                />
                <span className="text-primary">
                  <FaTag className="me-1" />
                  Etiqueta: {etiquetaItem.label}
                </span>
              </div>
            )}

            {item.children && typeof item.children[0] === 'object' &&
              renderizarItems(item.children, nivel + 1, renderizados)}
          </div>
        </div>
      );
    });
  };

  return <div className="mt-2">{renderizarItems(informes)}</div>;
};

export default ListaInformes;

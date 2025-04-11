import React from 'react';

const isEqual = (a, b) => {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every(key => isEqual(a[key], b[key]));
};

const ListaBoletines = ({ boletines, seleccionados, onSeleccion }) => {
  const toggleSeleccion = (item) => {
    onSeleccion(prev => 
      prev.some(sel => isEqual(sel, item)) 
        ? prev.filter(sel => !isEqual(sel, item)) 
        : [...prev, item]
    );
  };

  const renderizarItems = (items, nivel = 0) => {
    return items.map((item, index) => (
      <div key={index} style={{ paddingLeft: `${nivel * 20}px` }}>
        <div className="mb-2">
          <div className="d-flex align-items-center">
            <input
              type="checkbox"
              checked={seleccionados.some(sel => isEqual(sel, item))}
              onChange={() => toggleSeleccion(item)}
              className="form-check-input me-2"/>
            <span>{item.title || item}</span>
          </div>
          {item.children && renderizarItems(item.children, nivel + 1)}
        </div>
      </div>
    ));
  };

  return <div className="mt-2">{renderizarItems(boletines)}</div>;
};

export default ListaBoletines;
import React, { useState } from 'react';

const PanelFiltros = ({ filtros, onFiltrosChange }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onFiltrosChange(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleLimpiar = () => {
    onFiltrosChange({
      palabrasClave: '',
      fechaDesde: '',
      fechaHasta: '',
      tipo: 'todos',
      soloFavoritos: false
    });
  };

  return (
    <div className="barra-filtros bg-light p-2 mb-3 rounded shadow-sm">
      <div className="d-flex flex-wrap align-items-center gap-2">
        <div className="d-flex align-items-center">
          <span className="me-2 small">Fecha:</span>
          <select 
            name="tipoFecha"
            className="form-select form-select-sm"
            style={{ width: '100px' }}>
            <option value="publicacion">Pub.</option>
            <option value="informe">Informe</option>
          </select>
        </div>

        <div className="d-flex align-items-center">
          <span className="me-2 small">Ámbito:</span>
          <select 
            name="tipo"
            value={filtros.tipo}
            onChange={handleChange}
            className="form-select form-select-sm"
            style={{ width: '120px' }}>
            <option value="todos">Todas</option>
            <option value="seleccionados">Seleccionados</option>
          </select>
        </div>

        <div className="d-flex align-items-center">
          <span className="me-2 small">Desde:</span>
          <input
            type="date"
            name="fechaDesde"
            value={filtros.fechaDesde}
            onChange={handleChange}
            className="form-control form-control-sm"
            style={{ width: '130px' }}/>
        </div>

        <div className="d-flex align-items-center">
          <span className="me-2 small">Hasta:</span>
          <input
            type="date"
            name="fechaHasta"
            value={filtros.fechaHasta}
            onChange={handleChange}
            className="form-control form-control-sm"
            style={{ width: '130px' }}/>
        </div>

        <div className="d-flex align-items-center flex-grow-1">
          <span className="me-2 small">Palabras clave:</span>
          <input
            type="text"
            name="palabrasClave"
            value={filtros.palabrasClave}
            onChange={handleChange}
            placeholder="Buscar..."
            className="form-control form-control-sm"/>
        </div>

        {/* Nuevo checkbox para favoritos */}
        <div className="d-flex align-items-center">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="soloFavoritos"
              id="soloFavoritos"
              checked={filtros.soloFavoritos || false}
              onChange={handleChange}
            />
            <label className="form-check-label small ms-1" htmlFor="soloFavoritos">
              Favoritos
            </label>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button 
            type="button" 
            className="btn btn-sm btn-outline-secondary"
            onClick={handleLimpiar}>
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanelFiltros;
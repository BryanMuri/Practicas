import React, { useState } from 'react';
import { FaStar, FaRegStar, FaTag, FaComment, FaTimes } from 'react-icons/fa';
import PanelFiltros from './components/PanelFiltros';
import ListaBoletines from './components/listaBoletines';
import ListaInformes from './components/listaInformes';
import boletines from './data/boletines.json';
import informes from './data/informes.json';
import 'bootstrap/dist/css/bootstrap.min.css';

const isEqual = (a, b) => {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every(key => isEqual(a[key], b[key]));
};

const filtrarTodo = (datos, filtros) => {
  const resultados = [];


  const buscar = (nodos) => {
    nodos.forEach(nodo => {
      const coincideTexto = !filtros.palabrasClave || 
        (nodo.title && nodo.title.toLowerCase().includes(filtros.palabrasClave.toLowerCase())) ||
        (nodo.descripcion && nodo.descripcion.toLowerCase().includes(filtros.palabrasClave.toLowerCase()));
      
      const coincideFecha = 
        (!filtros.fechaDesde || (nodo.fecha && nodo.fecha >= filtros.fechaDesde)) &&
        (!filtros.fechaHasta || (nodo.fecha && nodo.fecha <= filtros.fechaHasta));
      
      const coincideTipo = 
        filtros.tipo === 'todos' || 
        (nodo.tipo && nodo.tipo.toLowerCase() === filtros.tipo.toLowerCase());
      
      if (coincideTexto && coincideFecha && coincideTipo) {
        resultados.push(nodo);
      }
      
      if (nodo.children) {
        buscar(nodo.children);
      }
    });
  };
  
  buscar(datos);
  return resultados;
};

const contarClick = (clave) => {
  if (typeof sessionStorage !== "undefined") {
    const actual = Number(sessionStorage.getItem(clave)) || 0;
    const nuevo = actual + 1;
    sessionStorage.setItem(clave, nuevo);
    console.log(`Clics en ${clave}: ${nuevo}`);
  } else {
    console.log("sessionStorage no está disponible.");
  }
};

const App = () => {
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [mostrarBoletines, setMostrarBoletines] = useState(false);
  const [mostrarInformes, setMostrarInformes] = useState(false);
  const [filtros, setFiltros] = useState({
    palabrasClave: '',
    fechaDesde: '',
    fechaHasta: '',
    tipo: 'todos'
  });
  const [seleccionados, setSeleccionados] = useState([]);
  const [favoritos, setFavoritos] = useState(() => {
    const guardados = localStorage.getItem("favoritos");
    return guardados ? JSON.parse(guardados) : [];
  });
  
  const [etiquetas, setEtiquetas] = useState(() => {
    const guardadas = localStorage.getItem("etiquetas");
    return guardadas ? JSON.parse(guardadas) : {};
  });
  
  const [comentarios, setComentarios] = useState(() => {
    const guardados = localStorage.getItem("comentarios");
    return guardados ? JSON.parse(guardados) : {};
  });


  React.useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);
  
  React.useEffect(() => {
    localStorage.setItem("etiquetas", JSON.stringify(etiquetas));
  }, [etiquetas]);
  
  React.useEffect(() => {
    localStorage.setItem("comentarios", JSON.stringify(comentarios));
  }, [comentarios]);

  const toggleFavorito = (item) => {
    setFavoritos(prev => 
      prev.some(fav => isEqual(fav, item)) 
        ? prev.filter(fav => !isEqual(fav, item))
        : [...prev, item]
    );
  };

  const agregarEtiqueta = (item, etiqueta) => {
    setEtiquetas(prev => ({
      ...prev,
      [JSON.stringify(item)]: etiqueta
    }));
  };

  const agregarComentario = (item, comentario) => {
    setComentarios(prev => ({
      ...prev,
      [JSON.stringify(item)]: comentario
    }));
  };

  const toggleBoletines = () => {
    setMostrarBoletines(!mostrarBoletines);
    setMostrarInformes(false);
  };

  const toggleInformes = () => {
    setMostrarInformes(!mostrarInformes);
    setMostrarBoletines(false);
  };

  const generarContenido = () => {
    if (mostrarBoletines) {
      console.log("Generando boletín con los items:", seleccionados);
    } else if (mostrarInformes) {
      console.log("Generando informe con los items:", seleccionados);
    }
  };

  const contenidoPrincipal = seleccionados.filter(item => {
    const itemKey = JSON.stringify(item);
    const coincideTexto = 
      filtros.palabrasClave === '' || 
      (item.title && item.title.toLowerCase().includes(filtros.palabrasClave.toLowerCase())) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(filtros.palabrasClave.toLowerCase()));
    
    const coincideFecha = 
      (!filtros.fechaDesde || (item.fecha && item.fecha >= filtros.fechaDesde)) &&
      (!filtros.fechaHasta || (item.fecha && item.fecha <= filtros.fechaHasta));
    
    const coincideTipo = 
      filtros.tipo === 'todos' || 
      (item.tipo && item.tipo.toLowerCase() === filtros.tipo.toLowerCase());
    
    return coincideTexto && coincideFecha && coincideTipo;
  });

  return (
    <div className="container-fluid mt-3">
      <nav className="navbar navbar-light bg-light mb-2 p-2 rounded shadow-sm">
        <div className="container-fluid">
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-primary">Home</button>
            <button 
              className={`btn btn-sm ${seleccionados.length > 0 ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={generarContenido}
              disabled={seleccionados.length === 0}>
              {mostrarBoletines ? 'Generar Boletín' : 'Generar Informe'}
            </button>
            <button 
              onClick={() => setMostrarFiltros(!mostrarFiltros)} 
              className="btn btn-sm btn-outline-secondary">
              {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
          </div>
        </div>
      </nav>

      {mostrarFiltros && <PanelFiltros filtros={filtros} onFiltrosChange={setFiltros} />}

      <div className="row mt-2">
        <div className="col-md-3">
          <div className="d-flex gap-2 mb-2">
            <button
              onClick={toggleBoletines}
              className={`btn btn-sm ${mostrarBoletines ? 'btn-primary' : 'btn-outline-primary'}`}>
              {mostrarBoletines ? 'Ocultar Boletines' : 'Boletines'}
            </button>
            <button
              onClick={toggleInformes}
              className={`btn btn-sm ${mostrarInformes ? 'btn-primary' : 'btn-outline-primary'}`}>
              {mostrarInformes ? 'Ocultar Informes' : 'Informes'}
            </button>
          </div>

          <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
            {mostrarBoletines && (
              <ListaBoletines 
                boletines={filtrarTodo(boletines, filtros)} 
                seleccionados={seleccionados}
                onSeleccion={setSeleccionados}/>
            )}
            {mostrarInformes && (
              <ListaInformes 
                informes={filtrarTodo(informes, filtros)} 
                seleccionados={seleccionados}
                onSeleccion={setSeleccionados}/>
            )}
          </div>
        </div>

        <div className="col-md-9">
          <h5 className="mb-3"></h5>
          <div className="border rounded p-2" style={{ minHeight: '200px' }}>
            {contenidoPrincipal.length > 0 ? (
              <div className="list-group">
                {contenidoPrincipal.map((item, index) => {
                  const itemKey = JSON.stringify(item);
                  const esFavorito = favoritos.some(fav => isEqual(fav, item));
                  const etiqueta = etiquetas[itemKey];
                  const comentario = comentarios[itemKey];

                  return (
                    <div key={index} className="list-group-item py-2 px-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{item.title || item}</h6>
                          {item.fecha && (
                            <small className="text-muted d-block">
                              Fecha de publicación: {item.fecha}
                            </small>
                          )}
                          {item.descripcion && (
                            <p className="mb-1 small">{item.descripcion}</p>
                          )}
                        </div>
                        
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              contarClick("favorito");
                              toggleFavorito(item);
                            }}
                            
                            title={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
                            {esFavorito ? <FaStar className="text-warning" /> : <FaRegStar />}
                          </button>

                          <button 
                            className="btn btn-sm p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              contarClick("etiqueta");
                              const nuevaEtiqueta = prompt('Ingrese etiqueta:', etiqueta || '');
                              if (nuevaEtiqueta !== null) {
                                agregarEtiqueta(item, nuevaEtiqueta);
                              }
                            }}
                            title={etiqueta || 'Agregar etiqueta'}>
                            <FaTag className={etiqueta ? 'text-primary' : ''} />
                          </button>

                          <button 
                            className="btn btn-sm p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              contarClick("comentario");
                              const nuevoComentario = prompt('Ingrese comentario:', comentario || '');
                              if (nuevoComentario !== null) {
                                agregarComentario(item, nuevoComentario);
                              }
                            }}
                            title={comentario || 'Agregar comentario'}>
                            <FaComment className={comentario ? 'text-info' : ''} />
                          </button>

                          <button 
                            className="btn btn-sm p-0 text-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSeleccionados(prev => prev.filter(i => !isEqual(i, item)));
                            }}
                            title="Quitar">
                            <FaTimes />
                          </button>
                        </div>
                      </div>

                      {(etiqueta || comentario) && (
                        <div className="mt-2 small">
                          {etiqueta && (
                            <span className="badge bg-primary me-2">
                              <FaTag className="me-1" /> {etiqueta}
                            </span>
                          )}
                          {comentario && (
                            <span className="text-muted">
                              <FaComment className="me-1" /> {comentario}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ):(
              <div className="text-muted small p-2">Gg</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
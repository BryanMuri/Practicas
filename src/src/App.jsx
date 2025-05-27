import React, { useState, useEffect } from 'react'; 
import { FaStar, FaRegStar, FaTag, FaComment, FaTimes, FaHome } from 'react-icons/fa';
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

// Función que filtrar boletines/informes 
const filtrarTodo = (datos, filtros, favoritos, seleccionados) => {
  if (filtros.tipo === 'seleccionados') {
    return seleccionados.filter(item => {
      const coincideTexto =
        !filtros.palabrasClave ||
        (item.title && item.title.toLowerCase().includes(filtros.palabrasClave.toLowerCase())) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(filtros.palabrasClave.toLowerCase()));
      const coincideFecha =
        (!filtros.fechaDesde || (item.fecha && item.fecha >= filtros.fechaDesde)) &&
        (!filtros.fechaHasta || (item.fecha && item.fecha <= filtros.fechaHasta));
      const coincideFavorito =
        !filtros.soloFavoritos ||
        (favoritos.some(fav => isEqual(fav, item)));
      return coincideTexto && coincideFecha && coincideFavorito;
    });
  }

  const resultados = [];
  const buscar = (nodos) => {
    nodos.forEach(nodo => {
      const coincideTexto =
        !filtros.palabrasClave ||
        (nodo.title && nodo.title.toLowerCase().includes(filtros.palabrasClave.toLowerCase())) ||
        (nodo.descripcion && nodo.descripcion.toLowerCase().includes(filtros.palabrasClave.toLowerCase()));
      const coincideFecha =
        (!filtros.fechaDesde || (nodo.fecha && nodo.fecha >= filtros.fechaDesde)) &&
        (!filtros.fechaHasta || (nodo.fecha && nodo.fecha <= filtros.fechaHasta));
      const coincideTipo =
        filtros.tipo === 'todos' ||
        (nodo.tipo && nodo.tipo.toLowerCase() === filtros.tipo.toLowerCase());
      const coincideFavorito =
        !filtros.soloFavoritos ||
        (favoritos.some(fav => isEqual(fav, nodo)));
      if (coincideTexto && coincideFecha && coincideTipo && coincideFavorito) {
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

// Guardar las cookies de los clicks
const contarClickLink = (item) => {
  const key = encodeURIComponent(item.id || JSON.stringify(item));
  const actual = parseInt(document.cookie.split('; ').find(row => row.startsWith(key + '='))?.split('=')[1]) || 0;
  const nuevo = actual + 1;
  const fechaexpirar = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 año
  document.cookie = `${key}=${nuevo}; expires=${fechaexpirar.toUTCString()}; path=/`;
};

// Contar clicks links
const ConteoCookie = (item) => {
  const key = encodeURIComponent(item.id || JSON.stringify(item));
  return parseInt(document.cookie.split('; ').find(row => row.startsWith(key + '='))?.split('=')[1]) || 0;
};

// Pantalla de login 
const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      localStorage.setItem('isLoggedIn', 'true');
      onLogin();
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="card p-4" style={{ width: '300px' }}>
        <h2 className="text-center mb-4">Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [mostrarBoletines, setMostrarBoletines] = useState(false);
  const [mostrarInformes, setMostrarInformes] = useState(false);
  const [mostrarContenidoGenerado, setMostrarContenidoGenerado] = useState(false); // NUEVO: controla si se muestra el contenido generado

  const [filtros, setFiltros] = useState({
    palabrasClave: '',
    fechaDesde: '',
    fechaHasta: '',
    tipo: 'todos',
    soloFavoritos: false,
  });

  const [seleccionados, setSeleccionados] = useState([]);

  // Estados para favoritos, etiquetas y comentarios 
  const [favoritos, setFavoritos] = useState(() => {
    const guardados = localStorage.getItem('favoritos');
    return guardados ? JSON.parse(guardados) : [];
  });
  const [etiquetas, setEtiquetas] = useState(() => {
    const guardadas = localStorage.getItem('etiquetas');
    return guardadas ? JSON.parse(guardadas) : {};
  });
  const [comentarios, setComentarios] = useState(() => {
    const guardados = localStorage.getItem('comentarios');
    return guardados ? JSON.parse(guardados) : {};
  });

  // Verifica si ya estaba logueado (guardado en localStorage)
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) setIsLoggedIn(true);
  }, []);

  // Guarda favoritos, etiquetas y comentarios en localStorage cuando cambian
  useEffect(() => localStorage.setItem('favoritos', JSON.stringify(favoritos)), [favoritos]);
  useEffect(() => localStorage.setItem('etiquetas', JSON.stringify(etiquetas)), [etiquetas]);
  useEffect(() => localStorage.setItem('comentarios', JSON.stringify(comentarios)), [comentarios]);

  // Funciones para login/logout
  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  // Añadir o quitar de favoritos
  const toggleFavorito = (item) => {
    setFavoritos((prev) =>
      prev.some((fav) => isEqual(fav, item))
        ? prev.filter((fav) => !isEqual(fav, item))
        : [...prev, item]
    );
  };

  // Guardar etiqueta 
  const agregarEtiqueta = (item, etiqueta) => {
    setEtiquetas((prev) => ({ ...prev, [JSON.stringify(item)]: etiqueta }));
  };

  // Guardar comentario 
  const agregarComentario = (item, comentario) => {
    setComentarios((prev) => ({ ...prev, [JSON.stringify(item)]: comentario }));
  };

  // Aplicar filtros al contenido seleccionado
  const contenidoPrincipal = seleccionados.filter((item) => {
    const itemKey = JSON.stringify(item);
    const coincideTexto =
      filtros.palabrasClave === '' ||
      (item.title && item.title.toLowerCase().includes(filtros.palabrasClave.toLowerCase())) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(filtros.palabrasClave.toLowerCase()));
    const coincideFecha =
      (!filtros.fechaDesde || (item.fecha && item.fecha >= filtros.fechaDesde)) &&
      (!filtros.fechaHasta || (item.fecha && item.fecha <= filtros.fechaHasta));
    const coincideFavorito =
      !filtros.soloFavoritos || favoritos.some((fav) => isEqual(fav, item));
    return coincideTexto && coincideFecha && coincideFavorito;
  });

  // Pantalla de login 
  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="container-fluid mt-3">
      <nav className="navbar navbar-light bg-light mb-2 p-2 rounded shadow-sm">
        <div className="container-fluid">
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-primary" onClick={handleLogout}>
              <FaHome /> Home
            </button>

            {/* Boton de generar informe o boletín */}
            <button
              className={`btn btn-sm ${seleccionados.length > 0 ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setMostrarContenidoGenerado(true)}
              disabled={seleccionados.length === 0}
            >
              {mostrarBoletines ? 'Generar Boletín' : 'Generar Informe'}
            </button>

            {/* Mostrar/ocultar filtros */}
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="btn btn-sm btn-outline-secondary"
            >
              {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
          </div>
        </div>
      </nav>

      {mostrarFiltros && <PanelFiltros filtros={filtros} onFiltrosChange={setFiltros} />}

      <div className="row mt-2">
        {/* Sidebar */}
        <div className="col-md-3">
          <div className="d-flex gap-2 mb-2">
            {/* Boton lista de boletines */}
            <button
              onClick={() => {
                setMostrarBoletines(!mostrarBoletines);
                setMostrarInformes(false);
              }}
              className={`btn btn-sm ${mostrarBoletines ? 'btn-primary' : 'btn-outline-primary'}`}
            >
              {mostrarBoletines ? 'Ocultar Boletines' : 'Boletines'}
            </button>

            {/* Boton lista de informes */}
            <button
              onClick={() => {
                setMostrarInformes(!mostrarInformes);
                setMostrarBoletines(false);
              }}
              className={`btn btn-sm ${mostrarInformes ? 'btn-primary' : 'btn-outline-primary'}`}
            >
              {mostrarInformes ? 'Ocultar Informes' : 'Informes'}
            </button>
          </div>

          {/* Lista de boletines/informes filtrados */}
          <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
            {mostrarBoletines && (
              <ListaBoletines 
                boletines={boletines}  
                seleccionados={seleccionados} 
                onSeleccion={setSeleccionados} 
                etiquetas={etiquetas}
              />
            )}
            {mostrarInformes && (
              <ListaInformes 
              informes={informes}   
              seleccionados={seleccionados} 
              onSeleccion={setSeleccionados} 
              etiquetas={etiquetas}
              />
            )}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="col-md-9">
          <div className="border rounded p-2" style={{ minHeight: '200px' }}>
            {!mostrarContenidoGenerado ? (
              <div className="text-muted small p-2">Presiona "Generar Informe/Boletín" para ver el contenido</div>
            ) : contenidoPrincipal.length > 0 ? (
              <div className="list-group">
                {/* Muestra cada ítem filtrado */}
                {contenidoPrincipal.map((item, index) => {
                  const itemKey = JSON.stringify(item);
                  const esFavorito = favoritos.some((fav) => isEqual(fav, item));
                  const etiqueta = item.tipo === 'etiqueta' ? item.label : etiquetas[itemKey];
                  const comentario = comentarios[itemKey];
                  const conteo = ConteoCookie(item);

                  return (
                    <div key={index} className="list-group-item py-2 px-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">
                            {item.tipo === 'etiqueta' ? (
                              <>
                                <FaTag className="me-1 text-primary" />
                                Etiqueta: {item.label}
                              </>
                            ) : (
                              item.title || item
                            )}
                          </h6>

                          {item.fecha && (
                            <small className="text-muted d-block">
                              Fecha de publicación: {item.fecha}
                            </small>
                          )}
                          {item.descripcion && <p className="mb-1 small">{item.descripcion}</p>}
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => contarClickLink(item)}
                            >
                              Ver enlace ({conteo} clic{conteo !== 1 ? 's' : ''})
                            </a>
                          )}
                        </div>

                        {/* Iconos */}
                        <div className="d-flex gap-2">
                          {item.tipo !== 'etiqueta' && (
                            <>
                              <button className="btn btn-sm p-0" onClick={() => toggleFavorito(item)}>
                                {esFavorito ? <FaStar className="text-warning" /> : <FaRegStar />}
                              </button>
                              <button
                                className="btn btn-sm p-0"
                                onClick={() => {
                                  const nuevaEtiqueta = prompt('Ingrese etiqueta:', etiqueta || '');
                                  if (nuevaEtiqueta !== null) agregarEtiqueta(item, nuevaEtiqueta);
                                }}
                              >
                                <FaTag className={etiqueta ? 'text-primary' : ''} />
                              </button>
                              <button
                                className="btn btn-sm p-0"
                                onClick={() => {
                                  const nuevoComentario = prompt('Ingrese comentario:', comentario || '');
                                  if (nuevoComentario !== null) agregarComentario(item, nuevoComentario);
                                }}
                              >
                                <FaComment className={comentario ? 'text-info' : ''} />
                              </button>
                            </>
                          )}
                          <button
                            className="btn btn-sm p-0 text-danger"
                            onClick={() => setSeleccionados((prev) => prev.filter((i) => !isEqual(i, item)))}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>

                      {(etiqueta || comentario) && item.tipo !== 'etiqueta' && (
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
            ) : (
              <div className="text-muted small p-2">No hay elementos seleccionados</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App

import { Link } from "react-router-dom";
import "./navbar.css";

export const Navbar = () => {
  return (
    <div>
      <div className="container">
        <h1>Sistema de Gestion Tibu-Boxing-Club</h1>
      </div>
      <div className="navegacion">
        <ul>
          <li>
            <Link to="/">Inicio</Link>
          </li>
          <li>
            <Link to="/agregarCliente">Altas</Link>
          </li>
          <li>
            <Link to="/Buscarcliente">Buscar</Link>
          </li>
          <li>
            <Link to="/pagos">Pagos</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

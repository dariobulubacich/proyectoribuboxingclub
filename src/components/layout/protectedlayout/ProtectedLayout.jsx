import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { auth } from "../../../firebase"; // Importar Firebase auth
import { signOut } from "firebase/auth";
import "./proyectedlayout.css";
import Swal from "sweetalert2";

export function ProtectedLayout() {
  const navigate = useNavigate();

  // Función para cerrar sesión
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        Swal.fire("Sesion cerrada con exito");
        navigate("/"); // Redirigir al login después de cerrar sesión
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error);
      });
  };

  // Verificar si el usuario está autenticado
  const user = auth.currentUser;
  if (!user) {
    return <Navigate to="/" />; // Redirigir al login si no está autenticado
  }

  return (
    <div className="protected-layout">
      <h2>Sistema de Gestion Tibu Boxing Club</h2>
      <nav className="menu">
        <button onClick={() => navigate("/AgregarCliente")}>
          Agregar Cliente
        </button>
        <button onClick={() => navigate("/Buscarcliente")}>
          Buscar Cliente
        </button>
        <button onClick={() => navigate("/PagesClientes")}>
          Para Clientes
        </button>
        <button onClick={() => navigate("/ListarClientes")}>
          Listar Clientes
        </button>
        <button onClick={() => navigate("/IngresosMensuales")}>Resumen</button>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

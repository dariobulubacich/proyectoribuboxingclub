import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { auth } from "../../../firebase"; // Importar Firebase auth
import { signOut } from "firebase/auth";
import "./proyectedlayout.css";

export function ProtectedLayout() {
  const navigate = useNavigate();

  // Función para cerrar sesión
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        alert("Sesión cerrada exitosamente");
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
      <h2>Sistema de Gestion Tibu-Boxing-Club</h2>
      <nav className="menu">
        <button onClick={() => navigate("/AgregarCliente")}>
          Agregar Cliente
        </button>
        <button onClick={() => navigate("/Buscarcliente")}>
          Buscar Cliente
        </button>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Para redirigir al usuario
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../../firebase"; // Asegúrate de importar `auth` correctamente
// Opcional: Archivo para estilos personalizados

function Auth() {
  const [isLogin, setIsLogin] = useState(true); // Estado para alternar entre Login y Register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Hook para redirigir

  // Manejar el inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Inicio de sesión exitoso");
      navigate("/AgregarCliente"); // Redirige a la página deseada después de autenticarse
    } catch (error) {
      console.error("Error en el inicio de sesión: ", error.message);
      alert("Error: " + error.message);
    }
  };

  // Manejar el registro
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Usuario registrado exitosamente");
      navigate("/AgregarCliente"); // Redirige a la página deseada después del registro
    } catch (error) {
      console.error("Error en el registro: ", error.message);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>
      <form onSubmit={isLogin ? handleLogin : handleRegister}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">
          {isLogin ? "Iniciar Sesión" : "Registrarse"}
        </button>
      </form>
      <p>
        {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
        <button className="toggle-button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Regístrate" : "Inicia sesión"}
        </button>
      </p>
    </div>
  );
}

export default Auth;
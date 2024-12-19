import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Para redirigir al usuario
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../../firebase"; // Asegúrate de importar `auth` correctamente
import "./auth.css"; // Opcional: Archivo para estilos personalizados
import Swal from "sweetalert2";
import Grid from "@mui/material/Grid2";
import { Typography } from "@mui/material";

function Auth() {
  const [isLogin, setIsLogin] = useState(true); // Estado para alternar entre Login y Register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const navigate = useNavigate(); // Hook para redirigir

  // Manejar el inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // alert("Inicio de sesión exitoso");
      navigate("/AgregarCliente"); // Redirige a la página deseada después de autenticarse
    } catch {
      Swal.fire({
        icon: "error",
        title: "Usuario o contraseña incorrecto",
        text: "",
      });
    }
  };

  // Manejar el registro
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Usuario registrado exitosamente");
      navigate("/AgregarCliente"); // Redirige a la página deseada después del registro
    } catch {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
        footer: '<a href="#">Why do I have this issue?</a>',
      });
    }
  };

  return (
    <Grid container={true}>
      <Grid size={{ xs: 12 }}>
        <div className="auth-container">
          <Typography variant="h2">
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </Typography>
          <form onSubmit={isLogin ? handleLogin : handleRegister}>
            <input
              className="input-aut"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="password-container">
              <input
                className="input-aut"
                type={showPassword ? "text" : "password"} // Cambia el tipo de input
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="show-password-button"
                onClick={() => setShowPassword(!showPassword)} // Cambia el estado
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <button type="submit">
              {isLogin ? "Iniciar Sesión" : "Registrarse"}
            </button>
          </form>
          <p>
            {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
            <button
              className="toggle-button"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Regístrate" : "Inicia sesión"}
            </button>
          </p>
        </div>
      </Grid>
    </Grid>
  );
}

export default Auth;

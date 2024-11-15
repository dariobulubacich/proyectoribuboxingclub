import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import "./agregarcliente.css";
import Swal from "sweetalert2";

function AgregarCliente() {
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mesPago, setmesPago] = useState("");
  const [fechaPago, setfechaPago] = useState("");

  // Función para enviar los datos a Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "clientes"), {
        dni,
        nombre,
        apellido,
        email,
        telefono,
        mesPago,
        fechaPago,
      });
      Swal.fire({
        title: "Cliente agregado exitosamente",
        text: "",
        icon: "success",
      });

      setDni("");
      setNombre("");
      setApellido("");
      setEmail("");
      setTelefono("");
      setmesPago("");
      setfechaPago("");
    } catch (error) {
      console.error("Error al agregar el cliente: ", error);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        className="input"
        type="text"
        placeholder="Ingrese fecha"
        value={fechaPago}
        onChange={(e) => setfechaPago(e.target.value)}
        required
      />
      <input
        className="input"
        type="text"
        placeholder="DNI"
        value={dni}
        onChange={(e) => setDni(e.target.value)}
        required
      />
      <input
        className="input"
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <input
        className="input"
        type="text"
        placeholder="Apellido"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
        required
      />
      <input
        className="input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="input"
        type="tel"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        required
      />
      <input
        className="input"
        type="mespago"
        placeholder="Mes a abonar"
        value={mesPago}
        onChange={(e) => setmesPago(e.target.value)}
        required
      />
      <button type="submit" className="agregar-button">
        Agregar Cliente
      </button>
    </form>
  );
}

export default AgregarCliente;

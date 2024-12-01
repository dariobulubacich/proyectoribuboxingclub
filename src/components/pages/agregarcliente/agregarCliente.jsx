import { useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import Swal from "sweetalert2";
import "./agregarcliente.css";

function AgregarCliente() {
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mesPago, setmesPago] = useState("");
  const [fechaPago, setfechaPago] = useState("");
  const [clienteExistente, setClienteExistente] = useState(null);

  // Verificar si el cliente ya existe por DNI
  const verificarClienteExistente = async () => {
    const q = query(collection(db, "clientes"), where("dni", "==", dni));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const cliente = querySnapshot.docs[0];
      setClienteExistente({ id: cliente.id, ...cliente.data() });
      Swal.fire(
        "Cliente encontrado",
        "Puedes editar los datos del cliente.",
        "info"
      );
    } else {
      setClienteExistente(null);
    }
  };

  // Agregar o actualizar el cliente en Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (clienteExistente) {
        const clienteRef = doc(db, "clientes", clienteExistente.id);
        await updateDoc(clienteRef, {
          nombre,
          apellido,
          email,
          telefono,
          mesPago,
          fechaPago,
        });
        Swal.fire("Cliente actualizado exitosamente", "", "success");
      } else {
        await addDoc(collection(db, "clientes"), {
          dni,
          nombre,
          apellido,
          email,
          telefono,
          mesPago,
          fechaPago,
        });
        Swal.fire("Cliente agregado exitosamente", "", "success");
      }

      // Resetear formulario
      setDni("");
      setNombre("");
      setApellido("");
      setEmail("");
      setTelefono("");
      setmesPago("");
      setfechaPago("");
      setClienteExistente(null);
    } catch (error) {
      console.error("Error al agregar o actualizar el cliente: ", error);
      Swal.fire("Error", "No se pudo completar la operación", "error");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-containers">
        <input
          className="inputs"
          type="text"
          placeholder="Fecha de pago"
          value={fechaPago}
          onChange={(e) => setfechaPago(e.target.value)}
          required
        />
        <input
          className="inputs"
          type="text"
          placeholder="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          onBlur={verificarClienteExistente}
          required
        />
        <input
          className="inputs"
          type="text"
          placeholder="Nombre"
          value={clienteExistente ? clienteExistente.nombre : nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          className="inputs"
          type="text"
          placeholder="Apellido"
          value={clienteExistente ? clienteExistente.apellido : apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
        />
        <input
          className="inputs"
          type="email"
          placeholder="Email"
          value={clienteExistente ? clienteExistente.email : email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="inputs"
          type="tel"
          placeholder="Teléfono"
          value={clienteExistente ? clienteExistente.telefono : telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
        />
        <input
          className="inputs"
          type="text"
          placeholder="Mes a abonar"
          value={clienteExistente ? clienteExistente.mesPago : mesPago}
          onChange={(e) => setmesPago(e.target.value)}
          required
        />
      </div>
      <div className="div-agre-client">
        <button type="submit" className="agregar-button">
          {clienteExistente ? "Actualizar Cliente" : "Agregar Cliente"}
        </button>
      </div>
    </form>
  );
}

export default AgregarCliente;

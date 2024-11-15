import { useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import "./buscarcliente.css";
import Swal from "sweetalert2";

function BuscarCliente() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes, setClientes] = useState([]);
  const [mesesPagados, setMesesPagados] = useState({});
  const [cantidadPagada, setCantidadPagada] = useState({});
  const [editMode, setEditMode] = useState({});

  // Función para buscar clientes en Firestore
  const buscarClientes = async () => {
    try {
      const q = query(
        collection(db, "clientes"),
        where("dni", "==", searchTerm)
      );
      const querySnapshot = await getDocs(q);
      const result = [];
      querySnapshot.forEach((doc) => {
        result.push({ id: doc.id, ...doc.data() });
      });
      setClientes(result);
    } catch (error) {
      console.error("Error buscando clientes: ", error);
    }
  };

  // Función para registrar el pago de meses y monto en Firestore
  const registrarPago = async (clienteId) => {
    try {
      const clienteRef = doc(db, "clientes", clienteId);
      const clienteDoc = await getDoc(clienteRef);
      if (!clienteDoc.exists()) {
        Swal.fire("El cliente no existe");
        return;
      }

      const clienteData = clienteDoc.data();
      const meses = parseInt(mesesPagados[clienteId]);
      const monto = parseFloat(cantidadPagada[clienteId]);
      let fechaUltimoPago = clienteData.ultimoMesPago
        ? new Date(clienteData.ultimoMesPago)
        : new Date();

      fechaUltimoPago.setMonth(fechaUltimoPago.getMonth() + meses);
      const ultimoMesPago = fechaUltimoPago.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      await updateDoc(clienteRef, {
        mesesPagados: meses,
        cantidadPagada: monto,
        ultimoMesPago: ultimoMesPago,
        fechaPago: new Date().toLocaleDateString(),
      });
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Pago registrado exitosamente.",
        showConfirmButton: false,
        timer: 1500,
      });
      buscarClientes();
    } catch (error) {
      console.error("Error al registrar el pago: ", error);
      Swal.fire({
        icon: "error",
        title: "Hubo un error al registrar el pago. Inténtalo de nuevo.",
        text: "",
        footer: '<a href="#"></a>',
      });
    }
  };

  // Función para manejar el cambio de modo de edición para cada cliente
  const toggleEditMode = (clienteId) => {
    setEditMode((prev) => ({
      ...prev,
      [clienteId]: !prev[clienteId],
    }));
  };

  // Función para actualizar el estado con la cantidad de meses pagados por cliente
  const handleMesesPagadosChange = (clienteId, value) => {
    setMesesPagados((prev) => ({
      ...prev,
      [clienteId]: value,
    }));
  };

  // Función para actualizar el estado con la cantidad pagada por cliente
  const handleCantidadPagadaChange = (clienteId, value) => {
    setCantidadPagada((prev) => ({
      ...prev,
      [clienteId]: value,
    }));
  };

  return (
    <div>
      <div className="h2">
        <h2>Buscar Cliente</h2>
      </div>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por DNI"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="button" onClick={buscarClientes}>
          Buscar
        </button>

        <div className="results-container">
          {clientes.length > 0 ? (
            <ul className="results-list">
              {clientes.map((cliente) => (
                <li className="result-item" key={cliente.id}>
                  <strong>
                    {cliente.nombre} {cliente.apellido}
                  </strong>
                  <br />
                  DNI: {cliente.dni}
                  <br />
                  Email:{" "}
                  {editMode[cliente.id] ? (
                    <input
                      type="text"
                      defaultValue={cliente.email}
                      onChange={(e) =>
                        setClientes((prev) =>
                          prev.map((c) =>
                            c.id === cliente.id
                              ? { ...c, email: e.target.value }
                              : c
                          )
                        )
                      }
                    />
                  ) : (
                    cliente.email
                  )}
                  <br />
                  Teléfono:{" "}
                  {editMode[cliente.id] ? (
                    <input
                      type="text"
                      defaultValue={cliente.telefono}
                      onChange={(e) =>
                        setClientes((prev) =>
                          prev.map((c) =>
                            c.id === cliente.id
                              ? { ...c, telefono: e.target.value }
                              : c
                          )
                        )
                      }
                    />
                  ) : (
                    cliente.telefono
                  )}
                  <br />
                  Último Mes de Pago:{" "}
                  {cliente.ultimoMesPago ? cliente.ultimoMesPago : "N/A"}
                  <br />
                  Fecha de Pago: {cliente.fechaPago ? cliente.fechaPago : "N/A"}
                  <br />
                  <input
                    type="number"
                    className="meses-input"
                    placeholder="Cuanto meses abona"
                    value={mesesPagados[cliente.id] || ""}
                    onChange={(e) =>
                      handleMesesPagadosChange(cliente.id, e.target.value)
                    }
                  />
                  <input
                    type="number"
                    className="cantidad-input"
                    placeholder="Monto Abonado"
                    value={cantidadPagada[cliente.id] || ""}
                    onChange={(e) =>
                      handleCantidadPagadaChange(cliente.id, e.target.value)
                    }
                  />
                  <div className="div-button">
                    <button
                      className="button"
                      onClick={() => registrarPago(cliente.id)}
                    >
                      Registrar Pago
                    </button>
                    <button
                      className="button"
                      onClick={() => toggleEditMode(cliente.id)}
                    >
                      {editMode[cliente.id] ? "Guardar Cambios" : "Modificar"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-results">No se encontraron clientes.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BuscarCliente;

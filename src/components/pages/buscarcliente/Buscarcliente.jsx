import { useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import "./buscarcliente.css";
import Swal from "sweetalert2";

function BuscarCliente() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes, setClientes] = useState([]);
  const [mesesPagados, setMesesPagados] = useState({});
  const [cantidadPagada, setCantidadPagada] = useState({});
  const [historialPagos, setHistorialPagos] = useState({});
  const [ultimoMesConPago, setUltimoMesConPago] = useState({});

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

  const registrarPago = async (clienteId) => {
    try {
      const clienteRef = doc(db, "clientes", clienteId);
      const meses = parseInt(mesesPagados[clienteId]);
      const monto = parseFloat(cantidadPagada[clienteId]);

      if (
        !meses ||
        !monto ||
        isNaN(meses) ||
        isNaN(monto) ||
        meses <= 0 ||
        monto <= 0
      ) {
        Swal.fire("Por favor, introduce valores válidos para meses y monto.");
        return;
      }

      const clienteSnapshot = await getDoc(clienteRef);
      if (!clienteSnapshot.exists()) {
        Swal.fire("El cliente no existe.");
        return;
      }

      const clienteData = clienteSnapshot.data();
      const mesesTotales = clienteData.mesesPagadosTotales || 0;
      const ultimoMesPago = clienteData.ultimoMesPago;

      // Convertir último mes de pago a fecha (si existe)
      let fechaUltimoMes = ultimoMesPago
        ? new Date(
            ultimoMesPago.split("-")[2], // Año
            ultimoMesPago.split("-")[1] - 1, // Mes (base 0)
            1 // Día (asumimos el primero del mes)
          )
        : new Date();

      // Sumar meses abonados
      fechaUltimoMes.setMonth(fechaUltimoMes.getMonth() + meses);

      // Obtener el nuevo mes como string
      const nuevoMesPago = `${fechaUltimoMes
        .getDate()
        .toString()
        .padStart(2, "0")}-${(fechaUltimoMes.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${fechaUltimoMes.getFullYear()}`;

      const nuevoPago = {
        mesesPagados: meses,
        cantidadPagada: monto,
        fechaPago: nuevoMesPago,
        timestamp: new Date(),
      };

      // Actualizar cliente con el último mes de pago y meses acumulados
      await updateDoc(clienteRef, {
        ultimoMesPago: nuevoMesPago,
        mesesPagadosTotales: mesesTotales + meses,
      });

      // Agregar el pago a la subcolección "pagos"
      const pagosRef = collection(clienteRef, "pagos");
      await addDoc(pagosRef, nuevoPago);

      // Recargar los datos del cliente
      const clienteActualizado = await getDoc(clienteRef);
      setClientes((prevClientes) =>
        prevClientes.map((cliente) =>
          cliente.id === clienteId
            ? { id: clienteId, ...clienteActualizado.data() }
            : cliente
        )
      );

      // Actualizar último mes con pago (última fecha de pago)
      setUltimoMesConPago((prev) => ({
        ...prev,
        [clienteId]: nuevoPago.fechaPago, // Actualizamos con la nueva fecha de pago
      }));

      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Pago registrado exitosamente.",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error al registrar el pago: ", error.message);
      Swal.fire({
        icon: "error",
        title: "Hubo un error al registrar el pago",
        text: error.message,
      });
    }
  };

  const cargarPagos = async (clienteId) => {
    try {
      const pagosRef = collection(db, `clientes/${clienteId}/pagos`);
      const pagosSnapshot = await getDocs(pagosRef);
      const pagos = [];
      pagosSnapshot.forEach((doc) => {
        pagos.push({ id: doc.id, ...doc.data() });
      });

      // Ordenar los pagos por fecha (más recientes primero)
      pagos.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

      // Obtener el último mes con pago
      const ultimoPago = pagos.length > 0 ? pagos[0] : null;

      // Actualizar los estados
      setHistorialPagos((prev) => ({
        ...prev,
        [clienteId]: pagos,
      }));

      if (ultimoPago) {
        setUltimoMesConPago((prev) => ({
          ...prev,
          [clienteId]: ultimoPago.timestamp
            .toDate()
            .toLocaleDateString("es-ES"), // Formato legible
        }));
      }
    } catch (error) {
      console.error("Error al cargar historial de pagos: ", error);
    }
  };

  const handleMesesPagadosChange = (clienteId, value) => {
    setMesesPagados((prev) => ({
      ...prev,
      [clienteId]: value,
    }));
  };

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
          className="search-input"
          type="text"
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
                  Último Mes de Pago:{" "}
                  {cliente.ultimoMesPago ? cliente.ultimoMesPago : "N/A"}
                  <br />
                  Última Fecha de Pago: {ultimoMesConPago[cliente.id] || "N/A"}
                  <br />
                  <button
                    className="button"
                    onClick={() => cargarPagos(cliente.id)}
                  >
                    Ver Historial de Pagos
                  </button>
                  {historialPagos[cliente.id] && (
                    <ul className="pagos-list">
                      {historialPagos[cliente.id].map((pago) => (
                        <li key={pago.id}>
                          Meses Pagados: {pago.mesesPagados}, Monto:{" "}
                          {pago.cantidadPagada}, Fecha: {pago.fechaPago}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="div inputs-var">
                    <input
                      className="input-buscar-client"
                      type="number"
                      placeholder="Cuanto meses abona"
                      value={mesesPagados[cliente.id] || ""}
                      onChange={(e) =>
                        handleMesesPagadosChange(cliente.id, e.target.value)
                      }
                    />
                    <input
                      className="input-buscar-client"
                      type="number"
                      placeholder="Monto Abonado"
                      value={cantidadPagada[cliente.id] || ""}
                      onChange={(e) =>
                        handleCantidadPagadaChange(cliente.id, e.target.value)
                      }
                    />
                  </div>
                  <div className="div-button">
                    <button
                      className="button"
                      onClick={() => registrarPago(cliente.id)}
                    >
                      Registrar Pago
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

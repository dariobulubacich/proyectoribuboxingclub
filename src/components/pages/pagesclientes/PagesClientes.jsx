import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";

function BuscarCliente() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cliente, setCliente] = useState(null); // Un solo cliente
  const [ultimoPago, setUltimoPago] = useState(null); // Última cuota pagada

  // Función para buscar cliente por DNI
  const buscarClientePorDNI = async (dni) => {
    try {
      const q = query(collection(db, "clientes"), where("dni", "==", dni));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const clienteDoc = querySnapshot.docs[0];
        const clienteData = { id: clienteDoc.id, ...clienteDoc.data() };

        // Obtener el historial de pagos
        const pagosRef = collection(db, `clientes/${clienteDoc.id}/pagos`);
        const pagosSnapshot = await getDocs(pagosRef);

        let pagos = [];
        pagosSnapshot.forEach((doc) => {
          pagos.push({ id: doc.id, ...doc.data() });
        });

        // Ordenar pagos por fecha (más recientes primero)
        pagos.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

        // Actualizar estados
        setCliente(clienteData);
        setUltimoPago(pagos[0] || null);
      } else {
        setCliente(null);
        setUltimoPago(null);
      }
    } catch (error) {
      console.error("Error buscando cliente: ", error);
    }
  };

  // UseEffect para buscar cliente cuando el DNI cambia
  useEffect(() => {
    if (searchTerm) {
      const delayDebounce = setTimeout(() => {
        buscarClientePorDNI(searchTerm);
      }, 500); // Retraso para evitar llamadas excesivas
      return () => clearTimeout(delayDebounce);
    } else {
      setCliente(null);
      setUltimoPago(null);
    }
  }, [searchTerm]);

  return (
    <div>
      <div className="h2">
        <h2>Buscar Cliente</h2>
      </div>
      <div className="search-container">
        <input
          className="search-input"
          type="text"
          placeholder="Ingrese DNI"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="results-container">
        {cliente ? (
          <div className="client-info">
            <strong>
              {cliente.nombre} {cliente.apellido}
            </strong>
            <br />
            DNI: {cliente.dni}
            <br />
            Último Mes de Pago:{" "}
            {ultimoPago ? ultimoPago.fechaPago : "No hay pagos registrados"}
            <br />
            Última Fecha de Pago:{" "}
            {ultimoPago
              ? new Date(ultimoPago.timestamp.toDate()).toLocaleDateString(
                  "es-ES"
                )
              : "N/A"}
          </div>
        ) : searchTerm ? (
          <p className="no-results">No se encontró ningún cliente.</p>
        ) : (
          <p className="no-results">Por favor, ingrese un DNI.</p>
        )}
      </div>
    </div>
  );
}

export default BuscarCliente;
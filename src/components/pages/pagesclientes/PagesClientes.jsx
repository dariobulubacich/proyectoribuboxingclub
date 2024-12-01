import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import "./pagesclientes.css";

function BuscarCliente() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cliente, setCliente] = useState(null);
  const [ultimoPago, setUltimoPago] = useState(null);
  const [timer, setTimer] = useState(null);

  // Función para buscar cliente por DNI
  const buscarClientePorDNI = async (dni) => {
    try {
      const q = query(collection(db, "clientes"), where("dni", "==", dni));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const clienteDoc = querySnapshot.docs[0];
        const clienteData = { id: clienteDoc.id, ...clienteDoc.data() };

        const pagosRef = collection(db, `clientes/${clienteDoc.id}/pagos`);
        const pagosSnapshot = await getDocs(pagosRef);

        let pagos = [];
        pagosSnapshot.forEach((doc) => {
          pagos.push({ id: doc.id, ...doc.data() });
        });

        pagos.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

        setCliente(clienteData);
        setUltimoPago(pagos[0] || null);

        // Iniciar temporizador para limpiar después de 20 segundos
        if (timer) clearTimeout(timer);
        setTimer(setTimeout(() => limpiarPantalla(), 20000));
      } else {
        limpiarPantalla();
      }
    } catch (error) {
      console.error("Error buscando cliente: ", error);
    }
  };

  // Limpiar pantalla
  const limpiarPantalla = () => {
    setCliente(null);
    setUltimoPago(null);
    setSearchTerm("");
  };

  useEffect(() => {
    if (searchTerm) {
      const delayDebounce = setTimeout(() => {
        buscarClientePorDNI(searchTerm);
      }, 1500);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchTerm]);

  return (
    <div>
      <h2>Buscar Cliente</h2>
      <div className="search-container">
        <input
          className="search-input"
          type="number"
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

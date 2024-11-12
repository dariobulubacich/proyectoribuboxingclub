import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase"; // Asegúrate de tener el archivo firebase.js configurado correctamente
import "./buscarcliente.css";

function BuscarCliente() {
  const [searchTerm, setSearchTerm] = useState(""); // Para almacenar el término de búsqueda
  const [clientes, setClientes] = useState([]); // Para almacenar los resultados de la búsqueda

  // Función para buscar clientes en Firestore
  const buscarClientes = async () => {
    try {
      // Consulta con el término de búsqueda
      const q = query(
        collection(db, "clientes"),
        where("dni", "==", searchTerm) // Buscamos clientes por DNI
      );
      const querySnapshot = await getDocs(q);
      const result = [];
      querySnapshot.forEach((doc) => {
        result.push({ id: doc.id, ...doc.data() });
      });
      setClientes(result); // Guardamos los resultados
    } catch (error) {
      console.error("Error buscando clientes: ", error);
    }
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
        <button className="search-button" onClick={buscarClientes}>
          Buscar
        </button>

        <div className="results-container">
          {clientes.length > 0 ? (
            <ul className="results-list">
              {clientes.map((cliente) => (
                <li className="result-item" key={cliente.id}>
                  <strong>
                    Nombre y Apellido: {cliente.nombre} {cliente.apellido}
                  </strong>
                  <br />
                  DNI: {cliente.dni}
                  <br />
                  Email: {cliente.email}
                  <br />
                  Teléfono: {cliente.telefono}
                  <br />
                  Mes de Pago: {cliente.mesPago ? cliente.mesPago : "N/A"}
                  <br />
                  Fecha de Pago: {cliente.fechaPago ? cliente.fechaPago : "N/A"}
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

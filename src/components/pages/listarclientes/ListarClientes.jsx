import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import * as XLSX from "xlsx"; // Importa la biblioteca XLSX
import "./listarClientes.css";

function ListarClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener clientes desde Firestore
  const fetchClientes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const clientesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientes(clientesList);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Función para exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(clientes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    XLSX.writeFile(workbook, "ListadoClientes.xlsx");
  };

  // Función para imprimir
  const printTable = () => {
    const printContents = document.getElementById("clientesTable").outerHTML;
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(
      "<html><head><title>Listado de Clientes</title></head><body>"
    );
    printWindow.document.write(printContents);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return <p>Cargando clientes...</p>;
  }

  return (
    <div className="listar-clientes">
      <h2>Listado de Clientes</h2>
      {clientes.length === 0 ? (
        <p>No hay clientes registrados.</p>
      ) : (
        <>
          <div className="actions">
            <button onClick={exportToExcel}>Exportar a Excel</button>
            <button onClick={printTable}>Imprimir</button>
          </div>
          <table id="clientesTable" className="clientes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Último Mes de Pago</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nombre}</td>
                  <td>{cliente.apellido}</td>
                  <td>{cliente.dni}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente.telefono}</td>
                  <td>
                    {cliente.ultimoMesPago
                      ? cliente.ultimoMesPago
                      : "No registrado"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default ListarClientes;

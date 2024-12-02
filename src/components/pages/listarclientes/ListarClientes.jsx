import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import * as XLSX from "xlsx"; // Importa la biblioteca XLSX
import "./listarClientes.css";
//import { products } from "../../../products";

function ListarClientes() {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("apellido");

  // Función para obtener clientes desde Firestore
  const fetchClientes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const clientesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientes(clientesList);
      setFilteredClientes(clientesList); // Inicialmente, mostrar todos los clientes
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Filtrar clientes cuando cambia el término de búsqueda o el criterio de filtro
  useEffect(() => {
    const filterClientes = () => {
      const term = searchTerm.toLowerCase();
      const filtered = clientes.filter((cliente) => {
        if (filterBy === "apellido") {
          return cliente.apellido?.toLowerCase().includes(term);
        } else if (filterBy === "dni") {
          return cliente.dni?.toString().includes(term);
        } else if (filterBy === "MesPago") {
          return cliente.ultimoMesPago?.toLowerCase().includes(term);
        }
        return true;
      });
      setFilteredClientes(filtered);
    };

    filterClientes();
  }, [searchTerm, filterBy, clientes]);

  // Función para exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredClientes);
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
  //agregar clientes en forma masiva
  // const funcionParaAgregar = () => {
  //   const productsCollection = collection(db, "clientes");

  //   products.forEach((product) => {
  //     addDoc(productsCollection, product);
  //   });
  // };

  return (
    <div className="listar-clientes">
      <h2>Listado de Clientes</h2>
      {clientes.length === 0 ? (
        <p>No hay clientes registrados.</p>
      ) : (
        <>
          <div className="actions">
            <div>
              <select
                className="input"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <option value="apellido">Apellido</option>
                <option value="dni">DNI</option>
                <option value="MesPago">Último Mes de Pago</option>
              </select>
              <input
                className="input"
                type="text"
                placeholder={`Buscar por ${filterBy}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="button-exp-imp">
            <button className="button-export" onClick={exportToExcel}>
              Exportar a Excel
            </button>
            <button className="button-export" onClick={printTable}>
              Imprimir
            </button>
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
              {filteredClientes.map((cliente) => (
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
      {/* <button className="button" onClick={funcionParaAgregar}>
        Cargar clientes masivos
      </button> */}
    </div>
  );
}

export default ListarClientes;

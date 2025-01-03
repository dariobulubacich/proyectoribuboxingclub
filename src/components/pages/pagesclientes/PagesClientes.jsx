import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import "./pagesclientes.css";

function BuscarCliente() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cliente, setCliente] = useState(null);
  const [ultimoPago, setUltimoPago] = useState(null);
  const [mesesDeuda, setMesesDeuda] = useState(0);
  const [timer, setTimer] = useState(null);

  // Función para convertir una fecha en formato dd/mm/yyyy a un objeto Date
  const convertirFecha = (fechaString) => {
    const [dia, mes, anio] = fechaString.split("/").map(Number);
    return new Date(anio, mes - 1, dia); // Meses en JavaScript son base 0
  };

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

        pagos.sort(
          (a, b) => convertirFecha(b.fechaPago) - convertirFecha(a.fechaPago) // Ordenar por fecha
        );

        setCliente(clienteData);
        const ultimoPagoRealizado = pagos[0] || null;
        setUltimoPago(ultimoPagoRealizado);

        if (ultimoPagoRealizado) {
          const fechaUltimoPago = convertirFecha(ultimoPagoRealizado.fechaPago);
          const fechaActual = new Date(); // Fecha actual para la comparación

          // Calcular la diferencia en meses
          const diferenciaMeses =
            (fechaActual.getFullYear() - fechaUltimoPago.getFullYear()) * 12 +
            fechaActual.getMonth() -
            fechaUltimoPago.getMonth();

          // Ajustar diferencia si el día actual es menor al del último pago
          setMesesDeuda(
            fechaActual.getDate() < fechaUltimoPago.getDate()
              ? diferenciaMeses - 1
              : diferenciaMeses
          );
        } else {
          // Caso en el que no hay pagos registrados
          setMesesDeuda(new Date().getMonth() + 1);
        }

        if (timer) clearTimeout(timer);
        setTimer(setTimeout(() => limpiarPantalla(), 10000));
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
    setMesesDeuda(0);
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
      <h2>Buscar Pagos</h2>
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
            {mesesDeuda === 0 ? (
              <p className="sin-deuda">✅ Este cliente está al día.</p>
            ) : (
              <p className="deuda-alerta">
                ⚠️ Este cliente tiene deuda de {mesesDeuda}{" "}
                {mesesDeuda === 1 ? "mes" : "meses"}.
              </p>
            )}
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
            <br />
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

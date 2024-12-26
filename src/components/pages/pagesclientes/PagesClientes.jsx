import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import "./pagesclientes.css";

function BuscarCliente() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cliente, setCliente] = useState(null);
  const [ultimoPago, setUltimoPago] = useState(null);
  const [tieneDeuda, setTieneDeuda] = useState(false); // Estado para manejar la deuda
  const [mesesDeuda, setMesesDeuda] = useState(0); // Estado para manejar los meses de deuda
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
        const ultimoPagoRealizado = pagos[0] || null;
        setUltimoPago(ultimoPagoRealizado);

        // Verificar si hay deuda
        if (ultimoPagoRealizado) {
          const fechaUltimoPago = new Date(
            ultimoPagoRealizado.fechaPago.split("-").reverse().join("-")
          ); // Convertir fecha al formato adecuado
          const fechaActual = new Date();
          fechaActual.setDate(1); // Solo comparamos el mes y año actual

          if (fechaUltimoPago < fechaActual) {
            setTieneDeuda(true);

            // Calcular meses de deuda
            const diferenciaMeses =
              (fechaActual.getFullYear() - fechaUltimoPago.getFullYear()) * 12 +
              (fechaActual.getMonth() - fechaUltimoPago.getMonth());
            setMesesDeuda(diferenciaMeses);
          } else {
            setTieneDeuda(false);
            setMesesDeuda(0);
          }
        } else {
          setTieneDeuda(true);
          setMesesDeuda(new Date().getMonth() + 1); // Si no hay pagos registrados, deuda desde enero
        }

        // Iniciar temporizador para limpiar después de 20 segundos
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
    setTieneDeuda(false);
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
            {tieneDeuda ? (
              <p className="deuda-alerta">
                ⚠️ Este cliente tiene deuda de {mesesDeuda}{" "}
                {mesesDeuda === 1 ? "mes" : "meses"}.
              </p>
            ) : (
              <p className="sin-deuda">✅ Este cliente está al día.</p>
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

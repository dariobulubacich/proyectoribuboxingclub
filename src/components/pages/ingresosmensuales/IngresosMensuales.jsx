import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import "./ingresosMensuales.css";

function IngresosMensuales() {
  const [ingresosPorMes, setIngresosPorMes] = useState([]); // Todos los ingresos
  const [ingresosFiltrados, setIngresosFiltrados] = useState([]); // Ingresos después del filtro
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState(""); // Filtro de mes (mm-yyyy)

  // Función para calcular los ingresos por mes
  const calcularIngresosPorMes = async () => {
    try {
      const clientesSnapshot = await getDocs(collection(db, "clientes"));
      const pagosPromises = clientesSnapshot.docs.map(async (clienteDoc) => {
        const pagosRef = collection(db, `clientes/${clienteDoc.id}/pagos`);
        const pagosSnapshot = await getDocs(pagosRef);
        return pagosSnapshot.docs.map((doc) => doc.data());
      });

      const pagosPorCliente = await Promise.all(pagosPromises);
      const todosLosPagos = pagosPorCliente.flat();

      // Agrupar pagos por mes
      const ingresos = todosLosPagos.reduce((acumulado, pago) => {
        const fechaPago = pago.timestamp.toDate();
        const mes = `${fechaPago.getFullYear()}-${(fechaPago.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`; // Formato: yyyy-mm

        if (!acumulado[mes]) {
          acumulado[mes] = 0;
        }
        acumulado[mes] += parseFloat(pago.cantidadPagada);

        return acumulado;
      }, {});

      // Convertir a un array de objetos para mostrar en la tabla
      const ingresosArray = Object.entries(ingresos).map(([mes, monto]) => ({
        mes,
        monto,
      }));

      setIngresosPorMes(ingresosArray);
      setIngresosFiltrados(ingresosArray); // Mostrar todos los datos inicialmente
      setLoading(false);
    } catch (error) {
      console.error("Error al calcular ingresos por mes: ", error);
      setLoading(false);
    }
  };

  // Función para filtrar ingresos por el mes seleccionado
  const filtrarPorMes = (mes) => {
    setMesSeleccionado(mes); // Actualizar el mes seleccionado
    if (mes === "") {
      // Si no hay mes seleccionado, mostrar todos los datos
      setIngresosFiltrados(ingresosPorMes);
    } else {
      // Filtrar por el mes seleccionado
      const filtrados = ingresosPorMes.filter((ingreso) => ingreso.mes === mes);
      setIngresosFiltrados(filtrados);
    }
  };

  useEffect(() => {
    calcularIngresosPorMes();
  }, []);

  if (loading) {
    return <p>Cargando ingresos...</p>;
  }

  return (
    <div className="ingresos-mensuales">
      <h2>Ingresos por Mes</h2>

      <div className="filtro-container">
        <label htmlFor="filtro-mes">Filtrar por mes:</label>
        <input
          type="month"
          id="filtro-mes"
          value={mesSeleccionado}
          onChange={(e) => filtrarPorMes(e.target.value)}
        />
      </div>

      {ingresosFiltrados.length === 0 ? (
        <p>No se registraron ingresos para el mes seleccionado.</p>
      ) : (
        <table className="ingresos-table">
          <thead>
            <tr>
              <th>Mes</th>
              <th>Monto Total Cobrado</th>
            </tr>
          </thead>
          <tbody>
            {ingresosFiltrados.map(({ mes, monto }) => (
              <tr key={mes}>
                <td>{mes}</td>
                <td>${monto.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default IngresosMensuales;

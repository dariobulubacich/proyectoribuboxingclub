import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import * as XLSX from "xlsx"; // Importar biblioteca XLSX
import "./ingresosMensuales.css";

function IngresosMensuales() {
  const [ingresosPorMes, setIngresosPorMes] = useState([]); // Todos los ingresos
  const [ingresosFiltrados, setIngresosFiltrados] = useState([]); // Ingresos después del filtro
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState(""); // Filtro de mes (mm-yyyy)

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

  const filtrarPorMes = (mes) => {
    setMesSeleccionado(mes);
    if (mes === "") {
      setIngresosFiltrados(ingresosPorMes);
    } else {
      const filtrados = ingresosPorMes.filter((ingreso) => ingreso.mes === mes);
      setIngresosFiltrados(filtrados);
    }
  };

  const handlePrint = () => {
    window.print(); // Inicia la impresión de la página
  };

  const exportarExcel = () => {
    const datos = ingresosFiltrados.map((ingreso) => ({
      Mes: ingreso.mes,
      "Monto Total Cobrado": ingreso.monto.toFixed(2),
    }));

    // Crear un libro de trabajo (workbook) y una hoja (worksheet)
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ingresos");

    // Generar el archivo Excel y descargarlo
    XLSX.writeFile(workbook, "IngresosMensuales.xlsx");
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
        <label className="filtrar-mes" htmlFor="filtro-mes">
          Filtrar por mes:
        </label>
        <input
          className="input-ing-men"
          type="month"
          id="filtro-mes"
          value={mesSeleccionado}
          onChange={(e) => filtrarPorMes(e.target.value)}
        />
        <button className="label-var" onClick={handlePrint}>
          Imprimir
        </button>
        <button className="label-var" onClick={exportarExcel}>
          Exportar a Excel
        </button>
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

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import * as XLSX from "xlsx";
import "./ingresosMensuales.css";

function IngresosMensuales() {
  const [ingresosPorMes, setIngresosPorMes] = useState([]);
  const [egresosPorMes, setEgresosPorMes] = useState([]);
  const [totalesMensuales, setTotalesMensuales] = useState([]);
  const [ingresosFiltrados, setIngresosFiltrados] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [loading, setLoading] = useState(true);
  const [nuevoEgreso, setNuevoEgreso] = useState({
    fecha: "",
    monto: 0,
    descripcion: "",
  });

  // Obtener ingresos desde Firestore
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

      const ingresos = todosLosPagos.reduce((acumulado, pago) => {
        const fechaPago = new Date();
        const mes = `${fechaPago.getFullYear()}-${(fechaPago.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;

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
    } catch (error) {
      console.error("Error al calcular ingresos: ", error);
    }
  };

  // Obtener egresos desde Firestore
  const calcularEgresosPorMes = async () => {
    try {
      const egresosSnapshot = await getDocs(collection(db, "egresos"));
      const egresos = {};

      egresosSnapshot.forEach((doc) => {
        const { fecha, monto, descripcion } = doc.data();
        const fechaObj = new Date(fecha);
        const mes = `${fechaObj.getFullYear()}-${(fechaObj.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;

        if (!egresos[mes]) {
          egresos[mes] = { monto: 0, descripcion: [] };
        }
        egresos[mes].monto += parseFloat(monto);
        egresos[mes].descripcion.push(
          `${descripcion} (${fechaObj.toLocaleDateString()})`
        );
      });

      const egresosArray = Object.entries(egresos).map(([mes, data]) => ({
        mes,
        monto: data.monto,
        descripcion: data.descripcion.join(", "),
      }));

      setEgresosPorMes(egresosArray);
    } catch (error) {
      console.error("Error al calcular egresos: ", error);
    }
  };

  // Calcular totales mensuales (ingresos - egresos)
  const calcularTotalesMensuales = () => {
    const meses = new Set([
      ...ingresosPorMes.map((i) => i.mes),
      ...egresosPorMes.map((e) => e.mes),
    ]);

    const totales = Array.from(meses).map((mes) => {
      const ingreso = ingresosPorMes.find((i) => i.mes === mes)?.monto || 0;
      const egreso = egresosPorMes.find((e) => e.mes === mes)?.monto || 0;
      const descripcion =
        egresosPorMes.find((e) => e.mes === mes)?.descripcion || "";
      return {
        mes,
        ingreso,
        egreso,
        descripcion,
        total: ingreso - egreso,
      };
    });

    setTotalesMensuales(totales);
    setIngresosFiltrados(totales);
  };

  // Agregar nuevo egreso
  const agregarEgreso = async () => {
    try {
      if (
        !nuevoEgreso.fecha ||
        !nuevoEgreso.monto ||
        !nuevoEgreso.descripcion
      ) {
        alert("Debes ingresar una fecha, monto y descripción válidos.");
        return;
      }

      await addDoc(collection(db, "egresos"), {
        fecha: nuevoEgreso.fecha,
        monto: parseFloat(nuevoEgreso.monto),
        descripcion: nuevoEgreso.descripcion,
      });

      setNuevoEgreso({ fecha: "", monto: 0, descripcion: "" });
      calcularEgresosPorMes(); // Actualizar egresos
    } catch (error) {
      console.error("Error al agregar egreso: ", error);
    }
  };

  // Exportar datos a Excel
  const exportarExcel = () => {
    const datos = totalesMensuales.map(({ mes, ingreso, egreso, total }) => ({
      Mes: mes,
      Ingresos: ingreso.toFixed(2),
      Egresos: egreso.toFixed(2),
      Total: total.toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TotalesMensuales");

    XLSX.writeFile(workbook, "TotalesMensuales.xlsx");
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      await calcularIngresosPorMes();
      await calcularEgresosPorMes();
      setLoading(false);
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    calcularTotalesMensuales();
  }, [ingresosPorMes, egresosPorMes]);

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div className="ingresos-mensuales">
      <h2>Totales Mensuales</h2>

      <div className="filtro-container">
        <label>Filtrar por mes:</label>
        <input
          type="month"
          value={mesSeleccionado}
          onChange={(e) => setMesSeleccionado(e.target.value)}
        />
        <button className="exportar" onClick={() => exportarExcel()}>
          Exportar a Excel
        </button>
      </div>

      <div className="egreso-form">
        <h3>Registrar Egreso</h3>
        <div className="div-registrar">
          <input
            type="date"
            value={nuevoEgreso.fecha}
            onChange={(e) =>
              setNuevoEgreso((prev) => ({ ...prev, fecha: e.target.value }))
            }
          />
        </div>
        <input
          type="number"
          placeholder="Monto"
          value={nuevoEgreso.monto}
          onChange={(e) =>
            setNuevoEgreso((prev) => ({ ...prev, monto: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Descripción"
          value={nuevoEgreso.descripcion}
          onChange={(e) =>
            setNuevoEgreso((prev) => ({ ...prev, descripcion: e.target.value }))
          }
        />
        <button className="exportar" onClick={agregarEgreso}>
          Agregar Egreso
        </button>
      </div>

      {ingresosFiltrados.length === 0 ? (
        <p>No hay datos para el mes seleccionado.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Ingresos</th>
              <th>Egresos</th>
              <th>Descripción de Egresos</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {ingresosFiltrados.map(
              ({ mes, ingreso, egreso, descripcion, total }) => (
                <tr key={mes}>
                  <td>{mes}</td>
                  <td>${ingreso.toFixed(2)}</td>
                  <td>${egreso.toFixed(2)}</td>
                  <td>{descripcion}</td>
                  <td>${total.toFixed(2)}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default IngresosMensuales;

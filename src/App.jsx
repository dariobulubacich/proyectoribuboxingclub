import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./components/pages/auth/Auth"; // Componente de Login/Register
import AgregarCliente from "./components/pages/agregarcliente/agregarCliente";
import BuscarCliente from "./components/pages/buscarcliente/Buscarcliente";
import { ProtectedLayout } from "./components/layout/protectedlayout/ProtectedLayout";
import ListarClientes from "./components/pages/listarclientes/ListarClientes";
import IngresosMensuales from "./components/pages/ingresosmensuales/IngresosMensuales";
import PagesClientes from "./components/pages/pagesclientes/PagesClientes";
// Layout Protegido

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/AgregarCliente" element={<AgregarCliente />} />
          <Route path="/Buscarcliente" element={<BuscarCliente />} />
          <Route path="/PagesClientes" element={<PagesClientes />} />
          <Route path="/ListarClientes" element={<ListarClientes />} />
          <Route path="/IngresosMensuales" element={<IngresosMensuales />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/NavBar";

import AgregarCliente from "./components/pages/agregarcliente/agregarCliente";
import BuscarCliente from "./components/pages/buscarcliente/Buscarcliente";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/AgregarCliente" element={<AgregarCliente />} />
        <Route path="/Buscarcliente" element={<BuscarCliente />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

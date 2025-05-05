
import { Route, Routes } from "react-router-dom";
import "./App.css";

import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import Invoices from "./pages/Invoices";
import Invoicing from "./pages/Invoicing";
import CompanyProfile from "./pages/CompanyProfile";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="App flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoicing" element={<Invoicing />} />
          <Route path="/profile" element={<CompanyProfile />} />
        </Routes>
        <Toaster />
      </div>
    </div>
  );
}

export default App;

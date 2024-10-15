import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/routes/home";
import SideBar from "./components/sidebar";
import SidebarItem from "./components/sidebaritem";
import { invoke } from "@tauri-apps/api/core";
import { RiDeleteBin2Line, RiEditLine, RiExportLine, RiImageLine, RiImportLine, RiPaletteLine, RiPhoneLine, RiSave2Line } from "react-icons/ri";
import AddItem from "./components/routes/addItem";
import AddSections from "./components/routes/addSection";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>
  },
  {
    path: "addItem/:id?",
    element: <AddItem/>
  },
  {
    path: "editSection/:id?",
    element: <AddSections/>
  }
])

function App() {

  const menu = []

  return (
    <div className="h-full w-full">
      <SideBar>
        <SidebarItem onClick={() => {invoke("greet", {name: "Jocka"})}} icon={ <RiEditLine/> } text={"Editar nome"}/>
        <SidebarItem icon={ <RiImageLine/> } text={"Editar imagem"}/>
        <SidebarItem icon={ <RiPaletteLine/> } text={"Editar Paleta"}/>
        <SidebarItem icon={ <RiPhoneLine/> } text={"Editar Número"}/>
        <SidebarItem icon={ <RiImportLine/> } text={"Importar Catálogo"}/>
        <SidebarItem icon={ <RiExportLine/> } text={"Exportar Catálogo"}/>
        <SidebarItem icon={ <RiSave2Line/> } text={"Onde salvar"}/>
        <SidebarItem icon={ <RiDeleteBin2Line/> } text={"Deletar Catálogo"}/>
      </SideBar>
      <main className="flex h-full ml-16">
        <RouterProvider router={router} />
      </main>
    </div>
  );
}

export default App;

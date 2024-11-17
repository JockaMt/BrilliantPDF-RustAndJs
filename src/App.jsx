import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/routes/home";
import SideBar from "./components/sidebar";
import SidebarItem from "./components/sidebaritem";
import { RiDeleteBin2Line, RiEditLine, RiExportLine, RiImageLine, RiImportLine, RiPaletteLine, RiPhoneLine, RiSave2Line } from "react-icons/ri";
import AddItem from "./components/routes/addItem";
import EditSections from "./components/routes/editSection";
import {Box, Modal} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import {invoke} from "@tauri-apps/api/core";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home/>
    },
    {
        path: "addItem/:id?:section?",
        element: <AddItem/>
    },
    {
        path: "/addItem/:id?&:section?",
        element: <AddItem/>
    },
    {
        path: "editSection/:id?",
        element: <EditSections/>
    },
])

function App() {

    const [sectionAlert, setSectionAlert] = useState(false)
    const [alertAction, setAlertAction] = useState(0)
    const options = [
        {title: "Editar nome da empresa", action: "name"},
        {title: "Editar paleta de cores", action: "pallet"},
        {title: "Editar número para contato", action: "phone"},
        {title: "Tem certeza que deseja deletar?", action: "delete"},
        {title: "imagem", action: "logo"},
    ]
    const [pallet, setPallet] = useState(0)
    const [info, setInfo] = useState("")

    const handleInputChange = (e) => {
        setInfo(e.target.value);
    };

    const handlePalletChange = (e) => {
        setPallet(Number(e.target.value));
        setInfo(e.target.value);
    }

    const fileInputRef = useRef(null);

    const handleLogoChange = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();  // Abre o file picker sem mostrar o input
        }
    };

    const submit = async () => {
        console.log(info)
        if (info !== ""){
            invoke("update_info", {name: options[alertAction].action, info: info}).then(()=>{
                window.location.reload()
            })
        }
    }

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        setAlertAction(4)
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base = reader.result.toString()
                invoke("update_info", {name: "logo", info: base}).then(()=>{
                    window.location.reload()
                })
            };
            reader.onerror = () => {
                console.error("Erro ao ler o arquivo");
            };
            reader.readAsDataURL(file);
        }
    };

    const selectFolder = async () => {
        invoke("where_save").then()
    }

    useEffect(() => {
        get_pallet().then();
    }, []);

    const get_pallet = async () => {
        setPallet(Number(await invoke("get_info", {name: "pallet"})))
    }

    const handlePallet = () => {
        setSectionAlert(false)
        submit().then()
    }

    const handleDelete = async () => {
        setSectionAlert(false)
        await invoke("delete_all_sections")
    }

    return (
        <div className="h-full w-full">
            <input
                type="file"
                accept={"image/*"}
                ref={fileInputRef}
                style={{display: 'none'}}
                onChange={handleImageChange}
            />
            <Modal onClose={() => setSectionAlert(false)} className={"flex justify-center items-center"}
                   open={sectionAlert}>
                <Box sx={{width: 400, height: alertAction !== 1 ? 180 : 300, borderRadius: 2}}
                     className={"bg-white outline-none p-3"}>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        submit().then()
                    }} className={"flex flex-col outline-none gap-5"}>
                        <h2 className={"flex justify-center pt-2 text-lg text-default font-medium"}>{options[alertAction].title}</h2>
                        {alertAction !== 1 && alertAction !== 3 &&
                            <input onChange={handleInputChange}
                                   className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none hover:bg-default/20 bg-default/5 p-2"/>
                        }
                        {alertAction === 1 &&
                            <ul>
                                <label className={"flex hover:bg-default/20 p-2 rounded-md gap-2"}><input
                                    onChange={handlePalletChange} value={"0"} name={"pallet"} checked={pallet === 0}
                                    type={"radio"}/> Cinza</label>
                                <label className={"flex hover:bg-default/20 p-2 rounded-md gap-2"}><input
                                    onChange={handlePalletChange} value={"1"} name={"pallet"} checked={pallet === 1}
                                    type={"radio"}/> Azul</label>
                                <label className={"flex hover:bg-default/20 p-2 rounded-md gap-2"}><input
                                    onChange={handlePalletChange} value={"2"} name={"pallet"} checked={pallet === 2}
                                    type={"radio"}/> Amarelo</label>
                                <label className={"flex hover:bg-default/20 p-2 rounded-md gap-2"}><input
                                    onChange={handlePalletChange} value={"3"} name={"pallet"} checked={pallet === 3}
                                    type={"radio"}/> Rosa</label>
                            </ul>
                        }
                        {alertAction !== 3 &&
                            <button onClick={() => handlePallet()} type={"submit"}
                                    className={"transition-all font-medium p-2 hover:bg-default/40 rounded-md"}>Salvar
                            </button>
                        }
                        {alertAction === 3 &&
                            <div className={"flex pt-12 justify-between bottom-0 right-0"}>
                                <button onClick={() => setSectionAlert(!sectionAlert)}
                                        className={"transition-all flex w-full justify-center text-default font-medium p-2 px-14 hover:bg-default/40 rounded-md"}>Cancelar
                                </button>
                                <button onClick={handleDelete} style={{color: '#ff2020'}}
                                        className={"transition-all flex w-full justify-center font-medium p-2 px-14 hover:bg-default/40 rounded-md"}>Deletar
                                </button>
                            </div>
                        }
                    </form>
                </Box>
            </Modal>
            <SideBar>
                <SidebarItem onClick={() => {
                    setAlertAction(0)
                    setSectionAlert(true);
                }} icon={<RiEditLine/>} text={"Editar nome"}/>
                <SidebarItem onClick={handleLogoChange} icon={<RiImageLine/>} text={"Editar imagem"}/>
                <SidebarItem onClick={() => {
                    setAlertAction(1)
                    setSectionAlert(true)
                }} icon={<RiPaletteLine/>} text={"Editar Paleta"}/>
                <SidebarItem onClick={() => {
                    setAlertAction(2)
                    setSectionAlert(true)
                }} icon={<RiPhoneLine/>} text={"Editar Número"}/>
                <SidebarItem icon={<RiImportLine/>} text={"Importar Catálogo"}/>
                <SidebarItem icon={<RiExportLine/>} text={"Exportar Catálogo"}/>
                <SidebarItem onClick={selectFolder} icon={<RiSave2Line/>} text={"Onde salvar"}/>
                <SidebarItem onClick={() => {
                    setAlertAction(3)
                    setSectionAlert(true)
                }} icon={<RiDeleteBin2Line/>} text={"Deletar Catálogo"}/>
            </SideBar>
            <main className="flex h-full ml-16">
                <RouterProvider router={router}/>
            </main>
        </div>
    );
}

export default App;

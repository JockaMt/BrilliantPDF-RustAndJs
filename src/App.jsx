import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/routes/home";
import SideBar from "./components/sidebar";
import SidebarItem from "./components/sidebaritem";
import {
    RiBugLine,
    RiDeleteBin2Line,
    RiEditLine,
    RiExportLine,
    RiImageLine,
    RiImportLine,
    RiPaletteLine, RiPhoneFill,
    RiPhoneLine,
    RiSave2Line
} from "react-icons/ri";
import AddItem from "./components/routes/addItem";
import EditSections from "./components/routes/editSection";
import {Box, Modal} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {MdFiberNew} from "react-icons/md";

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

const App = () => {

    const [sectionAlert, setSectionAlert] = useState(false)
    const [sectionAlert2, setSectionAlert2] = useState(false)
    const [updateAlert, setUpdateAlert] = useState(false)
    const [alertAction, setAlertAction] = useState(0)
    const options = [
        {title: "Editar nome da empresa", action: "name"},
        {title: "Editar paleta de cores", action: "pallet"},
        {title: "Editar número para contato", action: "phone"},
        {title: "Tem certeza que deseja deletar?", action: "delete"},
        {title: "imagem", action: "logo"},
    ]
    const [helper, setHelper] = useState("")
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

    const handleDelete = () => {
        setSectionAlert2(true)
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
        let hasRun = sessionStorage.getItem('appVersionChecked');

        if (!hasRun) {
        invoke("fetch_app_version").then((e) => {
            setUpdateAlert(!e);
        });
        sessionStorage.setItem('appVersionChecked', 'true');
        }
    }, []);

    useEffect(() => {
        get_pallet().then();
        setTimeout(()=>invoke("close_splashscreen"), 5000)
        // Desabilita o menu de contexto
        const disableContextMenu = (event) => {
            event.preventDefault();
        };
        

        // Adiciona o event listener
        window.addEventListener('contextmenu', disableContextMenu);
        // Remove o event listener ao desmontar o componente
        return () => {
            window.removeEventListener('contextmenu', disableContextMenu);
        };
    }, []);

    const get_pallet = async () => {
        setPallet(Number(await invoke("get_info", {name: "pallet"})))
    }

    const handlePallet = () => {
        setSectionAlert(false)
        submit().then()
    }

    return (
        <div className="h-full w-full">
            <div className="flex absolute w-full h-full justify-end items-end transition-all duration-200"
                 style={{pointerEvents: 'none'}}>
                <div className="flex absolute w-full h-full justify-end items-end transition-all duration-200"
                     style={{zIndex: 0}}>
                    <div className="m-7" style={{pointerEvents: 'auto', zIndex: 1}}>
                        <div onClick={() => window.open('https://wa.me/5528981137532', '_blank')}
                             className="flex gap-2 cursor-pointer bg-default p-2 rounded-full group transition-all duration-200">
                            <RiPhoneFill size={24} color={"#ffffff"}/>
                            <p className="hidden transition-all duration-200 text-white group-hover:block">Contato</p>
                        </div>
                    </div>
                </div>

            </div>

            <input
                type="file"
                accept={"image/*"}
                ref={fileInputRef}
                style={{display: 'none'}}
                onChange={handleImageChange}
            />
            <Modal onClose={() => setUpdateAlert(false)} className={"flex justify-center items-center"}
                   open={updateAlert}>
                <Box sx={{width: 'auto', height: 'auto', borderRadius: 2}} className={"flex flex-col items-center bg-white p-5 outline-none"}>
                    <MdFiberNew className="mb-3" size={30} color="#115f5f"/>
                    <p>Atualização disponível, entre em contato!</p>
                    <small className="mb-2">Clique fora para ignorar</small>
                </Box>
            </Modal>
            <Modal onClose={() => setSectionAlert2(false)} className={"flex justify-center items-center"}
                   open={sectionAlert2}>
                <Box sx={{width: 'auto', height: 'auto', borderRadius: 2}} className={"bg-white p-5 outline-none"}>
                    <h2 className={"flex justify-center pt-2 text-lg text-default font-medium"}>Atenção!</h2>
                    <p className={"flex text-center justify-center items-center pt-4"}>Deseja mesmo deletar o
                        catálogo?</p>
                    <div className={'flex justify-between gap-12 pt-6'}>
                        <button onClick={() => setSectionAlert2(false)}
                                className={'p-3 transition-colors duration-300 bg-default/20 text-red-600 font-medium rounded-md hover:text-white hover:bg-default'}>Cancelar
                        </button>
                        <button onClick={() => {
                            invoke("delete_all_sections").then(() => {
                                setSectionAlert2(true)
                                window.location.reload()
                            })
                        }}
                                className={'p-3 transition-colors duration-300 bg-default/20 text-default font-medium rounded-md hover:text-white hover:bg-default'}>Confirmar
                        </button>
                    </div>
                </Box>
            </Modal>
            <Modal onClose={() => {
                setHelper("")
                setSectionAlert(false)
            }} className={"flex justify-center items-center"}
                   open={sectionAlert}>
                <Box sx={{width: 400, height: "auto", borderRadius: 2}}
                     className={"bg-white outline-none p-3"}>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        submit().then()
                    }} className={"flex flex-col outline-none gap-5"}>
                        <h2 className={"flex justify-center pt-2 text-lg text-default font-medium"}>{options[alertAction].title}</h2>
                        {<small>{helper ? "Atual: " : ""}{helper}</small>}
                        {alertAction !== 1 && alertAction !== 3 &&
                            <input onChange={handleInputChange}
                                   className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none hover:bg-default/20 bg-default/5 p-2"/>
                        }
                        {alertAction === 1 &&
                            <ul>
                                <label className={"flex hover:bg-default/20 p-2 rounded-md gap-2"}><input
                                    onChange={handlePalletChange} value={"0"} name={"pallet"}
                                    checked={pallet === 0}
                                    type={"radio"}/> Cinza</label>
                                <label className={"flex hover:bg-default/20 p-2 rounded-md gap-2"}><input
                                    onChange={handlePalletChange} value={"1"} name={"pallet"}
                                    checked={pallet === 1}
                                    type={"radio"}/> Azul</label>
                                <label className={"flex hover:bg-default/20 p-2 rounded-md gap-2"}><input
                                    onChange={handlePalletChange} value={"2"} name={"pallet"}
                                    checked={pallet === 2}
                                    type={"radio"}/> Amarelo</label>
                                <label className={"flex hover:bg-default/20 p-2 rounded-md gap-2"}><input
                                    onChange={handlePalletChange} value={"3"} name={"pallet"}
                                    checked={pallet === 3}
                                    type={"radio"}/> Rosa</label>
                            </ul>
                        }
                        {alertAction !== 3 &&
                            <button onClick={() => handlePallet()} type={"submit"}
                                    className={"transition-all font-medium p-2 hover:bg-default/40 rounded-md"}>Salvar
                            </button>
                        }
                    </form>
                </Box>
            </Modal>
            <SideBar>
                <SidebarItem onClick={async () => {
                    setAlertAction(0)
                    setSectionAlert(true)
                    setHelper(await invoke("get_info", {name: "name"}))
                }} icon={<RiEditLine/>} text={"Editar nome"}/>
                <SidebarItem onClick={handleLogoChange} icon={<RiImageLine/>} text={"Editar imagem"}/>
                <SidebarItem onClick={async () => {
                    setAlertAction(1)
                    setSectionAlert(true)
                    setHelper("")
                }} icon={<RiPaletteLine/>} text={"Editar Paleta"}/>
                <SidebarItem onClick={async () => {
                    setAlertAction(2)
                    setSectionAlert(true)
                    setHelper(await invoke("get_info", {name: "phone"}))
                }} icon={<RiPhoneLine/>} text={"Editar Número"}/>
                <SidebarItem onClick={async () => invoke("import_database").then(() => {
                    window.location.reload()
                })} icon={<RiImportLine/>} text={"Importar Catálogo"}/>
                <SidebarItem onClick={async () => await invoke("export_database")} icon={<RiExportLine/>}
                             text={"Exportar Catálogo"}/>
                <SidebarItem onClick={selectFolder} icon={<RiSave2Line/>} text={"Onde salvar"}/>
                <SidebarItem onClick={async () => {
                    handleDelete()
                }} icon={<RiDeleteBin2Line/>} text={"Deletar Catálogo"}/>
                <SidebarItem onClick={async () => await invoke("open_email_report")} icon={<RiBugLine/>}
                             text={"Reportar erro"}/>
            </SideBar>
            <main className="flex h-full ml-16">
                <RouterProvider router={router}/>
            </main>
        </div>
    );
}

export default App;

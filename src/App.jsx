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
import pallet1 from "./assets/pallet-1.png";
import pallet2 from "./assets/pallet-2.png";
import pallet3 from "./assets/pallet-3.png";
import pallet4 from "./assets/pallet-4.png";


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
        {title: "Edit company name", action: "name"},
        {title: "Edit color palette", action: "pallet"},
        {title: "Edit contact number", action: "phone"},
        {title: "Are you sure you want to delete?", action: "delete"},
        {title: "Image", action: "logo"},
    ]
    const [helper, setHelper] = useState("")
    const [pallet, setPallet] = useState("0,0,0")
    const [customColor, setCustomColor] = useState("")
    const [info, setInfo] = useState("")

    const handleInputChange = (e) => {
        setInfo(e.target.value);
    };

    function sanitizeRgbInput(input) {
        const components = input
            .trim()                      // Remove whitespace
            .replaceAll(" ", "")         // Remove internal spaces (e.g., "255, 255, 255")
            .split(',')                  // Split into array
            .filter(s => s !== "")       // Remove empty strings (e.g., from trailing commas)
            .slice(0, 3);                // Keep only the first 3 values

        // Ensure exactly 3 components (default to 0 for missing values)
        const paddedComponents = components.concat(['0', '0', '0']).slice(0, 3);

        return paddedComponents
            .map(numStr => {
                const num = isNaN(parseInt(numStr)) ? 0 : parseInt(numStr);
                return Math.min(255, Math.max(0, num));  // Clamp to 0-255
            })
            .join(',');  // Rejoin into string
    }

    const handlePalletChange = (e) => {
        setPallet(e.target.value.trim());
        setInfo(e.target.value);
    }

    const fileInputRef = useRef(null);

    const handleLogoChange = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();  // Abre o file picker sem mostrar o input
        }
    };

    const submit = async () => {
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
                console.error("Error reading file");
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
        invoke("check_and_apply_update");
        // Desabilita o menu de contexto
        const disableContextMenu = (event) => {
            event.preventDefault();
        };
        // Adiciona o event listener
        //window.addEventListener('contextmenu', disableContextMenu);
        // Remove o event listener ao desmontar o componente
        // return () => {
        //     window.removeEventListener('contextmenu', disableContextMenu);
        // };
    }, []);

    const get_pallet = async () => {
        setPallet(await invoke("get_info", {name: "pallet"}))
    }

    const handlePallet = () => {
        setSectionAlert(false)
        submit().then()
    }

    return (
        <div className="h-full w-full">
            <div className="flex group absolute z-50 w-full h-full justify-end items-end transition-all duration-200"
                 style={{pointerEvents: 'none'}}>
                <div className="flex justify-end items-end transition-all duration-200"
                     style={{zIndex: 0}}>
                    <div className="flex justify-center items-center m-7 transition-all duration-200" style={{pointerEvents: 'auto', zIndex: 1}}>
                        <div onClick={() => window.open('https://wa.me/5528981137532', '_blank')}
                             className="flex w-10 group-hover:w-32 overflow-hidden cursor-pointer bg-default p-2 rounded-full transition-all duration-200">
                            <RiPhoneFill className="flex h-[24px] w-[24px]" color={"#ffffff"}/>
                            <p className="hidden justify-center w-full text-white group-hover:flex">Contact</p>
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
                    <p>Update available, get in touch!</p>
                    <small className="mb-2">Click away to ignore</small>
                </Box>
            </Modal>
            <Modal onClose={() => setSectionAlert2(false)} className={"flex justify-center items-center"}
                   open={sectionAlert2}>
                <Box sx={{width: 'auto', height: 'auto', borderRadius: 2}} className={"bg-white p-5 outline-none"}>
                    <h2 className={"flex justify-center pt-2 text-lg text-default font-medium"}>Warning!</h2>
                    <p className={"flex text-center justify-center items-center pt-4"}>Do you really want to delete the
                        catalog?</p>
                    <div className={'flex justify-between gap-12 pt-6'}>
                        <button onClick={() => setSectionAlert2(false)}
                                className={'p-3 transition-colors duration-300 bg-default/20 text-red-600 font-medium rounded-md hover:text-white hover:bg-default'}>Cancel
                        </button>
                        <button onClick={() => {
                            invoke("delete_all_sections").then(() => {
                                setSectionAlert2(true)
                                window.location.reload()
                            })
                        }}
                                className={'p-3 transition-colors duration-300 bg-default/20 text-default font-medium rounded-md hover:text-white hover:bg-default'}>Confirm
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
                        {<small>{helper ? "Now: " : ""}{helper}</small>}
                        {alertAction !== 1 && alertAction !== 3 &&
                            <input onChange={handleInputChange}
                                   className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none hover:bg-default/20 bg-default/5 p-2"/>
                        }
                        {alertAction === 1 &&
                            <ul>
                                <label className={"flex items-center hover:bg-default/20 p-2 rounded-md gap-2"}><input
                                    onChange={handlePalletChange} value={"204,196,196"} name={"pallet"}
                                    checked={pallet === "204,196,196"}
                                    type={"radio"}/>
                                    <img className="px-2 h-10" src={pallet1} alt=""/>
                                    Gray
                                    </label>
                                <label className={"flex hover:bg-default/20 p-2 rounded-md gap-2"}><input
                                    onChange={handlePalletChange} value={"153,204,255"} name={"pallet"}
                                    checked={pallet === "153,204,255"}
                                    type={"radio"}/>
                                    <img className="px-2 h-10" src={pallet2} alt=""/>
                                    Blue</label>
                                <label className={"flex hover:bg-default/20 p-2 rounded-md gap-2"}><input
                                    onChange={handlePalletChange} value={"255,230,128"} name={"pallet"}
                                    checked={pallet === "255,230,128"}
                                    type={"radio"}/>
                                    <img className="px-2 h-10" src={pallet3} alt=""/>
                                    Yellow</label>
                                <label className={"flex hover:bg-default/20 p-2 rounded-md gap-2"}><input
                                    onChange={handlePalletChange} value={"255,153,204"} name={"pallet"}
                                    checked={pallet === "255,153,204"}
                                    type={"radio"}/>
                                    <img className="px-2 h-10" src={pallet4} alt=""/>
                                    Pink</label>
                                <label id={"customInputLabel"} className={"flex hover:bg-default/20 p-2 rounded-md gap-2"}><input
                                    onChange={handlePalletChange} value={customColor} name={"pallet"}
                                    checked={pallet !== "204,196,196" && pallet !== "153,204,255" && pallet !== "255,230,128" && pallet !== "255,153,204"}
                                    type={"radio"}/>
                                    <input id={"customInput"} onChange={(e) => {
                                        setCustomColor(e.target.value.trim())
                                        setPallet(sanitizeRgbInput(e.target.value.trim().replaceAll(" ", "")));
                                        setInfo(sanitizeRgbInput(e.target.value.trim().replaceAll(" ", "")));
                                    }}
                                           onFocus={() => {
                                               document.getElementById("customInputLabel").click()
                                               document.getElementById("customInput").focus()
                                           }}
                                           defaultValue={pallet !== "204,196,196" && pallet !== "153,204,255" && pallet !== "255,230,128" && pallet !== "255,153,204" ? customColor : ""} className={"flex flex-1 pl-2 py-2 ml-2 w-full border-none outline-none rounded"} placeholder={"Ex: 255,255,255"}/>
                                </label>
                            </ul>
                        }
                        {alertAction !== 3 &&
                            <button onClick={() => handlePallet()} type={"submit"}
                                    className={"transition-all font-medium p-2 hover:bg-default/40 rounded-md"}>Save
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
                }} icon={<RiEditLine/>} text={"Edit name"}/>
                <SidebarItem onClick={handleLogoChange} icon={<RiImageLine/>} text={"Edit image"}/>
                <SidebarItem onClick={async () => {
                    setAlertAction(1)
                    setSectionAlert(true)
                    setHelper("")
                }} icon={<RiPaletteLine/>} text={"Edit palette"}/>
                <SidebarItem onClick={async () => {
                    setAlertAction(2)
                    setSectionAlert(true)
                    setHelper(await invoke("get_info", {name: "phone"}))
                }} icon={<RiPhoneLine/>} text={"Edit Number"}/>
                <SidebarItem onClick={async () => invoke("import_database").then(() => {
                    window.location.reload()
                })} icon={<RiImportLine/>} text={"Import catalog"}/>
                <SidebarItem onClick={async () => await invoke("export_database")} icon={<RiExportLine/>}
                             text={"Export catalog"}/>
                <SidebarItem onClick={selectFolder} icon={<RiSave2Line/>} text={"Where to save"}/>
                <SidebarItem onClick={async () => {
                    handleDelete()
                }} icon={<RiDeleteBin2Line/>} text={"Delete catalog"}/>
                <SidebarItem onClick={async () => await invoke("open_email_report")} icon={<RiBugLine/>}
                             text={"Report error"}/>
            </SideBar>
            <main className="flex h-full ml-16">
                <RouterProvider router={router}/>
            </main>
        </div>
    );
}

export default App;

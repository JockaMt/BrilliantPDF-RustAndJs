import logo from "../../assets/Logo1.png"
import { IoClose, IoMenu } from "react-icons/io5";
import {useState, createContext, useEffect} from 'react';
import {RiAccountCircleLine, RiCloseLine} from "react-icons/ri";
import {invoke} from "@tauri-apps/api/core";
import {Box, Modal} from "@mui/material";

export const SidebarContext = createContext()

const SideBar = ({children}) => {

    const [expanded, setExpanded] = useState(false)
    const [profileName, setProfileName] = useState("")
    const [profileImage, setProfileImage] = useState()
    const [modal, setModal] = useState(false)
    const [info, setInfo] = useState({})

    const user_name = async () => {
        invoke("get_info", {name: "name"}).then((e) => {
                setProfileName(e)
            }
        )
        invoke("get_info", {name: "logo"}).then((e) => {
            setProfileImage(e)
        })
    }

    const get_info = async () => {
        const infos = ["phone", "pallet", "save_path", "name"];
        const infoData = await Promise.all(
            infos.map((e) => invoke("get_info", { name: e }))
        );

        const updatedInfo = infos.reduce((acc, curr, index) => {
            acc[curr] = infoData[index];
            return acc;
        }, {});

        setInfo((prev) => ({
            ...prev,
            ...updatedInfo
        }));

        setModal(true)
    };


    useEffect(() => {
        user_name().then()
    }, []);

    return (
        <aside className="fixed h-screen z-50">
            <Modal onClose={() => setModal(false)} className={"flex justify-center items-center"} open={modal}>
                <Box sx={{width: 'auto', maxWidth: 500, height: 'auto', outline: 'none', borderRadius: 2, padding: 2}}
                     className={"relative bg-white p-3"}>
                    <RiCloseLine className={"absolute mr-3 right-0"} onClick={()=>setModal(false)}/>
                    <h2 className={"flex justify-center py-4 text-lg text-default font-medium"}>Informações</h2>
                    <p className={"flex p-2 items-center"}>Nome: {info["name"] ? info["name"] : "Vazio"}</p>
                    <p className={"flex p-2 items-center"}>Telefone: {info["phone"] ? info["phone"] : "Vazio"}</p>
                    <p className={"flex p-2 text-wrap items-center"}>Local: {info["save_path"] ? info["save_path"] : "Vazio"}</p>
                    <p className={"flex p-2 items-center"}>Paleta: {info["pallet"] ? info["pallet"] : "Vazio"}</p>
                </Box>
            </Modal>
            <div
                className={`h-full ${expanded ? "w-60" : "w-16"} transition-all bg-white flex flex-col border-r shadow-sm`}>
                <div className={`flex mx-3 h-20 pt-6 pb-6 "py-4" justify-between items-center`}>
                    <div className={`${expanded ? "flex" : "hidden"} gap-3`}><img alt={"logo"} src={logo} className="w-12 h-8"/><h1 className="flex text-nowrap flex-1 w-full font-bold text-default text-lg">Brilliant PDF</h1></div>
                    <button onClick={() => setExpanded((curr) => !curr)} className={`flex flex-1 px-1 w-6 h-full ${expanded ? "justify-end" : "justify-center"} items-center`}>
                        {expanded ? <IoClose size={16}/> : <IoMenu size={30}/>}
                    </button>
                </div>
                <SidebarContext.Provider value={{expanded}}>
                    <ul className={`flex-1 text-nowrap overflow-y-auto overflow-x-hidden border-y-2 ${expanded ? "mx-3" : "mx-0"}`}>
                        {children}
                    </ul>
                </SidebarContext.Provider>
                <div onClick={()=> get_info().then()} className={`flex ${expanded ? "mx-4 justify-start" : "justify-center"} items-center h-16 gap-2`}>
                    {profileImage ? <img className={"w-12 h-12 min-w-12 object-cover rounded-full"} src={profileImage} alt="Profile-image"/> : <RiAccountCircleLine size={32}/>}
                    {expanded ? <span>{profileName ? profileName : "Your Name"}</span> : null}
                </div>
            </div>
        </aside>
    )
}

export default SideBar;
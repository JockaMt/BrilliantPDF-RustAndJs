import logo from "../../assets/Logo1.png"
import { IoClose, IoMenu } from "react-icons/io5";
import {useState, createContext, useEffect} from 'react';
import { RiAccountCircleLine } from "react-icons/ri";
import {invoke} from "@tauri-apps/api/core";

export const SidebarContext = createContext()

const SideBar = ({children}) => {

    const [expanded, setExpanded] = useState(false)
    const [profileName, setProfileName] = useState("")
    const [profileImage, setProfileImage] = useState("")

    const user_name = async () => {
        invoke("get_info", {name: "name"}).then((e) => {
                setProfileName(e)
            }
        )
        invoke("get_info", {name: "logo"}).then((e) => {
            if (e !== "0"){
               setProfileImage(e)
                console.log(e)
            } else {
                setProfileImage("")
            }
        })
    }

    useEffect(() => {
        user_name().then()
    }, []);

    return (
        <aside className="fixed h-screen z-50">
            <div className={`h-full ${expanded ? "w-60" : "w-16"} transition-all bg-white flex flex-col border-r shadow-sm`}>
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
                <div className={`flex ${expanded ? "mx-4 justify-start" : "justify-center"} items-center h-16 gap-2`}>
                    {profileImage !== "" ? <img className={"w-12 h-12 object-cover rounded-full"} src={profileImage} alt="Profile-image"/> : <RiAccountCircleLine size={32}/>}
                    {expanded ? <span>{profileName}</span> : null}
                </div>
            </div>
        </aside>
    )
}

export default SideBar;
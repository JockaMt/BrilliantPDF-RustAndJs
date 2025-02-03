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
    RiPaletteLine,
    RiPhoneLine,
    RiSave2Line,
    RiLogoutCircleRLine
} from "react-icons/ri";
import AddItem from "./components/routes/addItem";
import EditSections from "./components/routes/editSection";
import {Box, Modal} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "firebase/auth";
import LoginScreen from "./components/loginScreen/index.jsx";
const firebaseConfig = {
    apiKey: "AIzaSyCJskXz_PW1a17PZeI-QqtdA9gY-vaV-NY",
    authDomain: "brilliant-software.firebaseapp.com",
    projectId: "brilliant-software",
    storageBucket: "brilliant-software.firebasestorage.app",
    messagingSenderId: "595501321567",
    appId: "1:595501321567:web:2619b9efd6310c3f68baea",
    measurementId: "G-MHXQE9TC9M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

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

    const [logged, setLogged] = useState(false);
    const [sectionAlert, setSectionAlert] = useState(false);
    const [sectionAlert2, setSectionAlert2] = useState(false);
    const [alertAction, setAlertAction] = useState(0);
    const options = [
        {title: "Editar nome da empresa", action: "name"},
        {title: "Editar paleta de cores", action: "pallet"},
        {title: "Editar número para contato", action: "phone"},
        {title: "Tem certeza que deseja deletar?", action: "delete"},
        {title: "imagem", action: "logo"},
    ];
    const [helper, setHelper] = useState("");
    const [pallet, setPallet] = useState(0);
    const [info, setInfo] = useState("");

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
        get_pallet().then();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setLogged(!!user);
        });

        setTimeout(()=>invoke("close_splashscreen"), 5000);

        return () => unsubscribe();
    }, []);

    const get_pallet = async () => {
        setPallet(Number(await invoke("get_info", {name: "pallet"})))
    }

    const handlePallet = () => {
        setSectionAlert(false)
        submit().then()
    }

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Erro ao fazer login com o Google:", error);
        }
    };

    const handleEmailLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Erro ao fazer login com e-mail e senha:", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
            setLogged(false);
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            {!logged ? (
                <LoginScreen handleEmailLogin={handleEmailLogin} handleGoogleLogin={handleGoogleLogin}/>
            ) : (
                <div>
                    <input
                        type="file"
                        accept={"image/*"}
                        ref={fileInputRef}
                        style={{display: 'none'}}
                        onChange={handleImageChange}
                    />
                    <Modal onClose={() => setSectionAlert2(false)} className={"flex justify-center items-center"} open={sectionAlert2}>
                        <Box sx={{ width: 'auto', height: 'auto', borderRadius: 2 }} className={"bg-white p-5 outline-none"}>
                            <h2 className={"flex justify-center pt-2 text-lg text-default font-medium"}>Atenção!</h2>
                            <p className={"flex text-center justify-center items-center pt-4"}>Deseja mesmo deletar o catálogo?</p>
                            <div className={'flex justify-between gap-12 pt-6'}>
                                <button onClick={() => setSectionAlert2(false)} className={'p-3 transition-colors duration-300 bg-default/20 text-red-600 font-medium rounded-md hover:text-white hover:bg-default'}>Cancelar</button>
                                <button onClick={() => {
                                    invoke("delete_all_sections").then(()=>{
                                        setSectionAlert2(true)
                                        window.location.reload()
                                    })
                                }} className={'p-3 transition-colors duration-300 bg-default/20 text-default font-medium rounded-md hover:text-white hover:bg-default'}>Confirmar
                                </button>
                            </div>
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
                        <SidebarItem onClick={async () => invoke("import_database").then(()=>{ window.location.reload() })} icon={<RiImportLine/>} text={"Importar Catálogo"}/>
                        <SidebarItem onClick={async () => await invoke("export_database")} icon={<RiExportLine/>} text={"Exportar Catálogo"}/>
                        <SidebarItem onClick={selectFolder} icon={<RiSave2Line/>} text={"Onde salvar"}/>
                        <SidebarItem onClick={async () => { handleDelete() }} icon={<RiDeleteBin2Line/>} text={"Deletar Catálogo"}/>
                        <SidebarItem onClick={async () => await invoke("open_email_report")} icon={<RiBugLine/>} text={"Reportar erro"}/>
                        <SidebarItem onClick={handleSignOut} icon={<RiLogoutCircleRLine />} text={"Sair"} />
                    </SideBar>
                    <main className="flex h-full ml-16">
                        <RouterProvider router={router}/>
                    </main>
                </div>
            )}
        </div>
    );
}

export default App;

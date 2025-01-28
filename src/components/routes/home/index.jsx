import {useNavigate} from "react-router-dom";
import Header from "../../header";
import {
    RiDatabaseFill,
    RiFilePdfFill,
    RiFileTextFill, RiLoader5Fill,
} from "react-icons/ri";
import {invoke} from "@tauri-apps/api/core";
import {useEffect, useState} from "react";
import SectionList from "../../sectionList/index.jsx";
import {Modal} from "@mui/material";


const Home = () => {
    const [sections, setSections] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const navigate = useNavigate()
    const [generating, setGenerating] = useState(false)


    const fetchSections = () => {
        invoke('get_sections')
            .then((e) => {
                setSections(e)
                setLoaded(true)
            })
    }

    useEffect(() => {
        fetchSections();
    }, []);

    const handleDeleteSection = (sectionName) => {
        invoke('delete_section', { section: sectionName })
            .then(() => fetchSections()); // Atualiza a lista após deletar
    };

    const handleSaveCatalog = async () => {
        setGenerating(true)
        invoke("generate_pdf").then((e) => {
            setGenerating(false)
        })
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="fixed h-full w-full -z-10 opacity-5 bg-background bg-no-repeat bg-center bg-cover "></div>
            <Modal className={"flex justify-center items-center"} open={generating}>
                <p className={"flex flex-col items-center outline-none text-white"}>Gerando PDF <RiLoader5Fill size={30} className={"flex justify-center animate-spin"}/></p>
            </Modal>
            <Header page={"Início"}/>
            <div className="flex-1 overflow-auto h-full gap-12 justify-center items-center">
                <div className="flex h-full">
                    <div className="flex my-12 border-r-2 px-5 flex-col gap-5">
                        <h3 className="text-center font-medium text-lg border-b-2 pb-8">Opções</h3>
                        <button disabled={sections.length === 0} onClick={() => navigate("/addItem/")}
                                className="flex gap-3 disabled:bg-default/30 disabled:scale-100 justify-center items-center transition-all hover:scale-105 h-16 min-h-16 w-44 bg-default/80 hover:bg-default text-white font-medium rounded-lg shadow-md">
                            <RiFileTextFill size={34}/><p>Adicionar item</p></button>
                        <button onClick={() => navigate(`/editSection/`)}
                                className="flex gap-3 justify-center items-center transition-all hover:scale-105 h-16 disabled:bg-default/30 disabled:scale-100 min-h-16 w-44 bg-default/80 hover:bg-default text-white font-medium rounded-lg shadow-md">
                            <RiDatabaseFill size={34}/><p>Adicionar seção</p></button>
                        <button disabled={sections.length === 0} onClick={handleSaveCatalog}
                                className="flex gap-3 disabled:bg-default/30 disabled:scale-100 justify-center items-center transition-all hover:scale-105 h-16 min-h-16 w-44 bg-default/80 hover:bg-default text-white font-medium rounded-lg shadow-md">
                            <RiFilePdfFill size={34}/><p>Gerar catálogo</p></button>
                    </div>
                    <div className="flex flex-col pt-12 xl:mr-60 mx-5 w-full items-center">
                        <div className={"flex w-full relative justify-center"}><h2
                            className="flex text-lg font-bold">Seções</h2></div>
                        <small className="flex w-full mb-2 max-w-[50rem] justify-center border-b-2 mx-12 pb-3">Clique para editar a seção</small>
                        <ul className="flex gap-1 flex-col w-full max-w-[50rem] overflow-y-auto py-3">
                            {loaded &&
                                sections.map((name) =>
                                    <SectionList onDelete={handleDeleteSection} key={name} name={name}/>
                                )
                            }
                            {
                                sections.length === 0 &&
                                <div className={"flex flex-col gap-5"}>
                                    <p className={"flex justify-center"}>Você não adicionou nenhuma seção ainda...</p>
                                    <button onClick={() => navigate(`/editSection/`)} className={`flex w-full transition-all justify-center text-nowrap text-white p-3 hover:bg-default/60 bg-default rounded-md`}>Adicionar seção</button>
                                </div>
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;
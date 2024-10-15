import {Link} from "react-router-dom";
import Header from "../../header";
import {RiDatabaseFill, RiFilePdfFill, RiFileTextFill} from "react-icons/ri";
import {invoke} from "@tauri-apps/api/core";
import {useEffect, useState} from "react";
import SectionList from "../../sectionList/index.jsx";


const Home = () => {
    const [sections, setSections] = useState([]);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        const fetchSections = () => {
            invoke('get_sections')
                .then((e) => {
                    setSections(e)
                    setLoaded(true)
                })// Verifica o que está sendo retornado aqui// Certifique-se de que o resultado seja um array
        }
        return () => fetchSections();
    }, []);

    return (
        <div className="flex flex-col h-full w-full">
            <div className="fixed h-full w-full -z-10 opacity-5 bg-background bg-no-repeat bg-center bg-cover "></div>
            <Header page={"Início"}/>
            <div className="flex-1 overflow-auto h-full gap-12 justify-center items-center">
                <div className="flex h-full">
                    <div className="flex my-12 border-r-2 px-5 flex-col gap-5">
                        <h3 className="text-center font-medium text-lg border-b-2 pb-8">Opções</h3>
                        <Link to={"/addItem/"} className="flex gap-3 justify-center items-center transition-all hover:scale-105 h-16 min-h-16 w-44 bg-default/80 hover:bg-default text-white font-medium rounded-lg shadow-md"><RiFileTextFill size={34}/><p>Adicionar item</p></Link>
                        <button className="flex gap-3 justify-center items-center transition-all hover:scale-105 h-16 min-h-16 w-44 bg-default/80 hover:bg-default text-white font-medium rounded-lg shadow-md"><RiDatabaseFill size={34}/><p>Editar seções</p></button>
                        <button onClick={() => {invoke("generate_pdf")}} className="flex gap-3 justify-center items-center transition-all hover:scale-105 h-16 min-h-16 w-44 bg-default/80 hover:bg-default text-white font-medium rounded-lg shadow-md"><RiFilePdfFill size={34}/><p>Gerar catálogo</p></button>
                    </div>
                    <div className="flex flex-col pt-12 xl:mr-60 mx-5 w-full items-center">
                        <h2 className="flex text-lg font-bold">Seções</h2>
                        <small className="flex w-full mb-2 max-w-[50rem] justify-center border-b-2 mx-12 pb-3">Clique para editar a seção</small>
                        <ul className="flex gap-1 flex-col w-full max-w-[50rem] overflow-y-auto py-3">
                            {loaded &&
                                sections.map((name) =>
                                    <SectionList key={name} name={name}/>
                                )
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;
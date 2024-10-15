import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../header";

const AddItem = () => {
    const { name, id } = useParams();
    const navigate = useNavigate();
    const itens = [
        ["111111", "123"],
        ["111111", "465"],
        ["111111", "423"],
        ["111111", "643"],
        ["111111", "145"],
        ["111111", "198"],
        ["111111", "783"],
        ["111111", "398"],
        ["111111", "190"],
        ["111111", "114"],
        ["111111", "256"],
        ["111111", "106"],
        ["111111", "222"],
        ["111111", "585"],
        ["111111", "329"],
        ["111111", "659"],
    ]
    return (
        <div className="flex flex-col h-full w-full">
            <div className="fixed h-full w-full -z-10 opacity-5 bg-background bg-no-repeat bg-center bg-cover "></div>
            <Header page={"Adicionar item"}/>
            <Link className="flex text-white font-medium gap-3 fixed p-7" onClick={() => navigate(-1)}>Voltar</Link>
            <div className="flex-1 overflow-auto h-full gap-12 justify-center items-center">
                <div className="flex h-full">
                    <div className="flex flex-col pt-12 mx-12 w-full items-center">
                        <h2 className="flexpt-12 text-lg font-bold">{id ? "Editar item": "Novo item"}</h2>
                        <small className="flex w-full max-w-[50rem] justify-center border-b-2 mx-12 pb-3">Preencha os campos obrigatórios</small>
                        <form onSubmit={(e) => {e.preventDefault()}} className="flex gap-3 flex-col w-full max-w-[50rem] py-3">
                            <input className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none bg-default/5 p-2" type="text" placeholder="Código do item"/>
                            <input className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none bg-default/5 p-2" type="text" placeholder="Nome da seção"/>
                            <input className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none bg-default/5 p-2" type="text" placeholder="Nome da seção"/>
                            <input className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none bg-default/5 p-2" type="text" placeholder="Nome da seção"/>
                            <input className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none bg-default/5 p-2" type="text" placeholder="Nome da seção"/>
                            <input className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none bg-default/5 p-2" type="text" placeholder="Nome da seção"/>
                            <input className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none bg-default/5 p-2" type="text" placeholder="Nome da seção"/>
                            <button className="text-default transition-all font-medium p-2 hover:bg-default/40 rounded-md" type="submit">Salvar</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddItem;
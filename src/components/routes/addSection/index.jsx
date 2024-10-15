import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../../header";
import ItemList from "../../itemList";

const AddSections = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const items = [
        ["id", "name"],
        ["id", "name"],
        ["id", "name"],
        ["id", "name"],
        ["id", "name"],
        ["id", "name"],
        ["id", "name"],
        ["id", "name"],
        ["id", "name"],
        ["id", "name"],
        ["id", "name"],
        ["id", "name"],
        ["id", "name"],
        ["id", "name"],
        ["id", "name"],
        ["id", "name"],
    ];
    return (
        <div className="flex flex-col h-full w-full">
            <div className="fixed h-full w-full -z-10 opacity-5 bg-background bg-no-repeat bg-center bg-cover "></div>
            <Header page={`Editar seção ${id}`}/>
            <Link className="flex text-white font-medium gap-3 fixed p-7" onClick={() => navigate(-1)}>Voltar</Link>
            <div className="flex flex-1 overflow-auto h-full gap-12 mx-5">
                <div className="flex w-full justify-center">
                    <div className="flex flex-1 flex-col h-full max-w-[50rem]">
                        <div className="flex justify-center h-12 items-end"><h1 className="flex font-bold text-lg">Seção</h1></div>
                        <div className="flex">
                            <form onSubmit={(e) => {e.preventDefault()}} className="flex w-full h-20 gap-3 pt-4 pb-4 border-b-2">
                                <input className="w-full border-b-2 border-default focus:border-none focus:rounded-md outline-none bg-default/5 p-2" type="text" placeholder="Nome da seção"/>
                                <button className="font-bold text-default" type="submit">Salvar</button>
                            </form>
                        </div>
                        <ul className="flex flex-col py-3 mt-1 gap-1 overflow-y-auto">
                            {items.map((e) => {
                                return <ItemList id={e[0]} name={e[1]}/>
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddSections;
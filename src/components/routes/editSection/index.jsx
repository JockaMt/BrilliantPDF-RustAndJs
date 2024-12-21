import { useParams, useNavigate } from "react-router-dom";
import Header from "../../header";
import {RiAddLine, RiBrush2Line, RiDeleteBin2Line} from "react-icons/ri";
import {useEffect, useState} from "react";
import ItemList from "../../itemList/index.jsx";
import {invoke} from "@tauri-apps/api/core";
import {Box, Modal} from "@mui/material";

const AddSections = () => {

    let { id } = useParams();
    const navigate = useNavigate();
    const [sectionName, setSectionName] = useState("")
    const [sectionAlert, setSectionAlert] = useState(false)
    const [sectionAlert2, setSectionAlert2] = useState(false)
    const [sectionAlert3, setSectionAlert3] = useState(false)
    const [items, setItems] = useState([])
    const [selectedItems, setSelectedItems] = useState({ids: []})

    const handleSetSelectItems = (id) => {
        setSelectedItems((prev) => {
            if (prev.ids && prev.ids.includes(id)) {
                return {
                    ...prev,
                    ids: prev.ids.filter((item) => item !== id)
                };
            } else {
                return {
                    ...prev,
                    ids: [...(prev.ids || []), id]
                };
            }
        });
    };

    const submit = () => {
        const checkAndFetchSections = async () => {
            try {
                if (!sectionName) {
                    console.error("Section name is missing.");
                    return;
                }
                const sectionExists = await invoke('check_section_exists', { section: sectionName });

                if (sectionExists) {
                    setSectionAlert(true);
                } else {
                    await invoke('insert_section', { section: sectionName }); // Insere a nova seção
                    navigate("/");
                }
            } catch (error) {
                console.error('Error checking or fetching sections:', error);
            }
        };

        const checkAndUpdateSections = async () => {
            try {
                if (!sectionName) {
                    console.error("Section name is missing.");
                    return;
                }
                const sectionExists = await invoke('check_section_exists', { section: sectionName });

                if (sectionExists) {
                    setSectionAlert(true);
                } else {
                    await invoke('update_section', { newSection: sectionName, section: id }); // Atualiza a seção
                    navigate("/");
                }
            } catch (error) {
                console.error('Error checking or fetching sections:', error);
            }
        };

        if (id) {
            checkAndUpdateSections();
        } else {
            checkAndFetchSections();
        }
    };


    const handleDeleteItems = () => {
        setSectionAlert2(true)
    };

    const handleDeleteSection = () => {
        setSectionAlert3(true)
    };

    const deleteItems = async () => {
        try {
            // Deleta os itens selecionados
            const deleteQueue = selectedItems.ids.map(async (e) => {
                await invoke("delete_item", { itemId: Number(e) });
            });

            // Aguarda a exclusão de todos os itens
            await Promise.all(deleteQueue);

            // Limpa os itens selecionados
            setSelectedItems({ ids: [] });

            // Atualiza a lista de itens após a exclusão
            if (id) {
                const updatedItems = await invoke("get_items_in_section", { section: id });
                setItems(updatedItems); // Atualiza o estado com os itens restantes
            }
        } catch (error) {
            console.error("Erro ao deletar itens:", error);
        }
    }

    useEffect(() => {
        setSectionName(id || ""); // Define o nome da seção como id, ou uma string vazia se id não existir

        const input = document.getElementById("input");
        if (id) {
            const fetchItems = async () => {
                try {
                    const itemsList = await invoke("get_items_in_section", { section: id });
                    setItems(itemsList);
                } catch (error) {
                    console.error("Error fetching items:", error);
                }
            };
            input.value = id; // Define o valor do input como id
            fetchItems();
        } else {
            input.value = ""; // Limpa o valor do input se id não existir
        }
        input.focus();
    }, [id]); // Executa o efeito apenas quando id muda


    const delete_section = async () => {
        await invoke("delete_section", {section: id})
        navigate("/")
    }

    const handleDeleteAllItems = async () => {
        await invoke("delete_all_items", {section: id})
        if (id) {
            const updatedItems = await invoke("get_items_in_section", { section: id });
            setItems(updatedItems); // Atualiza o estado com os itens restantes
        }
    }

    return (
        <div className="flex flex-col h-full w-full">
            <Modal onClose={() => setSectionAlert2(false)} className={"flex justify-center items-center"} open={sectionAlert2}>
                <Box sx={{ width: 'auto', height: 'auto', borderRadius: 2 }} className={"bg-white p-3"}>
                    <h2 className={"flex justify-center pt-2 text-lg text-default font-medium"}>Atenção!</h2>
                    <p className={"flex justify-center items-center pt-8"}>Todas os itens dessa seção serão apagados!</p>
                    <div className={'flex justify-between gap-12 pt-6'}>
                        <button className={'p-3 transition-colors duration-300 bg-default/20 text-red-600 font-medium rounded-md hover:text-white hover:bg-default'} onClick={() => setSectionAlert2(false)}>Cancelar</button>
                        <button className={'p-3 transition-colors duration-300 bg-default/20 text-default font-medium rounded-md hover:text-white hover:bg-default'} onClick={() => {
                            handleDeleteAllItems()
                        setSectionAlert2(false)
                    }}>Confirmar</button></div>
                </Box>
            </Modal>
            <Modal onClose={() => setSectionAlert3(false)} className={"flex justify-center items-center"} open={sectionAlert3}>
                <Box sx={{ width: 'auto', height: 'auto', borderRadius: 2 }} className={"bg-white p-3"}>
                    <h2 className={"flex justify-center pt-2 text-lg text-default font-medium"}>Atenção!</h2>
                    <p className={"flex justify-center items-center pt-8"}>Todas os itens dessa seção serão apagados!</p>
                    <div className={'flex justify-between gap-12 pt-6'}>
                        <button className={'p-3 transition-colors duration-300 bg-default/20 text-red-600 font-medium rounded-md hover:text-white hover:bg-default'} onClick={() => setSectionAlert3(false)}>Cancelar</button>
                        <button className={'p-3 transition-colors duration-300 bg-default/20 text-default font-medium rounded-md hover:text-white hover:bg-default'} onClick={() => {
                            delete_section()
                            setSectionAlert3(false)
                        }}>Confirmar</button></div>
                </Box>
            </Modal>
            <Modal onClose={() => setSectionAlert(false)} className={"flex justify-center items-center"} open={sectionAlert}>
                <Box sx={{ width: 400, height: 150, borderRadius: 2 }} className={"bg-white p-3"}>
                    <h2 className={"flex justify-center pt-2 text-lg text-default font-medium"}>Atenção!</h2>
                    <p className={"flex justify-center items-center pt-8"}>Já existe uma seção com este nome.</p>
                </Box>
            </Modal>
            <div className="fixed h-full w-full -z-10 opacity-5 bg-background bg-no-repeat bg-center bg-cover "></div>
            <Header page={`${id ? 'Editar seção: ' + id : "Adicionar seção"}`}/>
            <button className="flex text-white font-medium gap-3 fixed p-7" onClick={() => navigate(-1)}>Voltar</button>
            <div className="flex flex-1 overflow-auto h-full gap-12 mx-5">
                <div className="flex w-full justify-center">
                    <div className="flex relative flex-1 flex-col h-full max-w-[50rem]">
                        <div className="flex justify-center h-12 items-end">
                            <h1 className="flex font-bold text-lg">Seção</h1></div>
                        <div className="flex">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                submit()
                            }} className="flex w-full h-20 gap-3 pt-4 pb-4 border-b-2">
                                <input id="input" onChange={e => {
                                    setSectionName(e.target.value)}}
                                       className="w-full border-b-2 border-default focus:border-none focus:rounded-md outline-none bg-default/5 p-2"
                                       type="text" placeholder="Nome da seção"/>
                                <button disabled={sectionName === ""} className="font-bold transition-all px-2 rounded-md text-default hover:bg-default/30"
                                        type="submit">{id ? "Atualizar" : "Adicionar"}</button>
                            </form>
                        </div>
                        <div className={"flex pt-2 flex-col gap-2 pb-2 border-b-2"}>
                            <button disabled={!id} onClick={() => navigate(`/addItem/?section=${id}`)}
                                    className={`flex w-full transition-all disabled:bg-default/50 justify-center text-nowrap text-white p-3 hover:bg-default/60 bg-default rounded-md items-center gap-3`}>
                                <RiAddLine size={20}/>Adicionar item
                            </button>
                            <button onClick={handleDeleteItems} disabled={!id}
                                    className={`flex w-full transition-all disabled:bg-default/50 justify-center text-nowrap text-white p-3 hover:bg-default/60 bg-default rounded-md items-center gap-3`}>
                                <RiBrush2Line size={20}/> Limpar Seção
                            </button>
                            <button disabled={!id} onClick={() => handleDeleteSection()}
                                    className={`flex w-full transition-all disabled:bg-default/50 justify-center text-nowrap text-white p-3 hover:bg-red-800 bg-red-600 rounded-md items-center gap-3`}>
                                <RiDeleteBin2Line size={20}/>Apagar seção
                            </button>
                        </div>
                        {items.length !== 0 ? <ul className="flex overflow-y-scroll flex-1 flex-col py-3 mt-1 gap-1 items-center">
                            <h1 className="flex font-bold text-lg">Itens</h1>
                            <small className={"pb-3"}>Clique no item para editar</small>
                            {items.map((e) => {
                                return <ItemList setMarked={(e) => handleSetSelectItems(e)} key={e["id"]}
                                                 image={e["image"]} id={e.id} name={e.item_name} section={e["section"]}/>
                            })}
                        </ul> : <small className={"flex justify-center pb-3 pt-10"}>Nenhum item encontrado</small>}
                        {selectedItems.ids.length !== 0 &&
                            <div className={"flex relative pb-2 pt-2"}>
                                <button className={`fixe bottom-0 w-full transition-all disabled:bg-default/50 justify-center text-nowrap text-white p-3 hover:bg-red-800 bg-red-600 rounded-md items-center gap-3`} onClick={deleteItems}>Deletar items</button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddSections;
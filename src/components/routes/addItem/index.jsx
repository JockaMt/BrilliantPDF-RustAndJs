import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../header";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import DropdownMenu from "../../dropdownMenu/index.jsx";
import { RiImage2Line } from "react-icons/ri";
import { Box, Modal } from "@mui/material";
import InputNumber from "rc-input-number";
import "./index.css";

const AddItem = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const section = queryParams.get('section');
    const id  = queryParams.get('id')
    const navigate = useNavigate();
    const [sectionAlert, setSectionAlert] = useState(false);
    const [sections, setSections] = useState([]);

    const messages = ["Já existe um item com este id.", "Preencha os itens necessários: Imagem, Código e Seção"]
    const [msgIdx, setMsgIdx] = useState(0)

    const [item, setItem] = useState({
        image: "",
        id: "",
        item_name: "",
        section: "",
        gold_weight: "",
        gold_price: "",
        silver_weight: "",
        silver_price: "",
        loss: "",
        time: "",
    });

    const loadSections = async () => {
        const arr = await invoke("get_sections");
        const dict = arr.map((f) => ({
            name: `${f}`
        }));
        setSections(dict);
    };

    const submit = async () => {
        if (item.id && item.image && item.section) {
            item.id = Number(item.id)
            const itemExists = await invoke("check_item_exists", {id: item.id});
            if (itemExists && !id) {
                setMsgIdx(0)
                setSectionAlert(true);
            } else if (itemExists && id) {
                const newItem = {...item};
                Object.keys(newItem).forEach((key) => {
                    if (newItem[key] === "" && key !== "item_name") {
                        newItem[key] = 0;
                    }
                    if (key !== "item_name"  && key !== "image" && key !== "name" && key !== "section") {
                        newItem[key] = parseFloat(newItem[key])
                    }
                });
                await invoke("update_item", {item: newItem});
                navigate(-1);
            } else {
                const newItem = {...item};
                for (let i in newItem) {
                    if (newItem[i] === "" && i !== "image" && i !== "item_name" && i !== "id") {
                        newItem[i] = 0;
                    }
                }
                await invoke("insert_item", {item: newItem});
                navigate(-1);
            }
        } else {
            setMsgIdx(1)
            setSectionAlert(true);
        }
    };

    const handleInputChange = (e, input_id) => {
        if (Number(e)) {
            setItem((prevItem) => ({
                ...prevItem,
                [input_id]: Number(e),
            }));
        }
    };


    const handleDescriptionChange = (e) => {
        const { name, value } = e.target
        if (value) {
            setItem((prevItem) => ({
                ...prevItem,
                item_name: value.toString(),
            }));
        } else {
            setItem((prevItem) => ({
                ...prevItem,
                item_name: "",
            }));
        }
    };

    const handleSectionChange = (selectedSection) => {
        if (selectedSection) {
            setItem((prevItem) => ({
                ...prevItem,
                section: selectedSection,
            }));
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setItem((prevItem) => ({
                    ...prevItem,
                    image: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (id) {
            invoke("get_item", {id: id}).then((data)=>{
                setItem((prevState) => ({
                    ...prevState,
                    ...(data.image !== 0 && { image: data.image }),
                    ...(data.id !== 0 && { id: data.id }),
                    ...(data.item_name !== 0 && { item_name: data.item_name }),
                    ...(data.section !== 0 && { section: data.section }),
                    ...(data.gold_weight !== 0 && { gold_weight: data.gold_weight }),
                    ...(data.gold_price !== 0 && { gold_price: data.gold_price }),
                    ...(data.silver_weight !== 0 && { silver_weight: data.silver_weight }),
                    ...(data.silver_price !== 0 && { silver_price: data.silver_price }),
                    ...(data.loss !== 0 && { loss: data.loss }),
                    ...(data.time !== 0 && { time: data.time }),
                }));
            })
        }
        handleSectionChange(section)
        loadSections();
    }, []);

    return (
        <div className="flex flex-col h-full w-full">
            <Modal onClose={() => setSectionAlert(false)} className={"flex justify-center items-center"} open={sectionAlert}>
                <Box sx={{ width: 400, height: msgIdx === 0 ? 150 : 175, borderRadius: 2 }} className={"bg-white p-3"}>
                    <h2 className={"flex justify-center pt-2 text-lg text-default font-medium"}>Atenção!</h2>
                    <p className={"flex text-center justify-center items-center pt-8"}>{messages[msgIdx]}</p>
                </Box>
            </Modal>
            <div className="fixed h-full w-full -z-10 opacity-5 bg-background bg-no-repeat bg-center bg-cover"></div>
            <Header page={"Adicionar item"} />
            <button className="flex text-white font-medium gap-3 fixed p-7" onClick={() => navigate(-1)}>Voltar</button>
            <div className="flex-1 overflow-auto h-full gap-12 justify-center items-center">
                <div className="flex h-full">
                    <div className="flex flex-col pt-12 mx-12 w-full items-center">
                        <h2 className="flexpt-12 text-lg font-bold">{id ? "Editar item" : "Novo item"}</h2>
                        <small className="flex w-full max-w-[50rem] text-center justify-center border-b-2 mx-12 pb-3">Preencha os campos obrigatórios <br/>(Use ponto para separar as casas decimais)</small>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            submit();
                        }} className="flex gap-3 flex-col w-full max-w-[50rem] py-3">
                            <label
                                className="flex overflow-hidden items-center gap-2 w-full text-nowrap border-b-2 hover:cursor-pointer hover:bg-default/20 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none bg-default/5 p-2"
                                htmlFor={"input-file"}>
                                <input
                                    name={"image"}
                                    onChange={handleImageChange}
                                    className={"hidden overflow-hidden text-wrap"}
                                    id="input-file"
                                    accept={"image/*"}
                                    type={"file"}
                                    alt=""/>
                                {item.image ? <img alt={"icon"} className={"flex w-8 h-6 object-cover"} src={item.image.split(`\\`).pop()}/> : <RiImage2Line color={"#115f5f"}/>}Escolher imagem
                            </label>
                            <InputNumber
                                id={"id"}
                                style={{margin: 0, padding: 0, height: "2.7rem"}}
                                value={item.id}
                                onChange={(e) => handleInputChange(e, "id")}
                                className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none hover:bg-default/20 bg-default/5  p-2"
                                type="text" placeholder="Código do item"/>
                            <input
                                name={"item_name"}
                                value={item.item_name}
                                onChange={handleDescriptionChange}
                                className="w-full border-b-2 border-default outline-none hover:bg-default/20 bg-default/5  p-2"
                                type="text" placeholder="Descrição do item"/>
                            <DropdownMenu onSelect={handleSectionChange} id="dropdown" initial={section}
                                          options={sections}/>
                            <InputNumber
                                id={"gold_weight"}
                                value={item.gold_weight}
                                style={{margin: 0, padding: 0, height: "2.7rem"}}
                                onChange={(e) => handleInputChange(e, "gold_weight")}
                                className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none hover:bg-default/20 bg-default/5 p-2"
                                inputMode={"decimal"}
                                precision={2}
                                placeholder="Peso em ouro"/>
                            <InputNumber
                                id={"gold_price"}
                                style={{margin: 0, padding: 0, height: "2.7rem"}}
                                value={item.gold_price}
                                onChange={(e) => handleInputChange(e, "gold_price")}
                                className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none hover:bg-default/20 bg-default/5 p-2"
                                inputMode={"decimal"}
                                precision={2}
                                placeholder="Preço do ouro"/>
                            <InputNumber
                                id={"silver_weight"}
                                style={{margin: 0, padding: 0, height: "2.7rem"}}
                                value={item.silver_weight}
                                onChange={(e) => handleInputChange(e, "silver_weight")}
                                className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none hover:bg-default/20 bg-default/5 p-2"
                                inputMode={"decimal"}
                                precision={2}
                                placeholder="Peso em prata"/>
                            <InputNumber
                                id={"silver_price"}
                                style={{margin: 0, padding: 0, height: "2.7rem"}}
                                value={item.silver_price}
                                onChange={(e) => handleInputChange(e, "silver_price")}
                                className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none hover:bg-default/20 bg-default/5 p-2"
                                inputMode={"decimal"}
                                precision={2}
                                placeholder="Preço da prata"/>
                            <InputNumber
                                id={"loss"}
                                style={{margin: 0, padding: 0, height: "2.7rem"}}
                                value={item.loss}
                                onChange={(e) => handleInputChange(e, "loss")}
                                className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none hover:bg-default/20 bg-default/5 p-2"
                                inputMode={"numeric"}
                                placeholder="Perda de material (em porcentagem)"/>
                            <InputNumber
                                id={"time"}
                                style={{margin: 0, padding: 0, height: "2.7rem"}}
                                value={item.time}
                                precision={0}
                                onChange={(e) => handleInputChange(e, "time")}
                                className="w-full border-b-2 border-default focus:border-none focus:rounded-md focus:mb-[2px] outline-none hover:bg-default/20 bg-default/5  p-2"
                                inputMode={"numeric"} placeholder="Tempo de produção (em dias)"/>
                            <button
                                className="text-default transition-all font-medium p-2 hover:bg-default/40 rounded-md"
                                type="submit">Salvar
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddItem;

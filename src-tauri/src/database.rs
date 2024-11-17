use rusqlite::{params, Connection, Error, Result};
use serde::{Serialize, Deserialize};
use rfd::FileDialog;
use mongodb::{
    bson::{Document, doc},
    {Client, Collection}
};
use mongodb::options::ClientOptions;
use futures_util::stream::StreamExt;

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct Item {
    pub(crate) id: i32,
    pub(crate) item_name: String,
    pub(crate) section: String,
    pub(crate) gold_weight: u32,
    pub(crate) gold_price: u32,
    pub(crate) silver_weight: u32,
    pub(crate) silver_price: u32,
    pub(crate) loss: u32,
    pub(crate) time: u32,
    pub(crate) image: String,
}

pub async fn mongodb_connection() -> Result<Vec<Document>> {
    let uri = "mongodb+srv://brilliantSoftware:vLwpd9MOIUUQFuk4@brilliantpdfsupponsers.ahfka.mongodb.net/?retryWrites=true&w=majority&tls=true";

    let client_options = ClientOptions::parse(uri)
        .await.expect(""); // Mapeia o erro para String

    let client = Client::with_options(client_options)
        .map_err(|e| e.to_string()).expect("");

    let database = client.database("supponser_list");
    let collection: Collection<Document> = database.collection("supponsers");

    let mut cursor = collection.find(None, None)
        .await.expect("");

    let mut documents = Vec::new();

    while let Some(result) = cursor.next().await {
        match result {
            Ok(document) => documents.push(document.clone()),
            Err(e) => eprintln!("Erro ao processar documento: {:?}", e),
        }
    }
    Ok(documents)
}

fn connection() -> Result<Connection> {
    let connection_result = Connection::open("./src/database.db");
    match connection_result {
        Ok(connection) => {
            // Criação das tabelas
            connection.execute("
                CREATE TABLE IF NOT EXISTS sections (
                    name TEXT PRIMARY KEY NOT NULL
                )
            ", [])?;

            connection.execute("
                CREATE TABLE IF NOT EXISTS items (
                    id              INTEGER PRIMARY KEY,
                    item_name       TEXT DEFAULT '',
                    section         TEXT NOT NULL,
                    gold_weight     INTEGER,
                    gold_price      INTEGER,
                    silver_weight   INTEGER,
                    silver_price    INTEGER,
                    loss            INTEGER,
                    time            INTEGER,
                    image           TEXT,
                    FOREIGN KEY (section) REFERENCES sections(name) ON DELETE CASCADE
                )
            ", [])?;

            connection.execute("
                CREATE TABLE IF NOT EXISTS info (
                    name            TEXT PRIMARY KEY,
                    info            TEXT NOT NULL
                )
            ", [])?;

            // Insere os valores padrão na tabela 'info' se não existirem
            let default_values = [
                ("name", ""),
                ("save_path", ""),
                ("pallet", "0"),
                ("phone", ""),
                ("logo", "")
            ];

            for (key, value) in default_values.iter() {
                let query = "INSERT OR IGNORE INTO info (name, info) VALUES (?, ?)";
                connection.execute(query, &[key, value])?;
            }

            Ok(connection)
        }
        Err(e) => Err(e),
    }
}

pub fn insert_section(section: &str) -> Result<()> {
    let connection = connection()?;
    // Tenta inserir a seção, ignorando se já existir (por causa do `INSERT OR IGNORE`)
    connection.execute(
        "INSERT OR IGNORE INTO sections (name) VALUES (?1)",
        params![section],
    )?;
    println!("Banc!");
    Ok(())
}

pub fn update_section(new_name: &str, section: &str) -> Result<()> {
    // Cria a conexão e inicia a transação
    let mut connection = connection()?;
    let transaction = connection.transaction()?;

    // 1. Cria a seção temporária `temp`
    transaction.execute("INSERT INTO sections (name) VALUES ('temp')", [])?;

    // 2. Move todos os itens da seção antiga para a seção temporária
    transaction.execute(
        "UPDATE items SET section = 'temp' WHERE section = ?1",
        params![section],
    )?;

    // 3. Atualiza o nome da seção original
    transaction.execute(
        "UPDATE sections SET name = ?1 WHERE name = ?2",
        params![new_name, section],
    )?;

    // 4. Move os itens de volta para a nova seção
    transaction.execute(
        "UPDATE items SET section = ?1 WHERE section = 'temp'",
        params![new_name],
    )?;

    // 5. Exclui a seção temporária `temp`
    transaction.execute("DELETE FROM sections WHERE name = 'temp'", [])?;

    // 6. Confirma a transação
    transaction.commit()?;

    Ok(())
}



pub fn get_sections() -> Result<Vec<String>, String> {
    let mut sections: Vec<String> = Vec::new();
    let connection = connection().map_err(|e| e.to_string())?;
    let mut stmt = connection.prepare("SELECT name FROM sections").map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], |row| {
        let name: String = row.get(0)?;
        Ok(name)
    }).map_err(|e| e.to_string())?;
    for row in rows {
        match row {
            Ok(name) => {
                sections.push(name)
            },
            Err(e) => eprintln!("Erro ao obter seção: {}", e),
        }
    }
    Ok(sections)
}

pub fn delete_section(name: &str) -> Result<()> {
    let connection = connection()?;
    connection.execute("DELETE FROM sections WHERE name = ?1", params![name])?;
    Ok(())
}

pub fn check_section_exists(section: &str) -> Result<bool> {
    let connection = connection()?;  // Assumindo que você tem uma função `connection`

    let mut stmt = connection.prepare("SELECT name FROM sections WHERE name = ?1")?;

    // Verifica se existe alguma linha que corresponde ao nome da seção
    let section_exists = stmt.exists(params![section])?;

    Ok(section_exists)
}

pub fn get_items_in_section(section_name: &str) -> Result<Vec<Item>, String> {
    // Obtendo a conexão com o banco de dados
    let connection = connection().map_err(|e| e.to_string())?;

    // Preparando a query SQL
    let mut stmt = connection.prepare(
        "SELECT id, item_name, section, gold_weight, gold_price, silver_weight, silver_price, loss, time, image
        FROM items
        WHERE section = ?1"
    ).map_err(|e| e.to_string())?;

    // Executando a query e mapeando os resultados para objetos Item
    let rows = stmt.query_map([section_name], |row| {
        Ok(Item {
            id: row.get(0)?,
            item_name: row.get(1)?,
            section: row.get(2)?,
            gold_weight: row.get(3)?,
            gold_price: row.get(4)?,
            silver_weight: row.get(5)?,
            silver_price: row.get(6)?,
            loss: row.get(7)?,
            time: row.get(8)?,
            image: row.get(9)?,
        })
    }).map_err(|e| e.to_string())?;
    let mut items_in_section: Vec<Item> = Vec::new();
    for item in rows {
        items_in_section.push(item.map_err(|e| e.to_string())?);
    }
    Ok(items_in_section)
}

pub fn get_item(id: &str) -> Result<Item> {
    let connection = connection()?;

    // Executa a consulta para obter um único item com o id fornecido
    connection.query_row(
        "SELECT id, item_name, section, gold_weight, gold_price, silver_weight, silver_price, loss, time, image FROM items WHERE id = ?1",
        params![id],
        |row| {
            Ok(Item {
                id: row.get(0)?,
                item_name: row.get(1)?,
                section: row.get(2)?, // Alterado para row.get(2) (antes estava 1)
                gold_weight: row.get(3)?,
                gold_price: row.get(4)?,
                silver_weight: row.get(5)?,
                silver_price: row.get(6)?,
                loss: row.get(7)?,
                time: row.get(8)?,
                image: row.get(9)?,
            })
        },
    )
}

pub fn insert_item(item: &Item) -> Result<()> {
    let connection = connection().unwrap();
    insert_section(&item.section)?;
    if item.id != 0 && item.section != "" && item.image != "" {
    connection.execute(
            "INSERT OR IGNORE INTO items (
                id, item_name, section, gold_weight, gold_price, silver_weight, silver_price, loss, time, image
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                item.id,
                item.item_name,
                item.section,
                item.gold_weight,
                item.gold_price,
                item.silver_weight,
                item.silver_price,
                item.loss,
                item.time,
                item.image,
            ],
        )?;
        println!("Item inserido com sucesso!");
    } else {
        println!("Item não inserido!");
    }
    Ok(())
}

pub fn update_item(item: Item) -> Result<()> {
    let connection = connection()?; // Get a database connection
    connection.execute(
        "   UPDATE items SET
                section = ?1,
                item_name = ?2,
                gold_weight = ?3,
                gold_price = ?4,
                silver_weight = ?5,
                silver_price = ?6,
                loss = ?7,
                time = ?8,
                image = ?9
                WHERE id = ?10;
            ",
        params![
            item.section,
            item.item_name,
            item.gold_weight,
            item.gold_price,
            item.silver_weight,
            item.silver_price,
            item.loss,
            item.time,
            item.image,
            item.id
        ],
    )?;
    Ok(())
}

pub fn delete_item(item_id: i32) -> Result<()> {
    let connection = connection()?;
    connection.execute("DELETE FROM items WHERE id = ?1", params![item_id])?;
    Ok(())
}

pub fn delete_all_items(section_name: &str) -> Result<()> {
    let connection = connection()?;
    connection.execute("DELETE FROM items WHERE section = ?1", params![section_name])?;
    Ok(())
}

pub fn check_item_exists(id: i32) -> Result<bool> {
    let connection = crate::database::connection()?;
    let mut stmt = connection.prepare("SELECT id FROM items WHERE id = ?1")?;
    let section_exists = stmt.exists(params![id])?;
    Ok(section_exists)
}

pub fn change_info(name: String, info: String) -> Result<()> {
    let connection = connection()?;
    let updated_rows = connection.execute(
        "UPDATE info SET info = ?1 WHERE name = ?2",
        params![info, name]
    )?;
    if updated_rows == 0 {
        connection.execute(
            "INSERT INTO info (name, info) VALUES (?1, ?2)",
            params![name, info]
        )?;
    }
    Ok(())
}

pub fn get_info(name: &str) -> Result<String> {
    let connection = connection()?;
    let mut stmt = connection.prepare("SELECT info FROM info WHERE name = ?1")?;
    let result = stmt.query_row(params![name], |row| {
        row.get(0)
    }).or_else(|err| {
        if let Error::QueryReturnedNoRows = err {
            Ok("0".to_string())  // Retorna "0" como string padrão
        } else {
            Err(err)  // Propaga outros erros
        }
    })?;
    Ok(result)
}

pub fn drop_tables() -> Result<()> {
    let connection = connection()?;
    connection.execute("DELETE FROM sections", params![])?;
    Ok(())
}

pub fn choose_save_location() {
    let file_path = FileDialog::new()
        .set_title("Escolha onde salvar o arquivo")
        .pick_folder();

    match file_path {
        Some(ref path) => {
            let path_dir = path.to_string_lossy().to_string();
            let _ = change_info("save_path".to_string(), path_dir);
        }
        None => {
            println!("Nenhuma pasta foi escolhida.");
        }
    }
}

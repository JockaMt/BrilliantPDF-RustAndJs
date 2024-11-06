use rusqlite::{params, Connection, Error, Result};
use serde::{Serialize, Deserialize};
use rfd::FileDialog;

#[derive(Serialize, Deserialize, Debug)]
pub(crate) struct Item {
    pub(crate) id: i32,
    pub(crate) section: String,
    pub(crate) gold_weight: u32,
    pub(crate) gold_price: u32,
    pub(crate) silver_weight: u32,
    pub(crate) silver_price: u32,
    pub(crate) loss: u32,
    pub(crate) time: u32,
    pub(crate) image: String,
}

fn connection() -> Result<Connection> {
    let connection_result = Connection::open("./src/database.db");
    match connection_result {
        Ok(connection) => {
            connection.execute("
                CREATE TABLE IF NOT EXISTS sections (
                    name TEXT PRIMARY KEY NOT NULL
                )
            ", [])?;
            connection.execute("
                CREATE TABLE IF NOT EXISTS items (
                    id              INTEGER PRIMARY KEY,
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
            Ok(connection)
        }
        Err(e) => {
            Err(e)
        }
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
    let connection = connection()?;
    connection.execute("UPDATE sections SET name = ?1 WHERE name = ?2", params![new_name, section])?;
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
    let connection = crate::database::connection()?;  // Assumindo que você tem uma função `connection`

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
        "SELECT id, section, gold_weight, gold_price, silver_weight, silver_price, loss, time, image
        FROM items
        WHERE section = ?1"
    ).map_err(|e| e.to_string())?;

    // Executando a query e mapeando os resultados para objetos Item
    let rows = stmt.query_map([section_name], |row| {
        Ok(Item {
            id: row.get(0)?,
            section: row.get(1)?,
            gold_weight: row.get(2)?,
            gold_price: row.get(3)?,
            silver_weight: row.get(4)?,
            silver_price: row.get(5)?,
            loss: row.get(6)?,
            time: row.get(7)?,
            image: row.get(8)?,
        })
    }).map_err(|e| e.to_string())?;
    let mut items_in_section: Vec<Item> = Vec::new();
    for item in rows {
        items_in_section.push(item.map_err(|e| e.to_string())?);
    }
    Ok(items_in_section)
}

pub fn insert_item(item: &Item) -> Result<()> {
    let connection = connection().unwrap();
    insert_section(&item.section)?;
    if item.id != 0 && item.section != "" && item.image != "" {
    connection.execute(
            "INSERT OR IGNORE INTO items (
                id, section, gold_weight, gold_price, silver_weight, silver_price, loss, time, image
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                item.id,
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

pub fn choose_save_location() -> Option<String> {
    let file_path = FileDialog::new()
        .set_title("Escolha onde salvar o arquivo")
        .save_file();

    match file_path {
        Some(path) => Some(path.to_string_lossy().to_string()),
        None => None,
    }
}
use rusqlite::{params, Connection, Result};

pub(crate) struct Item {
    id: i32,
    section: String,
    gold_weight: u32,
    gold_price: u32,
    silver_weight: u32,
    silver_price: u32,
    loss: u32,
    time: u32,
    image: String,
}

fn connection() -> Result<Connection> {
    let connection_result = Connection::open("database.db");

    match connection_result {
        Ok(connection) => {
            println!("Banco de dados conectado com sucesso!");

            // Tabela `sections` com a chave primária como `name`
            connection.execute("
                CREATE TABLE IF NOT EXISTS sections (
                    name TEXT PRIMARY KEY NOT NULL
                )
            ", [])?;

            // Tabela `items` usando o nome da `section` como chave estrangeira
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
            Ok(connection)
        }
        Err(e) => {
            println!("Ocorreu um erro na conexão com o banco de dados: {}", e);
            Err(e)
        }
    }
}

pub fn insert_section(section: &String, connection: &Connection) -> Result<()> {
    // Inserimos a seção diretamente pelo nome, pois agora o `name` é a chave primária
    connection.execute(
        "INSERT OR IGNORE INTO sections (name) VALUES (?1)",
        params![section],
    )?;
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

pub fn get_items_in_section(name: &str) -> Result<Vec<String>, String> {
    let connection = connection().map_err(|e| e.to_string())?;
    let mut stmt = connection.prepare("SELECT item_name FROM items WHERE section = ?1")
        .map_err(|e| e.to_string())?;
    let rows = stmt.query_map([name], |row| {
        let item_name: String = row.get(0)?;
        Ok(item_name)
    }).map_err(|e| e.to_string())?;
    let mut items_in_section: Vec<String> = Vec::new();
    for item in rows {
        items_in_section.push(item.map_err(|e| e.to_string())?);
    }
    Ok(items_in_section)
}

pub fn insert_item(item: &Item) -> Result<()> {
    let connection = connection().unwrap();
    insert_section(&item.section, &connection)?;

    connection.execute(
        "INSERT INTO items (
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
    Ok(())
}

pub fn run() {
    let connection = connection().unwrap();
}
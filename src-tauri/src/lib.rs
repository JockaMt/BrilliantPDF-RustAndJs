use crate::database::Item;

mod generate_pdf;
mod database;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn generate_pdf() {
    let path: &str = "catálogo";
    let file = generate_pdf::gen(path.to_owned() + ".pdf").expect("");
    println!("Cod: {file} | arquivo salvo!")
    
}

#[tauri::command]
fn get_sections() -> Result<Vec<String>, String> {
    Ok(database::get_sections().expect(""))
}

#[tauri::command]
fn get_items( section: &str ) -> Result<Vec<String>, String> {Ok(database::get_items_in_section(section)?)}

#[tauri::command]
fn insert_items( section: &str, item: &Item ) -> Result<(), String> {Ok(database::insert_item(item).unwrap())}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    database::run();
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler!
            [
                generate_pdf,
                get_sections,
                get_items
            ]
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    
}

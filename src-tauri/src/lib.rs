use tauri::{Manager, Window};
use crate::database::Item;

mod generate_pdf;
mod database;


#[tauri::command]
fn generate_pdf() { generate_pdf::python_gen(); }

#[tauri::command]
fn get_items_in_section( section: &str ) -> Result<Vec<Item>, String> {Ok(database::get_items_in_section(section)?)}

#[tauri::command]
fn insert_item( item: Item ) -> Result<(), String> {Ok(database::insert_item(&item).unwrap())}

#[tauri::command]
fn delete_item(item_id: i32) -> Result<(), String> {Ok(database::delete_item(item_id).expect(""))}

#[tauri::command]
fn delete_all_items(section : &str) -> Result<(), String> { Ok(database::delete_all_items(section).expect("")) }

#[tauri::command]
fn get_sections() -> Result<Vec<String>, String> { Ok(database::get_sections().expect("")) }

#[tauri::command]
fn insert_section( section: &str ) { database::insert_section(section).expect("") }

#[tauri::command]
fn update_section(  new_section: &str, section: &str ) { database::update_section(new_section, section).expect("") }

#[tauri::command]
fn delete_section(  section: &str ) { database::delete_section(section).expect("") }

#[tauri::command]
fn check_section_exists( section: &str ) -> bool { database::check_section_exists(section).expect("") }

#[tauri::command]
fn check_item_exists( id: i32 ) -> bool { database::check_item_exists(id).expect("") }

#[tauri::command]
fn update_info (name :String, info: String) {database::change_info(name, info).unwrap()}

#[tauri::command]
fn get_info (name :&str) -> String {database::get_info(name).expect("")}

#[tauri::command]
fn delete_all_sections () -> Result<(), String> { Ok(database::drop_tables().expect("")) }

#[tauri::command]
fn where_save () { database::choose_save_location(); }

#[tauri::command]
fn get_item (id: &str) -> Result<Item, String> { Ok(database::get_item(id).expect("")) }

#[tauri::command]
fn update_item (item: Item) -> Result<(), String> { Ok(database::update_item(item).expect(""))}

#[tauri::command]
fn close_splashscreen(window: Window) {
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.close().unwrap();
    }
    window.get_window("main").unwrap().show().unwrap();
}

#[tauri::command]
fn export_database() -> Result<(), String> { Ok(database::export_database().expect("")) }

#[tauri::command]
fn import_database() { database::import_database(); }

#[tauri::command]
fn open_email_report() {
    webbrowser::open("https://wa.me/5528981137532").expect("TODO: panic message");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler!
            [
                generate_pdf,
                insert_section,
                get_sections,
                delete_section,
                check_section_exists,
                update_section,
                get_items_in_section,
                insert_item,
                delete_item,
                check_item_exists,
                update_info,
                get_info,
                delete_all_items,
                delete_all_sections,
                where_save,
                get_item,
                update_item,
                close_splashscreen,
                export_database,
                import_database,
                open_email_report,
            ]
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

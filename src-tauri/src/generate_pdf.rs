use crate::database;
use rfd::MessageDialog;
use std::path::Path;
use std::process::Command;

pub fn python_gen() {
    if let Ok(logo_data) = database::get_info("logo") {
        let Ok(pdf_path) = database::get_info("save_path") else {
            return;
        };
        let Ok(name) = database::get_info("name") else {
            return;
        };
        let Ok(phone) = database::get_info("phone") else {
            return;
        };
        if !logo_data.is_empty() && !pdf_path.is_empty() && !name.is_empty() && !phone.is_empty() {
            // Define the path to the .exe executable and the arguments to pass
            let exe_path = "src/gen_pdf.exe";
            let save_path = database::get_info("save_path").unwrap_or_default();
            let color = database::get_info("pallet").unwrap_or_default();

            // Create the command to execute the program with the arguments
            let output = Command::new(exe_path)
                .arg(&save_path)  // This is the 'local' positional argument
                .arg("--color1")  // The flag
                .arg(&color)      // The color value in "R,G,B" format
                .output()
                .expect("Failed to execute the program");

            // Check if the save_path directory exists
            if Path::new(&save_path).exists() {
                let pdf_path = format!("{}/Brilliant_Catalog.pdf", save_path); // Generate the PDF path
                webbrowser::open(&pdf_path).expect("Error opening file!");
            }

            // Display the output of the .exe program (if any)
            println!("Status: {}", output.status);
            println!("Output: {}", String::from_utf8_lossy(&output.stdout));
            println!("Errors: {}", String::from_utf8_lossy(&output.stderr));
        } else {
            let field_message1 = if name.is_empty() { "\nName" } else { "" };
            let field_message2 = if phone.is_empty() { "\nContact" } else { "" };
            let field_message3 = if logo_data.is_empty() { "\nImage" } else { "" };
            let field_message4 = if pdf_path.is_empty() {
                "\nSave location"
            } else {
                ""
            };
            let text = format!(
                "You need to fill in the profile information before proceeding.\n\nFill in the fields:\n{}{}{}{}",
                field_message1,
                field_message2,
                field_message3,
                field_message4
            );
            MessageDialog::new()
                .set_title("Attention")
                .set_description(text)
                .set_buttons(rfd::MessageButtons::Ok)
                .show();
        }
    } else {
        // Show popup if unable to retrieve information
        MessageDialog::new()
            .set_title("Error")
            .set_description("Could not access profile information.")
            .set_buttons(rfd::MessageButtons::Ok)
            .show();
    }
}
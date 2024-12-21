use std::path::Path;
use std::process::Command;
use crate::database;
use rfd::MessageDialog;

pub fn python_gen() {
    if let Ok(logo_data) = database::get_info("logo") {
        let Ok(pdf_path) = database::get_info("save_path") else { return };
        let Ok(name) = database::get_info("name") else { return };
        let Ok(phone) = database::get_info("phone") else { return };
        if !logo_data.is_empty() && !pdf_path.is_empty() && !name.is_empty() && !phone.is_empty() {
            // Defina o caminho para o executável .exe e os argumentos que deseja passar
            let exe_path = "src/gen_pdf.exe";
            let save_path = database::get_info("save_path").unwrap_or_default(); // Obtém o caminho de save_path
            let args = [&save_path]; // Argumentos corrigidos

            // Cria o comando para executar o programa com os argumentos
            let output = Command::new(exe_path)
                .args(&args)
                .output() // Executa o comando e captura a saída
                .expect("Falha ao executar o programa");

            // Verifica se o diretório de save_path existe
            if Path::new(&save_path).exists() {
                let pdf_path = format!("{}/Brilliant_Catalog.pdf", save_path); // Gera o caminho do PDF
                webbrowser::open(&pdf_path).expect("Erro ao abrir arquivo!");
            }

            // Exibe a saída do programa .exe (se houver)
            println!("Status: {}", output.status);
            println!("Saída: {}", String::from_utf8_lossy(&output.stdout));
            println!("Erros: {}", String::from_utf8_lossy(&output.stderr));
        } else {
            let field_message1 = if name.is_empty() { "\nNome" } else { "" };
            let field_message2 = if phone.is_empty() { "\nContato" } else { "" };
            let field_message3 = if logo_data.is_empty() { "\nImagem" } else { "" };
            let field_message4 = if pdf_path.is_empty() { "\nOnde salvar" } else { "" };
            let text = format!(
                "Você precisa preencher as informações de perfil antes de continuar.\n\nPreencha os campos:\n{}{}{}{}",
                field_message1,
                field_message2,
                field_message3,
                field_message4
            );
            MessageDialog::new()
                .set_title("Atenção")
                .set_description(text)
                .set_buttons(rfd::MessageButtons::Ok)
                .show();
        }
    } else {
        // Mostrar popup caso não consiga obter informações
        MessageDialog::new()
            .set_title("Erro")
            .set_description("Não foi possível acessar as informações de perfil.")
            .set_buttons(rfd::MessageButtons::Ok)
            .show();
    }
}
use std::path::Path;
use std::process::Command;
use crate::database;

pub fn python_gen() {
    // Defina o caminho para o executável .exe e os argumentos que deseja passar
    let exe_path = "src/gen_pdf.exe";
    let save_path = database::get_info("save_path").unwrap(); // Obtém o caminho de save_path
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
}
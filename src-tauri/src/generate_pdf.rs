use std::process::Command;


pub fn python_gen(){
    // Defina o caminho para o executável .exe e os argumentos que deseja passar
    let exe_path = "src/gen_pdf.exe";
    let args = ["src/database.db"]; // Removido espaço antes

    // Cria o comando para executar o programa com os argumentos
    let output = Command::new(exe_path)
        .args(&args)
        .output() // executa o comando e captura a saída
        .expect("Falha ao executar o programa");

    // Exibe a saída do programa .exe (se houver)
    println!("Status: {}", output.status);
    println!("Saída: {}", String::from_utf8_lossy(&output.stdout));
    println!("Erros: {}", String::from_utf8_lossy(&output.stderr));

    webbrowser::open("Saved.pdf").expect("Erro ao browser!");
}

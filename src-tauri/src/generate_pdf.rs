use std::env;
use genpdf::{elements, error::Error};
use webbrowser;

pub fn gen(title: String) -> Result<i8, Error> {
    // Obtém o diretório atual
    let current_dir = env::current_dir().expect("Erro ao obter o diretório atual");

    // Cria o caminho para a pasta das fontes
    let font_dir = current_dir.join("src/fonts");

    // Verifica se o arquivo da fonte existe
    // Carrega a fonte
    let font_family = genpdf::fonts::from_files(font_dir, "Nexa-Heavy", None)
        .expect("Erro ao carregar a fonte");

    // Criar um novo documento com a fonte carregada
    let mut doc = genpdf::Document::new(font_family);

    // Definir o título do documento
    
    doc.set_title("Catálogo");

    // Adicionar um cabeçalho (opcional)
    doc.push(elements::Paragraph::new("Cabeçalho do Catálogo"));

    // Adicionar algum conteúdo ao documento
    doc.push(elements::Paragraph::new("Este é o conteúdo do PDF."));

    // Adicionar uma nova página (opcional)
    doc.push(elements::Break::new(1));

    // Adicionar mais conteúdo na nova página
    doc.push(elements::Paragraph::new("Segunda página do PDF."));

    if let Some(downloads_dir) = dirs::download_dir() {
        println!("O caminho da pasta de Downloads é: {:?}", downloads_dir);
        doc.render_to_file(downloads_dir.join(title.clone())).expect("Falha ao gerar PDF");
        webbrowser::open(downloads_dir.join(title.clone()).to_str().unwrap()).unwrap();
    } else {
        println!("Não foi possível encontrar a pasta de Downloads.");
    }
    // Salvar o PDF em um arquivo
    Ok(1)
}
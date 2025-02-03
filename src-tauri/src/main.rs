// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{env, fs, io};
use std::fs::Permissions;
use std::path::{Path, PathBuf};
use std::process::Command;
use sha2::{Sha256, Digest};
use sysinfo::{System};
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::Aead;
use aes_gcm::KeyInit;
use hex;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct HWIDData {
    encrypted_hwid: String,
}

fn set_file_read_only(file_path: &Path) -> io::Result<()> {
    // Comando para definir o arquivo como somente leitura no Windows
    let file_path_str = file_path.to_str().unwrap_or_default();
    Command::new("cmd")
        .args(&["/C", "attrib", "+R", file_path_str])
        .output()?;
    Ok(())
}

fn get_hwid_file_path() -> PathBuf {
    let current_dir = env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    current_dir.join("hash.json")
}

// 🔑 Gera um HWID baseado no hardware do sistema
fn generate_hwid() -> String {
    let mut system = System::new_all();
    system.refresh_all();

    // Obtém o nome do primeiro processador
    let cpu_name = system.cpus().first().map(|cpu| cpu.brand()).unwrap_or("Unknown").to_string();

    // Cria o hash apenas com o nome do processador
    let mut hasher = Sha256::new();
    hasher.update(cpu_name);
    format!("{:x}", hasher.finalize()) // Retorna o hash do HWID
}


// 🔒 Criptografa o HWID usando AES-256-GCM
fn encrypt_hwid(hwid: &str, key: &[u8; 32]) -> Option<String> {
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));

    // Nonce fixo (⚠ menos seguro, mas mantém a saída constante)
    let nonce_bytes = [0u8; 12];
    let nonce = Nonce::from_slice(&nonce_bytes);

    match cipher.encrypt(nonce, hwid.as_bytes()) {
        Ok(ciphertext) => Some(hex::encode(ciphertext)),
        Err(_) => None,
    }
}

// 💾 Salva o HWID criptografado no JSON
fn save_to_json(encrypted_hwid: &str) -> std::io::Result<()> {
    let file_path = get_hwid_file_path();

    let hwid_data = HWIDData {
        encrypted_hwid: encrypted_hwid.to_string(),
    };

    let json_data = serde_json::to_string_pretty(&hwid_data).unwrap();
    fs::write(&file_path, json_data)?;
    set_file_read_only(&file_path)?;

    Ok(())
}

// 📖 Lê o HWID criptografado salvo no JSON
fn read_hwid_from_json() -> Option<String> {
    let file_path = get_hwid_file_path();

    if file_path.exists() {
        match fs::read_to_string(&file_path) {
            Ok(json_data) => {
                if let Ok(hwid_data) = serde_json::from_str::<HWIDData>(&json_data) {
                    return Some(hwid_data.encrypted_hwid);
                }
            }
            Err(_) => return None,
        }
    }
    None
}

// ✅ Verifica se o HWID atual corresponde ao salvo
fn check_hwid_match(encrypted_hwid: &str) -> bool {
    if let Some(saved_hwid) = read_hwid_from_json() {
        return saved_hwid == encrypted_hwid;
    }
    false
}

fn main() {
    match encrypt_hwid(generate_hwid().as_str(), &[0x00; 32]) {
        Some(encrypted_hwid) => {
            if let Some(saved_hwid) = read_hwid_from_json() {
                // Se o HWID salvo for diferente do atual, encerramos o programa
                if saved_hwid != encrypted_hwid {
                    std::process::exit(0);
                } else {
                    brilliantpdf_lib::run();
                }
            } else {
                if let Err(e) = save_to_json(&encrypted_hwid) {
                    eprintln!("Erro ao salvar o JSON: {}", e);
                } else {
                    brilliantpdf_lib::run();
                }
            }
        }
        None => ()
    }
}

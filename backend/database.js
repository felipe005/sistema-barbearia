const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("barbearia.db");

// Barbearias
db.run(`
    CREATE TABLE IF NOT EXISTS barbearias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT
    )
`);

// Usuários (barbeiros)
db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT,
        senha TEXT,
        barbearia_id INTEGER
    )
`);

// Agendamentos
db.run(`
    CREATE TABLE IF NOT EXISTS agendamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        whatsapp TEXT,
        servico TEXT,
        data TEXT,
        horario TEXT,
        barbearia_id INTEGER
    )
`);

module.exports = db;

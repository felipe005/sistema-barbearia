const sqlite3 = require("sqlite3").verbose();

// Cria / abre o banco
const db = new sqlite3.Database("barbearia.db");

// Tabela de agendamentos
db.serialize(() => {
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
});

module.exports = db;

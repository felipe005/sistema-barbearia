// ===== IMPORTAÇÕES =====
const express = require("express");
const path = require("path");
const session = require("express-session");
const db = require("./database");

const app = express();

// ===== CONFIGURAÇÕES =====
app.use(express.json());

app.use(session({
    secret: "segredo-barbearia-saas",
    resave: false,
    saveUninitialized: false
}));

// Serve os arquivos do frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// ===== MIDDLEWARE DE PROTEÇÃO =====
// Serve para garantir que só quem está logado
// consiga acessar rotas internas
function verificarLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({ erro: "Não autorizado" });
    }
    next();
}

// ===== LOGIN =====
app.post("/login", (req, res) => {
    const { usuario, senha } = req.body;

    // Login simples (por enquanto)
    if (usuario === "barbeiro" && senha === "1234") {
        req.session.usuario = {
            nome: usuario,
            barbearia_id: 1
        };
        return res.json({ sucesso: true });
    }

    res.json({ erro: "Usuário ou senha inválidos" });
});

// ===== LOGOUT =====
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ sucesso: true });
    });
});

// ===== HORÁRIOS OCUPADOS (PÚBLICO) =====
// Cliente usa isso, então NÃO pode exigir login
app.get("/horarios", (req, res) => {
    const data = req.query.data;
    if (!data) return res.json([]);

    db.all(
        "SELECT horario FROM agendamentos WHERE data = ?",
        [data],
        (err, rows) => {
            const ocupados = rows.map(r => r.horario);
            res.json(ocupados);
        }
    );
});

// ===== AGENDAR (CLIENTE) =====
app.post("/agendar", (req, res) => {
    const { nome, whatsapp, servico, data, horario } = req.body;

    // Validação forte (backend manda)
    if (!nome || !whatsapp || !servico || !data || !horario) {
        return res.json({ erro: "Preencha todos os campos" });
    }

    const barbeariaId = 1;

    db.get(
        "SELECT * FROM agendamentos WHERE data = ? AND horario = ? AND barbearia_id = ?",
        [data, horario, barbeariaId],
        (err, row) => {
            if (row) {
                return res.json({ erro: "Horário já ocupado" });
            }

            db.run(
                `INSERT INTO agendamentos 
                (nome, whatsapp, servico, data, horario, barbearia_id)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [nome, whatsapp, servico, data, horario, barbeariaId],
                () => res.json({ sucesso: true })
            );
        }
    );
});

// ===== AGENDA DO BARBEIRO (PROTEGIDA) =====
app.get("/agenda", verificarLogin, (req, res) => {
    const barbeariaId = req.session.usuario.barbearia_id;

    db.all(
        "SELECT * FROM agendamentos WHERE barbearia_id = ? ORDER BY data, horario",
        [barbeariaId],
        (err, rows) => res.json(rows)
    );
});

// ===== CANCELAR AGENDAMENTO =====
app.delete("/cancelar/:id", verificarLogin, (req, res) => {
    db.run(
        "DELETE FROM agendamentos WHERE id = ?",
        [req.params.id],
        () => res.json({ sucesso: true })
    );
});

// ===== SERVIDOR =====
app.listen(3000, () => {
    console.log("🚀 Sistema rodando em http://localhost:3000");
});

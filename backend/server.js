const express = require("express");
const path = require("path");
const session = require("express-session");
const db = require("./database");

const app = express();

app.use(express.json());

app.use(session({
    secret: "segredo-saas-barbearia",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, "../frontend")));

function verificarLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({ erro: "Não autorizado" });
    }
    next();
}

app.post("/login", (req, res) => {
    const { usuario, senha } = req.body;

    // Login simples (por enquanto)
    if (usuario === "barbeiro" && senha === "1234") {

        req.session.usuario = {
            nome: usuario,
            barbearia_id: 1   // 👈 aqui está a mágica
        };

        return res.json({ sucesso: true });
    }

    res.json({ erro: "Usuário ou senha inválidos" });
});

app.get("/horarios", (req, res) => {
    const data = req.query.data;
    if (!data) return res.json([]);

    db.all(
        "SELECT horario FROM agendamentos WHERE data = ?",
        [data],
        (err, rows) => {
            res.json(rows.map(r => r.horario));
        }
    );
});

app.post("/agendar", (req, res) => {
    const { nome, whatsapp, servico, data, horario } = req.body;

    const barbeariaId = 1; // cliente agenda na barbearia pública

    db.get(
        "SELECT * FROM agendamentos WHERE data = ? AND horario = ? AND barbearia_id = ?",
        [data, horario, barbeariaId],
        (err, row) => {
            if (row) return res.json({ erro: "Horário já ocupado" });

            db.run(
                "INSERT INTO agendamentos (nome, whatsapp, servico, data, horario, barbearia_id) VALUES (?, ?, ?, ?, ?, ?)",
                [nome, whatsapp, servico, data, horario, barbeariaId],
                () => res.json({ sucesso: true })
            );
        }
    );
});


app.get("/agenda", verificarLogin, (req, res) => {

    const barbeariaId = req.session.usuario.barbearia_id;

    db.all(
        "SELECT * FROM agendamentos WHERE barbearia_id = ? ORDER BY data, horario",
        [barbeariaId],
        (err, rows) => res.json(rows)
    );
});
app.delete("/cancelar/:id", verificarLogin, (req, res) => {
    db.run(
        "DELETE FROM agendamentos WHERE id = ?",
        [req.params.id],
        () => res.json({ sucesso: true })
    );
});

app.listen(3000, () => {
    console.log("🚀 Servidor rodando em http://localhost:3000");
});

// Cria barbearia padrão se não existir
db.get("SELECT * FROM barbearias WHERE id = 1", [], (err, row) => {
    if (!row) {
        db.run("INSERT INTO barbearias (nome) VALUES (?)", ["Barbearia Demo"]);
    }
});

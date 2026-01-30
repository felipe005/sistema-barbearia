const express = require("express");
const path = require("path");
const session = require("express-session");
const db = require("./database");

const app = express();

/* ======================
   CONFIGURAÇÕES
====================== */
app.use(express.json());

app.use(session({
    secret: "segredo-sistema-barbearia",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, "../frontend")));

/* ======================
   MIDDLEWARE
====================== */
function verificarLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({ erro: "Não autorizado" });
    }
    next();
}

/* ======================
   LOGIN
====================== */
app.post("/login", (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === "barbeiro" && senha === "1234") {
        req.session.usuario = {
            nome: usuario,
            barbearia_id: 1
        };
        return res.json({ sucesso: true });
    }

    res.json({ erro: "Usuário ou senha inválidos" });
});

/* ======================
   LOGOUT
====================== */
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ sucesso: true });
    });
});

/* ======================
   HORÁRIOS OCUPADOS
====================== */
app.get("/horarios", (req, res) => {
    const data = req.query.data;
    if (!data) return res.json([]);

    db.all(
        "SELECT horario FROM agendamentos WHERE data = ? AND barbearia_id = 1",
        [data],
        (err, rows) => {
            res.json(rows.map(r => r.horario));
        }
    );
});

/* ======================
   AGENDAR (CLIENTE)
====================== */
app.post("/agendar", (req, res) => {
    const { nome, whatsapp, servico, data, horario } = req.body;

    if (!nome || !whatsapp || !servico || !data || !horario) {
        return res.json({ erro: "Preencha todos os campos" });
    }

    db.get(
        "SELECT * FROM agendamentos WHERE data = ? AND horario = ? AND barbearia_id = 1",
        [data, horario],
        (err, row) => {
            if (row) {
                return res.json({ erro: "Horário já ocupado" });
            }

            db.run(
                `INSERT INTO agendamentos 
                (nome, whatsapp, servico, data, horario, barbearia_id)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [nome, whatsapp, servico, data, horario, 1],
                () => res.json({ sucesso: true })
            );
        }
    );
});

/* ======================
   AGENDA (BARBEIRO)
====================== */
app.get("/agenda", verificarLogin, (req, res) => {
    db.all(
        "SELECT * FROM agendamentos WHERE barbearia_id = 1 ORDER BY data, horario",
        [],
        (err, rows) => res.json(rows)
    );
});

/* ======================
   CANCELAR
====================== */
app.delete("/cancelar/:id", verificarLogin, (req, res) => {
    db.run(
        "DELETE FROM agendamentos WHERE id = ?",
        [req.params.id],
        () => res.json({ sucesso: true })
    );
});

/* ======================
   SERVIDOR
====================== */
app.listen(3000, () => {
    console.log("🚀 Sistema rodando em http://localhost:3000");
});

// ===== LOGIN =====
function login() {
    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            usuario: usuario.value,
            senha: senha.value
        })
    })
    .then(res => res.json())
    .then(r => {
        if (r.sucesso) {
            window.location.href = "barbeiro.html";
        } else {
            msg.innerText = r.erro;
            msg.className = "erro";
        }
    });
}

// ===== HORÁRIOS =====
const horariosPadrao = ["09:00", "09:30", "10:00", "10:30"];

function atualizarHorarios() {
    if (!data.value) return;

    fetch(`/horarios?data=${data.value}`)
        .then(res => res.json())
        .then(ocupados => {
            horario.innerHTML = "";

            horariosPadrao.forEach(h => {
                if (!ocupados.includes(h)) {
                    const option = document.createElement("option");
                    option.value = h;
                    option.textContent = h;
                    horario.appendChild(option);
                }
            });
        });
}

// ===== AGENDAR =====
function agendar() {
    fetch("/agendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nome: nome.value,
            whatsapp: whatsapp.value,
            servico: servico.value,
            data: data.value,
            horario: horario.value
        })
    })
    .then(res => res.json())
    .then(r => {
        if (r.sucesso) {
            msg.innerText = "Agendamento confirmado ✅";
            msg.className = "sucesso";
        } else {
            msg.innerText = r.erro;
            msg.className = "erro";
        }
    });
}

// ===== BARBEIRO =====
if (location.pathname.includes("barbeiro")) {

    fetch("/agenda")
        .then(res => {
            if (res.status === 401) {
                window.location.href = "login.html";
                return;
            }
            return res.json();
        })
        .then(lista => {
            if (!lista) return;

            tabela.innerHTML = "";

            lista.forEach(item => {
                tabela.innerHTML += `
                    <tr>
                        <td>${item.data}</td>
                        <td>${item.horario}</td>
                        <td>${item.nome}</td>
                        <td>${item.servico}</td>
                        <td>
                            <button onclick="cancelarAgendamento(${item.id})">
                                Cancelar
                            </button>
                        </td>
                    </tr>
                `;
            });
        });
}

// ===== CANCELAR =====
function cancelarAgendamento(id) {
    fetch(`/cancelar/${id}`, { method: "DELETE" })
        .then(() => location.reload());
}

// ===== LOGOUT =====
function logout() {
    fetch("/logout", { method: "POST" })
        .then(() => window.location.href = "login.html");
}

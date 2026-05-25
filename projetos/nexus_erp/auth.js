// ++++++++++++++++================== SISTEMA DE AUTENTICAÇÃO CORPORATIVO (RBAC) ======================+++++++++++++++

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    } else {
        checkSession();
    }
});

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.toLowerCase();
    const password = document.getElementById('password').value;
    const btnText = document.getElementById('btnText');
    const statusMsg = document.getElementById('statusMsg');

    btnText.innerText = "AUTENTICANDO NO SERVIDOR...";
    statusMsg.classList.add('hidden');

    setTimeout(() => {
        if (email && password.length >= 4) {
            
            // Atribuição Dinâmica de Cargos baseada no Email digitado
            let userRole = "Operador"; // Padrão
            let userName = "Colaborador Nexus";

            if (email.includes("admin")) {
                userRole = "Senior Admin";
                userName = "Pedro Nichollas"; // Master
            } else if (email.includes("rh")) {
                userRole = "RH";
                userName = "Gestor de Pessoas";
            } else if (email.includes("fin")) {
                userRole = "Financeiro";
                userName = "Analista Financeiro";
            }

            const sessionData = {
                user: userName,
                role: userRole,
                email: email,
                token: "NEX-SECURE-" + Date.now().toString(36).toUpperCase()
            };
            
            localStorage.setItem('nexus_session', JSON.stringify(sessionData));

            statusMsg.className = "mt-4 p-3 text-center text-sm rounded border bg-green-500/20 border-green-500/50 text-green-200 block";
            statusMsg.innerHTML = `<i class="fa-solid fa-shield-check"></i> Bem-vindo, ${userName} (${userRole}).`;
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } else {
            btnText.innerText = "INICIAR SESSÃO";
            statusMsg.className = "mt-4 p-3 text-center text-sm rounded border bg-red-500/20 border-red-500/50 text-red-200 block";
            statusMsg.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Acesso Negado: Credenciais Inválidas.';
        }
    }, 1200);
}

function checkSession() {
    const session = localStorage.getItem('nexus_session');
    if (!session) {
        window.location.href = 'index.html';
    }
}
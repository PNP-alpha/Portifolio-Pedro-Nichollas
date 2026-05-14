// ++++++++++++++++================== SISTEMA DE AUTENTICAÇÃO (MOCK) ======================+++++++++++++++

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    // Verifica se estamos na página de login
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    } 
    // Se não estivermos no login (estamos no Dashboard), verifica a sessão
    else {
        checkSession();
    }
});

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btnText = document.getElementById('btnText');
    const statusMsg = document.getElementById('statusMsg');

    // Feedback Visual de Carregamento
    btnText.innerText = "AUTENTICANDO...";
    statusMsg.classList.add('hidden');

    // Simulação de delay de servidor (1.5 segundos)
    setTimeout(() => {
        // Validação Simples (Pode aceitar qualquer coisa por enquanto para teste)
        if (email && password.length >= 4) {
            
            // Sucesso: Cria "Token" no LocalStorage
            const sessionData = {
                user: "Pedro Nichollas",
                role: "Senior Admin",
                token: "NEXUS-TOKEN-" + Date.now(),
                photo: "../../assets/perfil.jpg" // Caminho da sua foto
            };
            
            localStorage.setItem('nexus_session', JSON.stringify(sessionData));

            // Feedback de Sucesso
            statusMsg.className = "mt-4 p-3 text-center text-sm rounded border bg-green-500/20 border-green-500/50 text-green-200 block";
            statusMsg.innerHTML = '<i class="fa-solid fa-check-circle"></i> Acesso Permitido. Redirecionando...';
            
            // Redireciona para o Dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } else {
            // Erro
            btnText.innerText = "INICIAR SESSÃO";
            statusMsg.className = "mt-4 p-3 text-center text-sm rounded border bg-red-500/20 border-red-500/50 text-red-200 block";
            statusMsg.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Credenciais Inválidas.';
        }
    }, 1500);
}

function checkSession() {
    // Essa função roda em TODAS as páginas internas (Dashboard, etc)
    const session = localStorage.getItem('nexus_session');
    
    if (!session) {
        // Se não tiver sessão, chuta para o login
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem('nexus_session');
    window.location.href = 'index.html';
}
document.addEventListener('DOMContentLoaded', () => {
       
    // ++++++++++++++++================== CARREGAMENTO GERAL ======================+++++++++++++++
    fetch('dados.json')
        .then(response => response.json())
        .then(data => {
            // 1. Globais + Temas
            aplicarGlobal(data.global);
            if(data.global && data.global.temas) {
                iniciarColorPicker(data.global.temas);
            }
            
            // 2. Menu
            gerarMenu(data.menu);
            
            // 3. Textos Fixos
            aplicarTextosFixos(data.textos_fixos);
            
            // 4. Seções
            carregarPerfil(data.perfil);
            carregarProjetos(data.projetos);
            carregarFormacao(data.formacao);
            carregarCarreira(data.carreira);
            carregarCertificados(data.certificados);
            carregarContato(data.contato);
            
            // 5. Funcionalidades Extras (Rádio, Notícias, Matrix, Modal)
            iniciarNoticias(data.noticias);
            configurarRadio(data.radio_config);
            iniciarExtras(data.config_extra);
            iniciarMatrix();
            configurarModalContato();
            
            // 6. Efeitos
            iniciarTilt();
            iniciarSons();
        })
        .catch(err => console.error("Erro no JSON:", err));


    // ++++++++++++++++================== FUNÇÕES GERAIS ======================+++++++++++++++

    function aplicarGlobal(global) {
        if(!global) return;
        document.getElementById('page-title').innerText = global.titulo_aba;
        
        const corSalva = localStorage.getItem('user_neon_theme');
        const corInicial = corSalva || global.cor_primaria;
        document.documentElement.style.setProperty('--neon-color', corInicial);
    }

    function iniciarColorPicker(temas) {
        const btnSettings = document.getElementById('btn-settings');
        const settingsPanel = document.querySelector('.settings-panel');
        const containerCores = document.getElementById('colors-container');
        
        if(!btnSettings || !containerCores) return;
        containerCores.innerHTML = '';

        temas.forEach(tema => {
            const div = document.createElement('div');
            div.classList.add('color-btn');
            div.style.backgroundColor = tema.cor;
            div.style.color = tema.cor; 
            div.title = tema.nome;
            div.addEventListener('click', () => mudarTema(tema.cor));
            containerCores.appendChild(div);
        });

        btnSettings.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsPanel.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (settingsPanel && !settingsPanel.contains(e.target)) {
                settingsPanel.classList.remove('open');
            }
        });
    }

    function mudarTema(cor) {
        document.documentElement.style.setProperty('--neon-color', cor);
        localStorage.setItem('user_neon_theme', cor);
    }

    function gerarMenu(itens) {
        const menuContainer = document.getElementById('menu-dinamico');
        if(!menuContainer) return;
        menuContainer.innerHTML = ''; 

        itens.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${item.link}" class="nav-link">${item.texto}</a>`;
            menuContainer.appendChild(li);
        });
        ativarScrollSuave();
    }

    function aplicarTextosFixos(textos) {
        if(!textos) return;
        const setTxt = (id, txt) => {
            const el = document.getElementById(id);
            if(el) el.innerText = txt;
        };
        setTxt('ticker-label', textos.ticker_label);
        setTxt('tit-projetos', textos.titulo_projetos);
        setTxt('tit-formacao', textos.titulo_formacao);
        setTxt('tit-carreira', textos.titulo_carreira);
        setTxt('tit-certificados', textos.titulo_certificados);
        setTxt('tit-contato', textos.titulo_contato);
        setTxt('footer-text', textos.footer_texto);
    }

    // ++++++++++++++++================== CARREGAMENTO DE CONTEÚDO ======================+++++++++++++++
    function carregarPerfil(perfil) {
        if(!perfil) return;
        document.getElementById('perfil-nome').textContent = perfil.nome;
        document.getElementById('perfil-cargos').textContent = perfil.titulo; 
        document.getElementById('perfil-resumo').textContent = perfil.subtitulo;
        document.getElementById('perfil-numero').textContent = perfil.numero_misterioso;
        document.getElementById('perfil-nas').textContent = perfil.nas;
        const img = document.querySelector('.profile-pic');
        if(img && perfil.foto) img.src = perfil.foto;
    }

    function carregarProjetos(lista) {
        const container = document.getElementById('container-projetos');
        if(!container || !lista) return;
        container.innerHTML = '';
        lista.forEach(proj => {
            const html = `
                <div class="card" data-tilt>
                    <img src="${proj.imagem}" alt="${proj.titulo}" class="cert-img">
                    <h3>${proj.titulo}</h3>
                    <p>${proj.descricao}</p>
                    <a href="${proj.link}" class="btn-project" target="_blank">Ver Projeto</a>
                </div>`;
            container.innerHTML += html;
        });
    }

    function carregarFormacao(lista) {
        const container = document.getElementById('container-formacao');
        if(!container || !lista) return;
        container.innerHTML = '';
        lista.forEach(item => {
            const html = `
                <div class="timeline-item">
                    <h3>${item.curso}</h3>
                    <span class="date">${item.periodo} | ${item.instituicao}</span>
                    <p>${item.detalhes}</p>
                </div>`;
            container.innerHTML += html;
        });
    }

    function carregarCarreira(lista) {
        const container = document.getElementById('container-carreira');
        if(!container || !lista) return;
        container.innerHTML = '';
        lista.forEach(item => {
            const html = `
                <div class="timeline-item">
                    <h3>${item.cargo}</h3>
                    <span class="date">${item.periodo} | ${item.empresa}</span>
                    <p>${item.detalhes}</p>
                </div>`;
            container.innerHTML += html;
        });
    }

    function carregarCertificados(lista) {
        const container = document.getElementById('container-certificados');
        if(!container || !lista) return;
        container.innerHTML = '';
        lista.forEach(cert => {
            const html = `
                <div class="card" data-tilt>
                    <img src="${cert.imagem}" alt="${cert.titulo}" class="cert-img">
                    <h3>${cert.titulo}</h3>
                    <p>${cert.descricao}</p>
                    <a href="${cert.link}" class="btn-project" target="_blank">Ver Credencial</a>
                </div>`;
            container.innerHTML += html;
        });
    }

    function carregarContato(contato) {
        const container = document.getElementById('container-contato');
        if(!container || !contato) return;
        container.innerHTML = '';
        if (contato.email) container.innerHTML += `<a href="mailto:${contato.email}" class="nav-link">✉ E-mail</a>`;
        if (contato.linkedin) container.innerHTML += `<a href="${contato.linkedin}" target="_blank" class="nav-link">LinkedIn</a>`;
        if (contato.github) container.innerHTML += `<a href="${contato.github}" target="_blank" class="nav-link">GitHub</a>`;
        if (contato.whatsapp) container.innerHTML += `<a href="${contato.whatsapp}" target="_blank" class="nav-link">WhatsApp</a>`;
    }

    // ++++++++++++++++================== FUNCIONALIDADES: RÁDIO & EXTRAS ======================+++++++++++++++
    function iniciarNoticias(config) {
        const feedContainer = document.getElementById('news-feed');
        if(!feedContainer || !config) return;
        if(config.velocidade_animacao) feedContainer.style.animationDuration = config.velocidade_animacao;

        const API = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(config.rss_url)}`;
        fetch(API).then(res => res.json()).then(data => {
            let html = '';
            if(config.noticia_fake) html += `<div class="ticker-item" style="color:#fff; text-shadow:0 0 5px white;">★ ${config.noticia_fake}</div>`;
            if(data.items){
                data.items.slice(0, 5).forEach(item => {
                    html += `<div class="ticker-item">⚡ ${item.title}</div>`;
                });
            }
            feedContainer.innerHTML = html;
        }).catch(() => {
            feedContainer.innerHTML = '<div class="ticker-item">⚠️ Feed Offline - Sistema Operando Localmente</div>';
        });
    }

    function configurarRadio(config) {
        const audio = document.getElementById('live-radio');
        const btnPlay = document.getElementById('btn-play');
        const btnStop = document.getElementById('btn-stop');
        const volumeSlider = document.getElementById('volume-slider');
        const radioText = document.getElementById('radio-text');
        const radioPanel = document.querySelector('.radio-panel');
        const profileContainer = document.getElementById('profile-stage');
        const profilePic = document.querySelector('.profile-pic');
        let beatInterval = null;

        if(config && config.url) {
            audio.src = config.url;
            audio.volume = config.volume_inicial || 0.3;
        }

        function pulseBeat() {
            if (!profileContainer || audio.paused) return;
            const wave = document.createElement('div');
            wave.classList.add('energy-wave');
            profileContainer.appendChild(wave);
            setTimeout(() => { wave.remove(); }, 1500);
            if(profilePic) {
                profilePic.classList.add('beat-kick');
                setTimeout(() => { profilePic.classList.remove('beat-kick'); }, 150);
            }
        }

        btnPlay.addEventListener('click', () => {
            if (beatInterval) clearInterval(beatInterval);
            audio.play().then(() => {
                radioPanel.classList.add('active'); 
                radioText.textContent = config.nome_display || "ON AIR";
                if (profileContainer) {
                    profileContainer.classList.add('music-playing');
                    pulseBeat(); 
                    beatInterval = setInterval(pulseBeat, 600);
                }
            }).catch(e => console.log("Erro:", e));
        });

        btnStop.addEventListener('click', () => {
            audio.pause();
            if (beatInterval) clearInterval(beatInterval);
            beatInterval = null;
            radioPanel.classList.remove('active');
            radioText.textContent = "OFFLINE";
            if (profileContainer) {
                profileContainer.classList.remove('music-playing');
                const ondas = document.querySelectorAll('.energy-wave');
                ondas.forEach(w => w.remove());
                if(profilePic) profilePic.classList.remove('beat-kick');
            }
        });

        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value;
        });
    }

    // ++++++++++++++++================== EXTRAS (CV, CONTADOR, MODAL, MATRIX) ======================+++++++++++++++
    function iniciarExtras(config) {
        if(!config) return;
        // CV
        const btnCv = document.getElementById('btn-cv-download');
        if(btnCv && config.cv_link) btnCv.href = config.cv_link;

        // Contador
        const displayCount = document.getElementById('visit-count');
        if(displayCount) {
            let atual = localStorage.getItem('pnp_visit_count');
            if(!atual) atual = config.contador_inicial || 1000;
            atual = parseInt(atual) + 1;
            localStorage.setItem('pnp_visit_count', atual);
            displayCount.innerText = String(atual).padStart(4, '0');
        }
    }

    function configurarModalContato() {
        const btnOpen = document.getElementById('btn-contact-modal');
        const btnClose = document.getElementById('close-modal');
        const modal = document.getElementById('contact-modal');
        const form = document.getElementById('contact-form');

        if(!btnOpen || !modal) return;

        btnOpen.addEventListener('click', () => modal.classList.add('open'));
        const fechar = () => modal.classList.remove('open');
        btnClose.addEventListener('click', fechar);
        modal.addEventListener('click', (e) => { if(e.target === modal) fechar(); });

        if(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const btnSubmit = form.querySelector('.submit-btn');
                const textoOriginal = btnSubmit.innerText;
                btnSubmit.innerText = "ENVIANDO...";
                btnSubmit.style.opacity = "0.7";
                setTimeout(() => {
                    alert("MENSAGEM ENVIADA! (Simulação)");
                    btnSubmit.innerText = textoOriginal;
                    btnSubmit.style.opacity = "1";
                    form.reset();
                    fechar();
                }, 1500);
            });
        }
    }

    function iniciarMatrix() {
        const canvas = document.getElementById('matrix-canvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        let interval;
        const secretCode = ['p', 'n', 'p'];
        let inputSequence = [];

        window.addEventListener('keydown', (e) => {
            inputSequence.push(e.key.toLowerCase());
            if(inputSequence.length > 3) inputSequence.shift();
            if(inputSequence.join('') === secretCode.join('')) {
                ativarMatrix();
                inputSequence = [];
            }
            if(e.key === "Escape") pararMatrix();
        });

        function ativarMatrix() {
            canvas.style.display = 'block';
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const letras = "PNP_0101_JAVA_ORACLE_HTML_CSS_JS";
            const arrayLetras = letras.split("");
            const fontSize = 16;
            const columns = canvas.width / fontSize;
            const drops = [];
            for(let x = 0; x < columns; x++) drops[x] = 1;

            function draw() {
                ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const neonColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-color').trim();
                ctx.fillStyle = neonColor || "#0F0"; 
                ctx.font = fontSize + "px monospace";

                for(let i = 0; i < drops.length; i++) {
                    const text = arrayLetras[Math.floor(Math.random() * arrayLetras.length)];
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                    if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                    drops[i]++;
                }
            }
            interval = setInterval(draw, 33);
            setTimeout(pararMatrix, 10000);
        }

        function pararMatrix() {
            clearInterval(interval);
            canvas.style.display = 'none';
        }
        window.addEventListener('resize', () => {
             if(canvas.style.display === 'block') {
                 canvas.width = window.innerWidth;
                 canvas.height = window.innerHeight;
             }
        });
    }

    // ++++++++++++++++================== UTILITÁRIOS ======================+++++++++++++++
    function ativarScrollSuave() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if(targetId === '#') return;
                const targetElement = document.querySelector(targetId);
                if(targetElement){
                    const headerOffset = 100;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
            });
        });
    }

    function iniciarTilt() {
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(document.querySelectorAll(".card"), {
                max: 15, speed: 400, glare: true, "max-glare": 0.2,
            });
        }
    }

    function iniciarSons() {
        let hoverSound = document.getElementById('audio-hover');
        let clickSound = document.getElementById('audio-click');
        if(!hoverSound) { hoverSound = new Audio('assets/hover.mp3'); hoverSound.id = 'audio-hover'; }
        if(!clickSound) { clickSound = new Audio('assets/click.mp3'); clickSound.id = 'audio-click'; }

        const elements = document.querySelectorAll('a, button, .card');
        elements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                hoverSound.volume = 0.1; hoverSound.currentTime = 0;
                hoverSound.play().catch(() => {});
            });
            el.addEventListener('click', () => {
                clickSound.volume = 0.3; clickSound.play().catch(() => {});
            });
        });
    }
});
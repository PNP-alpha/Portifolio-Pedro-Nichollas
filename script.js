document.addEventListener('DOMContentLoaded', () => {
        
    // ++++++++++++++++================== CARREGAMENTO GERAL ======================+++++++++++++++
    fetch('dados.json')
        .then(response => response.json())
        .then(data => {
            aplicarGlobal(data.global);
            if(data.global && data.global.temas) iniciarColorPicker(data.global.temas);
            
            gerarMenu(data.menu);
            aplicarTextosFixos(data.textos_fixos);
            
            carregarPerfil(data.perfil);
            carregarProjetos(data.projetos);
            carregarFormacao(data.formacao);
            carregarCarreira(data.carreira);
            carregarCertificados(data.certificados);
            carregarContato(data.contato);
            carregarMiniGames(data.mini_games);
            
            iniciarNoticias(data.noticias);
            configurarRadio(data.radio_config); 
            iniciarExtras(data.config_extra);
            iniciarMatrix();
            configurarModalContato();
            
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
        const menuPc = document.getElementById('menu-dinamico');
        const menuMobile = document.getElementById('menu-dinamico-mobile');
        
        let html = '';
        itens.forEach(item => {
            html += `<li><a href="${item.link}" class="nav-link">${item.texto}</a></li>`;
        });

        if(menuPc) menuPc.innerHTML = html;
        if(menuMobile) menuMobile.innerHTML = html;
        
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

    function carregarMiniGames(jogos) {
    if (!jogos) return;

    const containerPC = document.getElementById('games-container-pc');
    const containerMobile = document.getElementById('games-container-mobile');

    // Versão PC: Ícone + Texto interno para animação controlada pelo CSS ao invés de direto no html
    if (containerPC) {
        containerPC.innerHTML = jogos.map(jogo => `
            <a href="${jogo.link}" class="game-link" aria-label="${jogo.nome}">
                <i class="fa-solid ${jogo.icone}"></i>
                <span class="game-text">${jogo.nome}</span>
            </a>
        `).join('');
    }

    // Versão Mobile: Mantém o padrão de lista estruturada sem quebrar 
    if (containerMobile) {
        containerMobile.innerHTML = jogos.map(jogo => `
            <a href="${jogo.link}" class="m-game-btn">
                <i class="fa-solid ${jogo.icone}"></i> ${jogo.nome}
            </a>
        `).join('');
    }
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
                     html += `<div class="ticker-item">
                    <a href="${item.link}" target="_blank" class="ticker-link">⚡ ${item.title}</a>
                 </div>`
                });
            }
            feedContainer.innerHTML = html;
        }).catch(() => {
            feedContainer.innerHTML = '<div class="ticker-item">⚠️ Feed Offline - Sistema Operando Localmente</div>';
        });
    }

    function configurarRadio(config) {
        let audio = document.getElementById('live-radio');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'live-radio';
            document.body.appendChild(audio);
        }

        const selectorPC = document.getElementById('radio-selector');
        const selectorMobile = document.getElementById('radio-selector-mobile'); 
        
        const btnPlay = document.getElementById('btn-play');
        const btnStop = document.getElementById('btn-stop');
        const btnRadioMobile = document.getElementById('mobile-radio-btn');
        const radioPanel = document.querySelector('.radio-panel');
        const profileContainer = document.getElementById('profile-stage');
        const profilePic = document.querySelector('.profile-pic');
        const volumeSlider = document.getElementById('volume-slider');
        
        if(!config || !config.estacoes) return;

        const optionsHTML = '<option value="" disabled selected>ESTAÇÃO...</option>' + 
            config.estacoes.map(e => `<option value="${e.url}">${e.nome}</option>`).join('');
        
        if (selectorPC) selectorPC.innerHTML = optionsHTML;
        if (selectorMobile) selectorMobile.innerHTML = optionsHTML;
        
        audio.volume = config.volume_inicial || 0.3;
        let beatInterval = null;

       function pulseBeat() {
            if (!profileContainer || audio.paused) return;
            
            // onda realística
            const wave = document.createElement('div');
            wave.classList.add('energy-wave');
            profileContainer.appendChild(wave);
            
            // Remove a onda após 2 segundos (tempo da nova animação de água e evita shakes)
            setTimeout(() => wave.remove(), 2000);
            
            // Aplica a batida (KICK) no contêiner geral para não quebrar a rotação da foto
            profileContainer.classList.add('beat-kick');
            setTimeout(() => profileContainer.classList.remove('beat-kick'), 150);
        }

        function tocarRadio() {
            const urlSelecionada = (window.innerWidth <= 900 && selectorMobile) ? selectorMobile.value : (selectorPC ? selectorPC.value : "");

            if (!urlSelecionada) {
                alert("Selecione uma estação primeiro!");
                return;
            }
            
            audio.src = urlSelecionada;
            audio.load(); 
            
            audio.play().then(() => {
                if (radioPanel) radioPanel.classList.add('active');
                if(btnRadioMobile) { 
                    btnRadioMobile.innerHTML = '■'; 
                    btnRadioMobile.classList.add('playing'); 
                }
                if(profileContainer) {
                    profileContainer.classList.add('music-playing');
                    if (beatInterval) clearInterval(beatInterval);
                    beatInterval = setInterval(pulseBeat, 600);
                }
            }).catch(err => console.error("Erro ao dar play:", err));
        }

        function pararRadio() {
            audio.pause();
            audio.src = ""; 
            if (radioPanel) radioPanel.classList.remove('active');
            if(btnRadioMobile) { 
                btnRadioMobile.innerHTML = '▶'; 
                btnRadioMobile.classList.remove('playing'); 
            }
            if(profileContainer) profileContainer.classList.remove('music-playing');
            if (beatInterval) clearInterval(beatInterval);
        }

        if (btnPlay) btnPlay.addEventListener('click', tocarRadio);
        if (btnStop) btnStop.addEventListener('click', pararRadio);
        
        function syncAndPlay(e) {
            if (selectorPC && e.target !== selectorPC) selectorPC.value = e.target.value;
            if (selectorMobile && e.target !== selectorMobile) selectorMobile.value = e.target.value;
            
            if(!audio.paused || (radioPanel && radioPanel.classList.contains('active'))) {
                tocarRadio();
            }
        }

        if (selectorPC) selectorPC.addEventListener('change', syncAndPlay);
        if (selectorMobile) selectorMobile.addEventListener('change', syncAndPlay);

        if(btnRadioMobile) {
            btnRadioMobile.addEventListener('click', () => {
                (audio.paused || audio.src === "") ? tocarRadio() : pararRadio();
            });
        }

        if (volumeSlider) {
            volumeSlider.value = audio.volume; 
            volumeSlider.addEventListener('input', (e) => {
                audio.volume = e.target.value;
            });
        }
    }

    function iniciarExtras(config) {
        if(!config) return;
        const btnCv = document.getElementById('btn-cv-download');
        if(btnCv && config.cv_link) btnCv.href = config.cv_link;

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

    // ++++++++++++++++================== UTILITÁRIOS DO SCROLL ======================+++++++++++++++
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

    // ==========================================
    // SISTEMA MOBILE: INTERAÇÕES E EVENTOS QUE ACONTECEM AO LONGO DA TELA 
    // ==========================================

    const btnMenuMobile = document.getElementById('menu-toggle');
    const gavetaMobile = document.getElementById('mobile-sidebar');

    if (btnMenuMobile && gavetaMobile) {
        btnMenuMobile.addEventListener('click', () => {
            gavetaMobile.classList.toggle('mobile-open');
            if (gavetaMobile.classList.contains('mobile-open')) {
                btnMenuMobile.innerHTML = '✖';
                btnMenuMobile.style.color = '#ff4444';
                btnMenuMobile.style.borderColor = '#ff4444';
            } else {
                btnMenuMobile.innerHTML = '☰';
                btnMenuMobile.style.color = 'var(--neon-color)';
                btnMenuMobile.style.borderColor = 'var(--neon-color)';
            }
        });

        gavetaMobile.addEventListener('click', (e) => {
            if(e.target.tagName.toLowerCase() === 'a' || e.target.closest('a')) {
                gavetaMobile.classList.remove('mobile-open');
                btnMenuMobile.innerHTML = '☰';
                btnMenuMobile.style.color = 'var(--neon-color)';
                btnMenuMobile.style.borderColor = 'var(--neon-color)';
            }
        });
    }

    const btnSettingsMobile = document.getElementById('btn-settings-mobile');
    const containerCoresMobile = document.getElementById('colors-container-mobile');
    const btnContatoMobile = document.getElementById('btn-contact-mobile');
    const modalGlobal = document.getElementById('contact-modal');
    
    const parentSettingsMobile = btnSettingsMobile ? btnSettingsMobile.closest('.settings-panel') : null;

    if (btnSettingsMobile && containerCoresMobile && parentSettingsMobile) {
        setTimeout(() => {
            const containerCoresPC = document.getElementById('colors-container');
            if(containerCoresMobile && containerCoresPC) {
                containerCoresMobile.innerHTML = containerCoresPC.innerHTML;
                
                containerCoresMobile.querySelectorAll('.color-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const corEscolhida = btn.style.backgroundColor;
                        mudarTema(corEscolhida); 
                        parentSettingsMobile.classList.remove('open'); 
                    });
                });
            }
        }, 1000); 

        btnSettingsMobile.addEventListener('click', (e) => {
            e.stopPropagation();
            parentSettingsMobile.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (parentSettingsMobile && !parentSettingsMobile.contains(e.target)) {
                parentSettingsMobile.classList.remove('open');
            }
        });
    }

    if (btnContatoMobile && modalGlobal) {
        btnContatoMobile.addEventListener('click', () => {
            modalGlobal.classList.add('open');
        });
    }

}); // <-- Fim do DOMContentLoaded
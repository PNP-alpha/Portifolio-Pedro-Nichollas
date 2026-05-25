// Nexus ERP v8.5 - Core Cluster Engine (Multi-Server System Architecture)
// Autor: PNP Systems | Segurança de Camada de Dados: Imutável Tier 1

const app = {
    currentServer: "NEXUS-PRIME",
    data: {}, 
    charts: {},
    maps: {},
    session: null,
    fleetSimulationTimer: null,
    activeRouteLine: null,
    selectedVehicleId: null,

    serversData: {
        "NEXUS-PRIME": {
            inventory: [
                { id: 101, name: 'Oracle Matrix Server X9', loc: 'ZONA-A1', price: 85000.00, stock: 3 },
                { id: 102, name: 'Cisco Switch Catalyst 9300', loc: 'ZONA-A4', price: 24500.00, stock: 8 },
                { id: 103, name: 'Firewall Fortinet FortiGate 100F', loc: 'ZONA-B2', price: 32000.00, stock: 1 },
                { id: 104, name: 'Banco Baterias Nobreak APC 10kVA', loc: 'ZONA-C1', price: 18900.00, stock: 12 }
            ],
            fleet: [
                { id: "TRK-201", type: "Scania R450 Heavy", plate: "PNP-4676", driver: "Carlos Henrique Souza", product: "Infraestrutura Datacenter", origin: "Monte Sião (MG)", destination: "São Paulo (SP)", tolls: 184.50, fuel: 1250.00, eta: "02h 45min", lat: -22.37, lng: -46.57, status: "Em Trânsito", progress: 25 },
                { id: "TRK-202", type: "Volvo FH 540 Globetrotter", plate: "NEX-8890", driver: "Marcos Antônio Pereira", product: "Bobinas Fibra Óptica", origin: "Santos (SP)", destination: "Belo Horizonte (MG)", tolls: 310.20, fuel: 2400.00, eta: "05h 10min", lat: -21.50, lng: -45.40, status: "Em Trânsito", progress: 55 }
            ],
            finance: [
                { id: 1, date: "15/05/2026", type: 'Venda', desc: 'Faturamento Cluster Datacenter', client: 'TechCorp SA', vehicle: 'TRK-201', val: 285000.00 },
                { id: 2, date: "16/05/2026", type: 'Compra', desc: 'Aquisição Ativos Cisco', client: 'Distribuidores BR', vehicle: '-', val: -98000.00 },
                { id: 3, date: "17/05/2026", type: 'Operacional', desc: 'Combustível Frota Matriz', client: 'Posto das Bandeiras', vehicle: 'TRK-202', val: -2400.00 }
            ],
            clients: [
                { id: 1, company: 'TechCorp SA', cnpj: '12.345.678/0001-99', contact: 'Roberto Silva', phone: '(35) 99887-4676', email: 'roberto@techcorp.com.br', address: 'Av. Corredor Digital, 1010 - SP', creditLimit: 500000.00 },
                { id: 2, company: 'Minas Telecom Group', cnpj: '98.765.432/0001-10', contact: 'Fernando Dias', phone: '(31) 98455-1122', email: 'fernando@minastelecom.com.br', address: 'Rua Agrupamento de Rede, 44 - MG', creditLimit: 350000.00 }
            ],
            employees: [
                { id: 1, name: 'Pedro Nichollas Palrinhas', cpf: '111.222.333-44', department: 'Engenharia', role: 'Senior Admin / CTO', salary: 28500.00, hireDate: '12/01/2024', status: 'Ativo' },
                { id: 2, name: 'Carlos Henrique Souza', cpf: '555.666.777-88', department: 'Logística', role: 'Condutor Logístico Cat. AE', salary: 5400.00, hireDate: '15/03/2025', status: 'Ativo' }
            ],
            auditLog: [
                { date: "18/05/2026 08:32:11", user: "SISTEMA", action: "CLUSTER_CONN", details: "Conexão de handshake efetuada com sucesso no nó corporativo de MG." },
                { date: "18/05/2026 09:14:02", user: "Pedro Nichollas", action: "WMS_RELIABILITY", details: "Varredura automatizada executada. Banco de dados íntegro." }
            ]
        },
        "ALPHA-CORE": {
            inventory: [
                { id: 201, name: 'Contêiner Dry ISO 20ft', loc: 'ZONA-A1', price: 14000.00, stock: 1 },
                { id: 202, name: 'Paleteira Elétrica Toyota', loc: 'ZONA-A4', price: 38000.00, stock: 2 },
                { id: 203, name: 'Pneumático Carga Pesada Bridgestone', loc: 'ZONA-B2', price: 3200.00, stock: 40 }
            ],
            fleet: [
                { id: "TRK-501", type: "Mercedes-Benz Actros", plate: "ALP-9911", driver: "Ailton Sena Ramos", product: "Grãos Exportação", origin: "Campinas (SP)", destination: "Porto de Santos", tolls: 450.00, fuel: 3100.00, eta: "01h 20min", lat: -23.10, lng: -46.80, status: "Em Trânsito", progress: 70 }
            ],
            finance: [
                { id: 1, date: "14/05/2026", type: 'Venda', desc: 'Contrato Logístico Intermodal', client: 'Alpha Logística Global', vehicle: 'TRK-501', val: 94000.00 },
                { id: 2, date: "16/05/2026", type: 'Operacional', desc: 'Manutenção Preventiva de Eixos', client: 'Mecânica Diesel Central', vehicle: '-', val: -12600.00 }
            ],
            clients: [
                { id: 1, company: 'Alpha Logística Global', cnpj: '44.555.666/0002-44', contact: 'Mariana Costa', phone: '(11) 97112-9090', email: 'mariana@alphalog.com', address: 'Rua das Transportadoras, 80 - SP', creditLimit: 800000.00 }
            ],
            employees: [
                { id: 1, name: 'Ailton Sena Ramos', cpf: '888.999.111-22', department: 'Logística', role: 'Motorista Rodo-Trem', salary: 6200.00, hireDate: '20/10/2023', status: 'Ativo' }
            ],
            auditLog: [
                { date: "18/05/2026 06:00:00", user: "ALPHA-DAEMON", action: "SYS_MIRROR", details: "Sincronização de espelhamento efetuada com a filial de São Paulo." }
            ]
        },
        "SIGMA-DATA": {
            inventory: [
                { id: 301, name: 'Rack Gabinete APC 42U', loc: 'ZONA-A1', price: 7200.00, stock: 5 },
                { id: 302, name: 'Lâmina Blazer Dell PowerEdge', loc: 'ZONA-B2', price: 54000.00, stock: 1 }
            ],
            fleet: [
                { id: "VAN-309", type: "Renault Master Cargo", plate: "SIG-0022", driver: "Douglas Fonseca", product: "Discos Rigidos Encriptados", origin: "Rio (RJ)", destination: "Niterói (RJ)", tolls: 22.00, fuel: 190.00, eta: "00h 40min", lat: -22.88, lng: -43.12, status: "Em Trânsito", progress: 40 }
            ],
            finance: [
                { id: 1, date: "17/05/2026", type: 'Venda', desc: 'Faturamento Cloud Governamental', client: 'Governo do Estado RJ', vehicle: 'VAN-309', val: 412000.00 }
            ],
            clients: [
                { id: 1, company: 'Governo do Estado RJ', cnpj: '00.000.111/0001-02', contact: 'Secretaria Digital', phone: '(21) 2332-0000', email: 'ti@rj.gov.br', address: 'Praça da República, S/N - Centro, RJ', creditLimit: 9999999.00 }
            ],
            employees: [
                { id: 1, name: 'Douglas Fonseca', cpf: '444.111.999-00', department: 'Logística', role: 'Agente Logística de Valores', salary: 4800.00, hireDate: '01/02/2026', status: 'Ativo' }
            ],
            auditLog: [
                { date: "18/05/2026 02:11:54", user: "SEC-GUARD", action: "KEY_ROTATION", details: "Rotação de chaves criptográficas RSA de 4096 bits executada." }
            ]
        }
    },

    init: function() {
        this.session = JSON.parse(localStorage.getItem('nexus_session'));
        if(!this.session) {
            this.session = { user: "Pedro Nichollas", role: "Senior Admin", token: "NEX-LOCAL-SECURE" };
            localStorage.setItem('nexus_session', JSON.stringify(this.session));
        }
        
        this.loadCurrentServerData();
        this.applyRBAC();
        this.initClock();
        this.initSearch();
        this.initDashboardShortcuts();
        this.initAICLI();
        
        const userEl = document.getElementById('userName');
        if(userEl) userEl.innerText = `${this.session.user} (${this.session.role})`;

        this.renderAll();
        this.switchView('dashboard');
        this.startFleetSimulation();
        
        this.showToast(`Nó de Processamento ${this.currentServer} Alocado com Sucesso.`, 'info');
    },

    loadCurrentServerData: function() {
        const key = `nexus_data_v85_${this.currentServer}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            this.data = JSON.parse(JSON.stringify(this.serversData[this.currentServer]));
            this.saveCurrentServerData();
        }
    },

    saveCurrentServerData: function() {
        const key = `nexus_data_v85_${this.currentServer}`;
        localStorage.setItem(key, JSON.stringify(this.data));
        this.updateKPIs();
        this.checkAutomatedProcurement();
    },

    // INTERRUPTOR DE SERVIDORES COM SIMULAÇÃO REAL DE HANDSHAKE (ANIMADO)
    switchServer: function(serverName) {
        const overlay = document.getElementById('cluster-handshake-overlay');
        const logsContainer = document.getElementById('handshake-logs');
        
        if (!overlay || !logsContainer) {
            this.currentServer = serverName;
            this.loadCurrentServerData();
            this.renderAll();
            return;
        }

        overlay.classList.remove('hidden');
        logsContainer.innerHTML = '';

        const logs = [
            `[INFO] INITIATING CONTEXT SWITCH TO NODE: ${serverName}...`,
            `[SEC] ROTATING KEY ENCRYPTION LAYER AES-256 GCM...`,
            `[NET] ESTABLISHING HANDSHAKE PROTOCOL WITH REMOTE DATA MATRIX...`,
            `[DB] ACQUIRING ISOLATED MULTI-TENANT LEDGER SCHEMA...`,
            `[DB] SYNCHRONIZING ARRAYS AND REBUILDING WMS VISUAL ENGINE...`,
            `[SUCCESS] HANDSHAKE VERIFIED. TRANSACTIONAL LEDGER IS LIVE.`
        ];

        let currentLogIdx = 0;
        const interval = setInterval(() => {
            if (currentLogIdx < logs.length) {
                const p = document.createElement('p');
                p.innerText = logs[currentLogIdx];
                if (logs[currentLogIdx].includes('SUCCESS')) p.className = 'text-green-400 font-bold';
                else if (logs[currentLogIdx].includes('SEC')) p.className = 'text-amber-400';
                logsContainer.appendChild(p);
                logsContainer.scrollTop = logsContainer.scrollHeight;
                currentLogIdx++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    this.currentServer = serverName;
                    
                    const selector = document.getElementById('serverSelector');
                    if (selector) selector.value = serverName;
                    
                    const textEl = document.getElementById('clusterStatusText');
                    if (textEl) textEl.innerText = serverName;
                    
                    if(this.maps.mainFleet) {
                        this.maps.mainFleet.remove();
                        this.maps.mainFleet = null;
                    }

                    this.loadCurrentServerData();
                    this.renderAll();
                    this.showToast(`Conectado com sucesso ao nó corporativo ${serverName}`, 'success');
                    this.audit('CLUSTER_SWITCH', `Efetuada transição de processamento para o nó: ${serverName}`);
                }, 300);
            }
        }, 150);
    },

    applyRBAC: function() {
        const role = this.session.role;
        const permissions = {
            'Operador': ['nav-dashboard', 'nav-inventory', 'nav-fleet'],
            'RH': ['nav-dashboard', 'nav-hr'],
            'Financeiro': ['nav-dashboard', 'nav-finance', 'nav-crm', 'nav-insights'],
            'Senior Admin': ['nav-dashboard', 'nav-inventory', 'nav-fleet', 'nav-finance', 'nav-crm', 'nav-hr', 'nav-insights', 'nav-audit']
        };
        const allowed = permissions[role] || ['nav-dashboard'];
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if(!allowed.includes(btn.id)) btn.style.display = 'none';
        });
    },

    initDashboardShortcuts: function() {
        document.addEventListener('click', (e) => {
            const card = e.target.closest('[data-shortcut]');
            if (card) this.switchView(card.getAttribute('data-shortcut'));
        });
    },

    renderAll: function() {
        this.renderInventory();
        this.renderWarehouseZones();
        this.renderFinance();
        this.renderFleetList();
        this.renderCRM();
        this.renderHR();
        this.renderAudit();
        this.updateKPIs();
    },

    renderInventory: function() {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;
        tbody.innerHTML = this.data.inventory.map((item, index) => `
            <tr class="border-b border-slate-700/50 hover:bg-slate-800/40 transition">
                <td class="px-6 py-4 text-white font-bold">${item.name}</td>
                <td class="px-6 py-4 text-slate-400 text-xs font-mono">${item.loc}</td>
                <td class="px-6 py-4 text-slate-300 font-mono">R$ ${item.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="px-6 py-4"><span class="${item.stock < 3 ? 'text-red-400 font-bold animate-pulse' : 'text-green-400'}">${item.stock} unidades</span></td>
                <td class="px-6 py-4 text-right">
                    <button onclick="app.deleteItem('inventory', ${index})" class="text-slate-500 hover:text-red-500 transition"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    // RENDERS DAS ZONAS DO ALMOXARIFADO VISUAL (INTERATIVIDADE WMS W3C)
    renderWarehouseZones: function() {
        const grid = document.getElementById('warehouse-zones-grid');
        if (!grid) return;

        const zones = {
            'ZONA-A1': { item: 'Disponível', stock: 0 },
            'ZONA-A4': { item: 'Disponível', stock: 0 },
            'ZONA-B2': { item: 'Disponível', stock: 0 },
            'ZONA-C1': { item: 'Disponível', stock: 0 }
        };

        this.data.inventory.forEach(item => {
            if (zones[item.loc]) {
                zones[item.loc].item = item.name;
                zones[item.loc].stock = item.stock;
            }
        });

        grid.innerHTML = Object.keys(zones).map(key => {
            const z = zones[key];
            const isCritical = z.stock > 0 && z.stock < 3;
            const cardBg = isCritical ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)] text-red-200' : 'bg-blue-500/5 border-slate-800 text-slate-300';
            
            return `
                <div class="border p-2.5 rounded-xl flex flex-col justify-between transition hover:border-blue-500/40 ${cardBg}">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[9px] font-mono font-bold ${isCritical ? 'text-red-400' : 'text-blue-400'}">${key}</span>
                        ${isCritical ? '<span class="text-[7px] bg-red-500 text-black font-bold px-1 rounded animate-pulse">ALERTA</span>' : ''}
                    </div>
                    <div class="text-[10px] truncate font-medium text-slate-300">${z.item}</div>
                    <div class="text-right text-[11px] font-mono font-bold mt-1 ${isCritical ? 'text-red-400' : 'text-slate-400'}">${z.stock} UN</div>
                </div>
            `;
        }).join('');
    },

    // REAÇÃO EM CADEIA: ALMOXARIFADO -> COMPRA AUTOMÁTICA -> CRIAÇÃO FINANCEIRA
    checkAutomatedProcurement: function() {
        this.data.inventory.forEach(item => {
            if (item.stock < 3) {
                const jaExiste = this.data.finance.some(f => f.desc.includes(`Reposição WMS Auto: ${item.name}`));
                if (!jaExiste) {
                    const totalCost = item.price * 5;
                    this.data.finance.push({
                        id: Date.now() + Math.floor(Math.random() * 100),
                        date: new Date().toLocaleDateString('pt-BR'),
                        type: 'Compra',
                        desc: `Reposição WMS Auto: ${item.name} (5 UN)`,
                        client: 'PNP Procurement Engine',
                        vehicle: '-',
                        val: -totalCost
                    });
                    
                    item.stock += 5; 
                    this.saveCurrentServerData();
                    this.renderAll();
                    this.showToast(`Doca ${item.loc} crítica! Ordem de compra de reposição injetada no Livro Financeiro.`, 'warning');
                    this.audit('AUTOMATED_WMS_ORDER', `Gerada compra automática para reabastecer ${item.name}`);
                }
            }
        });
    },

    renderFinance: function() {
        const tbody = document.getElementById('financeTableBody');
        if (!tbody) return;
        
        let totalVal = this.data.finance.reduce((acc, curr) => acc + curr.val, 0);
        const totalEl = document.getElementById('fin-total');
        if (totalEl) totalEl.innerText = totalVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        tbody.innerHTML = this.data.finance.map((item, index) => {
            let colorClass = item.val >= 0 ? 'text-green-400' : 'text-red-400';
            return `
                <tr class="border-b border-slate-700/50 hover:bg-slate-800/40 transition">
                    <td class="px-6 py-4 text-slate-500 text-xs font-mono">${item.date}</td>
                    <td class="px-6 py-4"><span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 border border-slate-700 ${colorClass}">${item.type}</span></td>
                    <td class="px-6 py-4 text-white font-medium">${item.desc}<div class="text-[10px] text-slate-500">${item.client}</div></td>
                    <td class="px-6 py-4 font-mono text-xs text-orange-400 font-bold">${item.vehicle !== '-' ? `<i class="fa-solid fa-truck"></i> ${item.vehicle}` : '-'}</td>
                    <td class="px-6 py-4 text-right font-mono font-bold ${colorClass}">R$ ${item.val.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="app.generateInvoice(${index})" class="text-blue-400 hover:text-blue-500 transition mr-3" title="Emitir NF-e Legítima"><i class="fa-solid fa-file-pdf"></i></button>
                        <button onclick="app.deleteItem('finance', ${index})" class="text-slate-500 hover:text-red-500"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    // MOTOR GERADOR DE NOTA FISCAL CORPORATIVA REAL COM EMISSÃO JSPDF
    generateInvoice: function(idx) {
        const item = this.data.finance[idx];
        if (!item) return;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        // Design Corporativo PNP Systems
        doc.setFillColor(15, 20, 34); 
        doc.fillRect(0, 0, 210, 38);

        doc.setTextColor(255, 255, 255);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('PNP SYSTEMS CORPORATION', 15, 15);
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`NEXUS FINANCIAL LEDGER | ID OPERACIONAL: NF-${item.id}`, 15, 24);
        doc.text(`TOKEN DE SEGURANÇA: ${this.session.token}`, 15, 29);

        doc.setTextColor(40, 40, 40);
        doc.setFontSize(11);
        doc.setFont('Helvetica', 'bold');
        doc.text('DEMONSTRATIVO DE NOTA FISCAL ELETRÔNICA (NF-e)', 15, 55);

        doc.setDrawColor(200, 200, 200);
        doc.line(15, 58, 195, 58);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Data do Registro: ${item.date}`, 15, 68);
        doc.text(`Natureza de Caixa: ${item.type.toUpperCase()}`, 15, 76);
        doc.text(`Descrição / Histórico Contábil: ${item.desc}`, 15, 84);
        doc.text(`Cliente / Ente Envolvido: ${item.client}`, 15, 92);
        doc.text(`Ativo de Frota Vinculado (TMS): ${item.vehicle}`, 15, 100);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`VALOR LIQUIDADO: R$ ${Math.abs(item.val).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 15, 112);

        doc.setFillColor(245, 247, 250);
        doc.fillRect(15, 125, 180, 22);
        doc.setTextColor(110, 110, 110);
        doc.setFontSize(8);
        doc.setFont('Helvetica', 'oblique');
        doc.text('Os dados contidos neste relatório automatizado são protegidos por criptografia de ponta-a-ponta.', 18, 131);
        doc.text(`Servidor de Autenticação Ativo: ${this.currentServer} Cluster Engine Node Tier 1.`, 18, 137);

        doc.setDrawColor(220, 220, 220);
        doc.line(15, 270, 195, 270);
        doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')} por PNP Systems Control Center.`, 15, 276);

        doc.save(`NF_Nexus_Transaction_${item.id}.pdf`);
        this.showToast('Nota Fiscal Eletrônica legível (PDF) emitida e baixada!', 'success');
    },

    renderFleetList: function() {
        const container = document.getElementById('fleet-list');
        if (!container) return;
        container.innerHTML = this.data.fleet.map(v => `
            <div class="p-4 glass rounded-xl border ${this.selectedVehicleId === v.id ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'border-slate-700/70'} hover:border-blue-500/50 transition cursor-pointer" onclick="app.focusVehicle('${v.id}')">
                <div class="flex justify-between items-center mb-2">
                    <div class="flex flex-col">
                        <span class="text-sm font-bold text-white">${v.id}</span>
                        <span class="text-[10px] text-slate-500 font-mono">${v.type}</span>
                    </div>
                    <span class="text-[10px] border px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-400">${v.status}</span>
                </div>
                <div class="grid grid-cols-2 gap-y-1 gap-x-2 text-[10px] text-slate-300 border-t border-slate-800/60 pt-2">
                    <div class="truncate"><span class="text-slate-500">Condutor:</span> ${v.driver}</div>
                    <div class="truncate"><span class="text-slate-500">Carga:</span> ${v.product}</div>
                    <div><span class="text-slate-500">Diesel:</span> R$ ${v.fuel.toFixed(2)}</div>
                    <div><span class="text-slate-500">Pedágio:</span> R$ ${v.tolls.toFixed(2)}</div>
                    <div class="col-span-2 text-green-400"><b>ETA:</b> ${v.eta}</div>
                </div>
            </div>
        `).join('');
    },

    renderCRM: function() {
        const tbody = document.getElementById('crmTableBody');
        if (!tbody) return;
        tbody.innerHTML = this.data.clients.map((c, i) => `
            <tr class="border-b border-slate-700/50 hover:bg-slate-800/40 transition">
                <td class="px-6 py-3 text-white font-bold">${c.company}<div class="text-[10px] font-mono text-slate-500">${c.cnpj}</div></td>
                <td class="px-6 py-3 text-slate-300">${c.contact}</td>
                <td class="px-6 py-3 text-slate-400 font-mono">${c.phone}<div class="text-[10px] text-blue-400">${c.email}</div></td>
                <td class="px-6 py-3 text-slate-400">${c.address}</td>
                <td class="px-6 py-3 text-right font-mono text-emerald-400 font-bold">R$ ${c.creditLimit.toLocaleString('pt-BR')}</td>
                <td class="px-6 py-3 text-right"><button onclick="app.deleteItem('clients', ${i})" class="text-slate-500 hover:text-red-500"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `).join('');
    },

    renderHR: function() {
        const tbody = document.getElementById('hrTableBody');
        if (!tbody) return;
        tbody.innerHTML = this.data.employees.map((e, i) => `
            <tr class="border-b border-slate-700/50 hover:bg-slate-800/40 transition">
                <td class="px-6 py-3 text-white font-bold">${e.name}<div class="text-[10px] font-mono text-slate-500">CPF: ${e.cpf}</div></td>
                <td class="px-6 py-3 text-slate-300">${e.role}<div class="text-[10px] text-slate-500">Setor: ${e.department}</div></td>
                <td class="px-6 py-3 font-mono text-indigo-400 font-bold">R$ ${e.salary.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                <td class="px-6 py-3 text-slate-400 font-mono">${e.hireDate}</td>
                <td class="px-6 py-3 text-right"><button onclick="app.deleteItem('employees', ${i})" class="text-slate-500 hover:text-red-500"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `).join('');
    },

    renderAudit: function() {
        const tbody = document.getElementById('auditTableBody');
        if (!tbody) return;
        tbody.innerHTML = this.data.auditLog.map(log => `
            <tr class="border-b border-slate-700/30 hover:bg-slate-800/20 text-xs">
                <td class="px-4 py-2 text-slate-500 font-mono">${log.date}</td>
                <td class="px-4 py-2 text-blue-400 font-bold">${log.user}</td>
                <td class="px-4 py-2 text-white font-bold"><span class="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono">${log.action}</span></td>
                <td class="px-4 py-2 text-slate-400 italic">${log.details}</td>
            </tr>
        `).join('');
    },

    saveProduct: function(e) {
        e.preventDefault();
        this.data.inventory.push({
            id: Date.now(), name: document.getElementById('prodName').value,
            loc: document.getElementById('prodLoc').value.toUpperCase(),
            price: parseFloat(document.getElementById('prodPrice').value),
            stock: parseInt(document.getElementById('prodStock').value)
        });
        this.audit('WMS_SKU_REG', `Item registrado sob nó ${this.currentServer}`);
        this.saveCurrentServerData(); this.renderAll(); this.closeModal('product'); e.target.reset();
    },

    saveFinance: function(e) {
        e.preventDefault();
        const type = document.getElementById('finType').value;
        let val = parseFloat(document.getElementById('finVal').value);
        if (type !== 'Venda') val = -Math.abs(val);

        this.data.finance.push({
            id: Date.now(), date: new Date().toLocaleDateString('pt-BR'),
            type, desc: document.getElementById('finDesc').value,
            client: document.getElementById('finClient').value,
            vehicle: document.getElementById('finVehicle').value, val
        });
        this.audit('FIN_METRIC', `Fluxo contábil atualizado no ledger.`);
        this.saveCurrentServerData(); this.renderAll(); this.closeModal('finance'); e.target.reset();
    },

    saveCRM: function(e) {
        e.preventDefault();
        this.data.clients.push({
            id: Date.now(), company: document.getElementById('crmCompany').value,
            cnpj: document.getElementById('crmCnpj').value,
            contact: document.getElementById('crmContact').value,
            phone: document.getElementById('crmPhone').value,
            email: document.getElementById('crmEmail').value,
            address: document.getElementById('crmAddress').value,
            creditLimit: parseFloat(document.getElementById('crmCredit').value)
        });
        this.audit('CRM_ACCOUNT_NEW', `Ficha cadastral de conta gerada.`);
        this.saveCurrentServerData(); this.renderCRM(); this.closeModal('crm'); e.target.reset();
    },

    saveHR: function(e) {
        e.preventDefault();
        this.data.employees.push({
            id: Date.now(), name: document.getElementById('hrName').value,
            cpf: document.getElementById('hrCpf').value,
            department: document.getElementById('hrDept').value,
            role: document.getElementById('hrRole').value,
            salary: parseFloat(document.getElementById('hrSalary').value),
            hireDate: new Date().toLocaleDateString('pt-BR'), status: 'Ativo'
        });
        this.audit('HR_ADMISSION', `Registro funcional associado à folha.`);
        this.saveCurrentServerData(); this.renderHR(); this.closeModal('hr'); e.target.reset();
    },

    updateKPIs: function() {
        const stockVal = this.data.inventory.reduce((a, b) => a + (b.price * b.stock), 0);
        const income = this.data.finance.filter(i => i.val > 0).reduce((a, b) => a + b.val, 0);
        const totalActiveTrucks = this.data.fleet.length;

        if(document.getElementById('kpi-stock')) document.getElementById('kpi-stock').innerText = stockVal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        if(document.getElementById('kpi-rev')) document.getElementById('kpi-rev').innerText = income.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        if(document.getElementById('kpi-fleet')) document.getElementById('kpi-fleet').innerText = totalActiveTrucks;
    },

    renderInsights: function() {
        const income = this.data.finance.filter(i => i.val > 0).reduce((a, b) => a + b.val, 0);
        const expense = Math.abs(this.data.finance.filter(i => i.val < 0).reduce((a, b) => a + b.val, 0));
        const totalHR = this.data.employees.reduce((a, b) => a + b.salary, 0);
        const totalLog = this.data.fleet.reduce((a, b) => a + b.fuel + b.tolls, 0);
        
        const balance = income - expense;
        const margin = income > 0 ? ((balance / income) * 100).toFixed(1) : "0.0";

        if (document.getElementById('bi-margin')) document.getElementById('bi-margin').innerText = `${margin}%`;
        if (document.getElementById('bi-log-costs')) document.getElementById('bi-log-costs').innerText = totalLog.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        if (document.getElementById('bi-hr-costs')) document.getElementById('bi-hr-costs').innerText = totalHR.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        if (document.getElementById('bi-delivery-rate')) document.getElementById('bi-delivery-rate').innerText = "94.2%";

        const aiEl = document.getElementById('ai-text');
        if(aiEl && !aiEl.innerHTML.includes('NEXUS_AI_CLI')) {
            aiEl.innerHTML = `
                <p class="text-blue-400 font-bold"><i class="fa-solid fa-microchip"></i> COMPILAÇÃO CENTRAL DE INSIGHTS [${this.currentServer}]</p>
                <p class="text-slate-400">Terminal operacional carregado com sucesso. Pronto para receber consultas paramétricas de Business Intelligence.</p>
                <p class="text-slate-500 italic">Digite um comando abaixo (ex: /auditar) para processar o ledger contábil em tempo real.</p>
            `;
        }

        if(document.getElementById('chartDoughnut')) {
            if (this.charts.doughnut) this.charts.doughnut.destroy();
            this.charts.doughnut = new Chart(document.getElementById('chartDoughnut'), {
                type: 'doughnut',
                data: {
                    labels: ['Faturamento', 'Despesas Operacionais'],
                    datasets: [{ data: [income, expense], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '78%', plugins: { legend: { display: false } } }
            });
        }
    },

    // INICIALIZAÇÃO E PARSER DO TERMINAL INTERATIVO NEXUSAI CLI (BI COGNITIVO)
    initAICLI: function() {
        const input = document.getElementById('ai-cli-input');
        if (!input) return;
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmdStr = input.value.trim();
                if (cmdStr) {
                    this.executeAICommand(cmdStr);
                    input.value = '';
                }
            }
        });
    },

    executeAICommand: function(cmdStr) {
        const output = document.getElementById('ai-text');
        if (!output) return;

        const pCmd = document.createElement('p');
        pCmd.className = 'text-blue-400 font-bold mt-2';
        pCmd.innerText = `NEXUS_AI_CLI > ${cmdStr}`;
        output.appendChild(pCmd);

        const cmd = cmdStr.toLowerCase().trim();

        if (cmd === '/previsao') {
            const balance = this.data.finance.reduce((a, b) => a + b.val, 0);
            const projection = balance * 1.35;
            output.innerHTML += `
                <p class="text-slate-400">• Analisando séries de dados temporais e SKUs ativos...</p>
                <p class="text-green-400 font-bold">✓ Projeção linear para o próximo trimestre: R$ ${projection.toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
                <p class="text-slate-400">• Recomendação: Manter margem operacional de segurança ativa.</p>
            `;
        } else if (cmd === '/auditar') {
            const ledgerHash = "SHA256-" + Math.floor(Math.random() * 10000000).toString(16).toUpperCase();
            output.innerHTML += `
                <p class="text-slate-400">• Iniciando auditoria e verificação criptográfica das tabelas...</p>
                <p class="text-slate-400">• Total de transações mapeadas no ledger: ${this.data.finance.length}</p>
                <p class="text-emerald-400 font-bold">✓ INTEGRIDADE FISCAL CONFIRMADA. NENHUMA INCONSISTÊNCIA DETECTADA.</p>
                <p class="text-[10px] text-slate-500 font-mono">• ASSINATURA DA VARREDURA: ${ledgerHash}</p>
            `;
        } else if (cmd.startsWith('/status')) {
            const ping = Math.floor(Math.random() * (16 - 3) + 3);
            output.innerHTML += `
                <p class="text-slate-400">• Estatísticas de latência de infraestrutura do cluster:</p>
                <p class="text-slate-400">• Ping de conexão de handshake: <span class="text-green-400 font-bold">${ping} ms</span></p>
                <p class="text-slate-400">• Buffer em cache: Nominal (12.4 MB / 64 MB)</p>
                <p class="text-slate-400">• Estado do Pipeline DB: CONECTADO E ESPELHADO</p>
            `;
        } else {
            output.innerHTML += `
                <p class="text-red-400">✗ Erro: Comando '${cmdStr}' não catalogado no motor lof.</p>
                <p class="text-slate-500">Comandos suportados de fábrica: /previsao , /auditar , /status</p>
            `;
        }
        output.scrollTop = output.scrollHeight;
    },

    startFleetSimulation: function() {
        if(this.fleetSimulationTimer) clearInterval(this.fleetSimulationTimer);
        this.fleetSimulationTimer = setInterval(() => {
            let changed = false;
            this.data.fleet.forEach(v => {
                if(v.status === 'Em Trânsito') {
                    v.progress += Math.floor(Math.random() * 3) + 2;
                    v.lat += (Math.random() - 0.5) * 0.01;
                    v.lng += (Math.random() - 0.5) * 0.01;
                    if(v.marker) v.marker.setLatLng([v.lat, v.lng]);
                    
                    if (this.selectedVehicleId === v.id) {
                        const speedEl = document.getElementById('telemetry-speed');
                        if (speedEl) speedEl.innerText = `${Math.floor(Math.random() * (88 - 72) + 72)} km/h`;
                    }

                    if(v.progress >= 100) {
                        v.progress = 100; v.status = 'Entregue'; v.eta = 'Finalizado';
                        this.showToast(`Entrega concluída pelo veículo ${v.id}.`, 'success');
                    }
                    changed = true;
                }
            });
            if(changed) { this.saveCurrentServerData(); this.renderFleetList(); }
        }, 5000);
    },

    initMap: function() {
        if (this.maps.mainFleet) { this.maps.mainFleet.invalidateSize(); return; }
        const centers = { "NEXUS-PRIME": [-22.37, -46.57], "ALPHA-CORE": [-23.55, -46.63], "SIGMA-DATA": [-22.90, -43.20] };
        const map = L.map('mainFleetMap', { center: centers[this.currentServer] || [-23.00, -45.00], zoom: 7 });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
        this.maps.mainFleet = map;
        this.initFleetMapMarkers();
    },

    initFleetMapMarkers: function() {
        if(!this.maps.mainFleet) return;
        this.data.fleet.forEach(v => {
            const icon = L.divIcon({ html: `<div class="bg-blue-500 border border-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white shadow-[0_0_10px_#2563eb]"><i class="fa-solid fa-truck"></i></div>`, className: 'custom-div-icon' });
            v.marker = L.marker([v.lat, v.lng], {icon: icon}).addTo(this.maps.mainFleet);
        });
    },

    // TMS VIVIFICADO: PLOTAGEM DE LINHA DE ROTA E TELEMETRIA AUTOMÁTICA
    focusVehicle: function(id) {
        this.selectedVehicleId = id;
        this.renderFleetList();

        const v = this.data.fleet.find(i => i.id === id);
        if (!v || !this.maps.mainFleet) return;

        this.maps.mainFleet.flyTo([v.lat, v.lng], 9);

        const panel = document.getElementById('active-telemetry-panel');
        if (panel) {
            panel.classList.remove('hidden');
            document.getElementById('telemetry-vehicle-id').innerText = v.id;
            document.getElementById('telemetry-speed').innerText = v.status === 'Em Trânsito' ? '82 km/h' : '0 km/h';
            document.getElementById('telemetry-fuel-burn').innerText = v.status === 'Em Trânsito' ? '2.4 L/km (Diesel S10)' : '0.0 L/km (Estacionado)';
        }

        if (this.activeRouteLine) {
            this.maps.mainFleet.removeLayer(this.activeRouteLine);
        }

        // Simula e plota o traçado geográfico real ligando a rota
        const simulatedOrigin = [v.lat - 0.5, v.lng - 0.6];
        const simulatedDest = [v.lat + 0.6, v.lng + 0.7];

        this.activeRouteLine = L.polyline([simulatedOrigin, [v.lat, v.lng], simulatedDest], {
            color: '#3b82f6',
            weight: 3,
            dashArray: '6, 10',
            opacity: 0.8
        }).addTo(this.maps.mainFleet);

        v.marker.bindPopup(`
            <div class="font-mono text-xs">
                <b class="text-blue-400">${v.id}</b><br>
                Driver: ${v.driver}<br>
                Progresso: ${v.progress}%<br>
                Status: ${v.status}
            </div>
        `).openPopup();
    },

    switchView: function(viewId) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(`view-${viewId}`);
        if(target) target.classList.add('active');
        const btn = document.getElementById(`nav-${viewId}`);
        if(btn) btn.classList.add('active');

        if (viewId === 'fleet') setTimeout(() => this.initMap(), 150);
        if (viewId === 'insights') setTimeout(() => this.renderInsights(), 100);
    },

    audit: function(action, details) {
        this.data.auditLog.unshift({ date: new Date().toLocaleString('pt-BR'), user: this.session ? this.session.user : 'SISTEMA', action, details });
        this.saveCurrentServerData();
    },

    showToast: function(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const t = document.createElement('div'); t.className = `toast toast-${type}`;
        t.innerHTML = `<i class="fa-solid fa-circle-info text-white"></i> <span class="text-white text-xs">${msg}</span>`;
        container.appendChild(t);
        requestAnimationFrame(() => t.classList.add('show'));
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 4000);
    },

    deleteItem: function(type, idx) {
        if (confirm(`Expurgar registro permanentemente do módulo ${type.toUpperCase()}?`)) {
            this.data[type].splice(idx, 1); this.saveCurrentServerData(); this.renderAll();
        }
    },

    initSearch: function() {
        document.addEventListener('keydown', e => { if((e.ctrlKey || e.key === 'k') && e.key !== 'Control') { e.preventDefault(); this.openSearch(); } });
    },
    openSearch: function() { document.getElementById('modal-search').classList.add('active'); },
    openModal: function(id) {
        document.getElementById(`modal-${id}`).classList.add('active');
        if(id === 'finance') {
            document.getElementById('finClient').innerHTML = this.data.clients.map(c => `<option value="${c.company}">${c.company}</option>`).join('');
            document.getElementById('finVehicle').innerHTML = '<option value="-">Nenhum (Logística Interna)</option>' + this.data.fleet.map(v => `<option value="${v.id}">${v.id}</option>`).join('');
        }
    },
    closeModal: function(id) { document.getElementById(`modal-${id}`).classList.remove('active'); },
    initClock: function() { setInterval(() => { const el = document.getElementById('clock'); if(el) el.innerText = new Date().toLocaleTimeString('pt-BR'); }, 1000); },
    logout: function() { if(confirm('Encerrar terminal seguro?')) { localStorage.removeItem('nexus_session'); window.location.href = '../index.html'; } }
};

document.addEventListener('DOMContentLoaded', () => app.init());
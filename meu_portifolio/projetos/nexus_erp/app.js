// Nexus ERP v7.2 - Enterprise Core Logic (Uncompressed)
// Autor: PNP Systems

const app = {
    // ==========================================
    // 1. DADOS E ESTADO DO SISTEMA
    // ==========================================
    data: {
        inventory: [],
        finance: [],
        clients: [],
        employees: [],
        auditLog: [],
        // Dados da Frota (Mock inicial)
        fleet: [
            { 
                id: "TRK-01", 
                type: "Scania R450", 
                plate: "ABC-1234", 
                product: "Disponível", 
                origin: "Base Central", 
                destination: "-", 
                lat: -23.00, 
                lng: -44.30, 
                status: "Aguardando", 
                progress: 0 
            },
            { 
                id: "VAN-09", 
                type: "Mercedes Sprinter", 
                plate: "XYZ-9876", 
                product: "Peças Eletrônicas", 
                origin: "São Paulo (SP)", 
                destination: "Rio de Janeiro (RJ)", 
                lat: -23.55, 
                lng: -46.63, 
                status: "Em Trânsito", 
                progress: 45 
            },
            { 
                id: "TRK-05", 
                type: "Volvo FH", 
                plate: "NEX-5555", 
                product: "Bobinas de Aço", 
                origin: "Porto Santos", 
                destination: "CD Cajamar", 
                lat: -23.96, 
                lng: -46.33, 
                status: "Carregando", 
                progress: 10 
            }
        ]
    },

    // Variáveis para guardar os gráficos e mapas e evitar duplicidade
    charts: {},
    maps: {},

    // ==========================================
    // 2. INICIALIZAÇÃO (BOOTSTRAP)
    // ==========================================
    init: function() {
        console.log("Sistema Iniciado...");
        
        // 1. Carregar dados salvos
        this.loadData();
        
        // 2. Iniciar o Relógio
        this.initClock();
        
        // 3. Renderizar todas as telas
        this.renderAll();
        
        // 4. Iniciar sistema de busca
        this.initSearch();
        
        // 5. Começar na Dashboard
        this.switchView('dashboard');
        
        // 6. Carregar o mapa pequeno da dashboard com um delay seguro
        setTimeout(() => {
            this.initMap('miniMap', [-23.55, -46.63], 9, false);
        }, 500);
        
        // 7. Mensagem de boas-vindas
        this.showToast('Sistema Nexus ERP carregado com sucesso.', 'info');
        this.audit('SYSTEM_START', 'Login realizado pelo administrador');
    },

    // Carrega dados do LocalStorage ou usa valores padrão se estiver vazio
    loadData: function() {
        // Carregar Inventário
        const savedInv = localStorage.getItem('nexus_inv_v7');
        if (savedInv) {
            this.data.inventory = JSON.parse(savedInv);
        } else {
            this.data.inventory = [
                { id: 1, name: 'Oracle Server X9', loc: 'A-01', price: 45000.00, stock: 2 },
                { id: 2, name: 'Cabo Rede Cat6', loc: 'B-02', price: 150.00, stock: 200 }
            ];
        }

        // Carregar Financeiro
        const savedFin = localStorage.getItem('nexus_fin_v7');
        if (savedFin) {
            this.data.finance = JSON.parse(savedFin);
        } else {
            this.data.finance = [
                { id: 1, type: 'Venda', date: '2026-02-14', desc: 'Venda Inicial', client: 'TechCorp', vehicle: '-', val: 15000.00 }
            ];
        }

        // Carregar CRM, RH e Auditoria
        this.data.clients = JSON.parse(localStorage.getItem('nexus_crm_v7')) || [];
        this.data.employees = JSON.parse(localStorage.getItem('nexus_hr_v7')) || [];
        this.data.auditLog = JSON.parse(localStorage.getItem('nexus_audit_v7')) || [];
    },

    // Salva todos os dados no navegador
    saveData: function() {
        localStorage.setItem('nexus_inv_v7', JSON.stringify(this.data.inventory));
        localStorage.setItem('nexus_fin_v7', JSON.stringify(this.data.finance));
        localStorage.setItem('nexus_crm_v7', JSON.stringify(this.data.clients));
        localStorage.setItem('nexus_hr_v7', JSON.stringify(this.data.employees));
        localStorage.setItem('nexus_audit_v7', JSON.stringify(this.data.auditLog));
        
        // Recalcula os números da Dashboard
        this.updateKPIs();
    },

    // ==========================================
    // 3. FUNÇÕES DE RENDERIZAÇÃO (Tabelas e Listas)
    // ==========================================
    
    renderAll: function() {
        this.renderInventory();
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
        
        let html = '';
        this.data.inventory.forEach((item, index) => {
            // Lógica de cor para estoque baixo
            let stockClass = 'text-green-400';
            if (item.stock < 5) stockClass = 'text-red-400';

            html += `
                <tr class="border-b border-slate-700/50 hover:bg-slate-800/50 transition">
                    <td class="px-6 py-4 text-white font-bold">${item.name}</td>
                    <td class="px-6 py-4 text-slate-400 text-xs">${item.loc}</td>
                    <td class="px-6 py-4 text-slate-300 font-mono">R$ ${item.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td class="px-6 py-4"><span class="${stockClass} font-bold">${item.stock}</span></td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="app.deleteItem('inventory', ${index})" class="text-slate-500 hover:text-red-500 transition">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    renderFinance: function() {
        const tbody = document.getElementById('financeTableBody');
        if (!tbody) return;

        let html = '';
        this.data.finance.forEach((item, index) => {
            // Define cor do valor (verde para positivo, vermelho para negativo)
            let colorClass = item.val >= 0 ? 'text-green-400' : 'text-red-400';
            
            // Monta o badge de logística (se houver veículo)
            let logisticsBadge = '<span class="text-xs text-slate-600">-</span>';
            if (item.vehicle && item.vehicle !== '-') {
                logisticsBadge = `
                    <div class="flex flex-col text-[10px]">
                        <span class="text-orange-300 font-bold"><i class="fa-solid fa-truck"></i> ${item.vehicle}</span>
                        <span class="text-slate-500">${item.origin || '?'} <i class="fa-solid fa-arrow-right"></i> ${item.dest || '?'}</span>
                    </div>
                `;
            }

            html += `
                <tr class="border-b border-slate-700/50 hover:bg-slate-800/50 transition">
                    <td class="px-6 py-4 text-slate-400 text-[10px] font-mono">${item.date || 'Hoje'}</td>
                    <td class="px-6 py-4">
                        <span class="bg-slate-800 border border-slate-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-300">
                            ${item.type}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-white font-medium">
                        ${item.desc}
                        <div class="text-[10px] text-blue-300">${item.client || ''}</div>
                    </td>
                    <td class="px-6 py-4">${logisticsBadge}</td>
                    <td class="px-6 py-4 text-right font-mono font-bold ${colorClass}">
                        R$ ${item.val.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="app.deleteItem('finance', ${index})" class="text-slate-500 hover:text-red-500">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    renderFleetList: function() {
        const listContainer = document.getElementById('fleet-list');
        if (!listContainer) return;

        let html = '';
        this.data.fleet.forEach(vehicle => {
            html += `
                <div class="p-4 glass rounded-xl border border-slate-700 mb-3 hover:bg-slate-800 transition group cursor-pointer" onclick="app.focusVehicle('${vehicle.id}')">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-bold text-blue-400 text-sm group-hover:text-white transition">
                            <i class="fa-solid fa-truck mr-1"></i> ${vehicle.id}
                        </span>
                        <span class="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600">
                            ${vehicle.status}
                        </span>
                    </div>
                    <div class="text-xs text-slate-300 mb-1">
                        <span class="text-slate-500">Veículo:</span> ${vehicle.type}
                    </div>
                    <div class="text-xs text-slate-300 mb-1">
                        <span class="text-slate-500">Rota:</span> ${vehicle.origin} <i class="fa-solid fa-arrow-right text-[10px]"></i> ${vehicle.destination}
                    </div>
                    <div class="text-xs text-slate-300 mb-2">
                        <span class="text-slate-500">Carga:</span> ${vehicle.product}
                    </div>
                    <div class="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
                        <div class="bg-blue-500 h-full transition-all duration-500" style="width: ${vehicle.progress}%"></div>
                    </div>
                </div>
            `;
        });
        listContainer.innerHTML = html;
    },

    renderCRM: function() {
        const tbody = document.getElementById('crmTableBody');
        if (!tbody) return;
        
        let html = '';
        this.data.clients.forEach((client, index) => {
            html += `
                <tr class="border-b border-slate-700/50 hover:bg-slate-800/50 transition">
                    <td class="px-6 py-4 text-white font-bold">${client.company}</td>
                    <td class="px-6 py-4 text-slate-400">
                        <i class="fa-solid fa-user mr-1"></i> ${client.contact}
                    </td>
                    <td class="px-6 py-4 text-slate-400 text-xs">${client.email}</td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="app.deleteItem('clients', ${index})" class="text-slate-500 hover:text-red-500">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    renderHR: function() {
        const tbody = document.getElementById('hrTableBody');
        if (!tbody) return;

        let html = '';
        this.data.employees.forEach((employee, index) => {
            html += `
                <tr class="border-b border-slate-700/50 hover:bg-slate-800/50 transition">
                    <td class="px-6 py-4 text-white font-medium">${employee.name}</td>
                    <td class="px-6 py-4 text-slate-400">${employee.role}</td>
                    <td class="px-6 py-4">
                        <span class="text-green-400 text-xs uppercase font-bold border border-green-500/30 px-2 py-0.5 rounded bg-green-500/10">
                            ${employee.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="app.deleteItem('employees', ${index})" class="text-slate-500 hover:text-red-500">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    renderAudit: function() {
        const tbody = document.getElementById('auditTableBody');
        if (!tbody) return;

        let html = '';
        this.data.auditLog.forEach((log) => {
            html += `
                <tr class="border-b border-slate-700/30 hover:bg-slate-800/30">
                    <td class="px-6 py-3 text-slate-500 font-mono text-[10px]">${log.date}</td>
                    <td class="px-6 py-3 text-blue-400 font-bold text-xs">${log.user}</td>
                    <td class="px-6 py-3 text-white font-bold text-xs border-l border-slate-700 pl-4">${log.action}</td>
                    <td class="px-6 py-3 text-slate-400 text-xs italic">${log.details}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    // ==========================================
    // 4. LÓGICA DE NEGÓCIO E CADASTRO
    // ==========================================

    // Salvar Produto (WMS)
    saveProduct: function(e) {
        e.preventDefault();
        const name = document.getElementById('prodName').value;
        const loc = document.getElementById('prodLoc').value;
        const price = parseFloat(document.getElementById('prodPrice').value);
        const stock = parseInt(document.getElementById('prodStock').value);

        this.data.inventory.push({
            id: Date.now(),
            name: name,
            loc: loc,
            price: price,
            stock: stock
        });

        this.audit('CREATE_PRODUCT', `Novo produto: ${name}`);
        this.saveData();
        this.renderInventory();
        this.closeModal('product');
        e.target.reset();
        this.showToast('Produto salvo com sucesso!');
    },

    // --- FUNÇÃO FINANCEIRA COMPLETA (COM INTEGRAÇÃO) ---
    saveFinance: function(e) {
        e.preventDefault();
        
        // Coletar dados do formulário
        const type = document.getElementById('finType').value;
        let val = parseFloat(document.getElementById('finVal').value);
        const desc = document.getElementById('finDesc').value;
        const client = document.getElementById('finClient').value;
        const vehicleId = document.getElementById('finVehicle').value;
        
        // Novos Campos de Logística e Data
        const dateRaw = document.getElementById('finDate').value;
        // Se não tiver data, usa hoje
        const dateFormatted = dateRaw ? new Date(dateRaw).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : new Date().toLocaleDateString('pt-BR');
        const origin = document.getElementById('finOrigin').value;
        const dest = document.getElementById('finDest').value;

        // Se for despesa, valor fica negativo
        if (type === 'Compra' || type === 'Operacional') {
            val = -Math.abs(val);
        }

        // Criar objeto
        const newItem = {
            id: Date.now(),
            date: dateFormatted,
            type: type,
            desc: desc,
            client: client,
            vehicle: vehicleId,
            origin: origin,
            dest: dest,
            val: val
        };

        this.data.finance.push(newItem);
        
        // INTEGRAÇÃO: Atualizar status do veículo na frota se selecionado
        if (vehicleId && vehicleId !== '-') {
            const vehicle = this.data.fleet.find(v => v.id === vehicleId);
            if (vehicle) {
                vehicle.status = "Em Entrega";
                vehicle.product = `Entrega: ${desc}`;
                if (origin) vehicle.origin = origin;
                if (dest) vehicle.destination = dest;
                vehicle.progress = 0;
                
                this.showToast(`Ordem de serviço enviada para ${vehicleId}`, 'info');
                this.audit('FLEET_UPDATE', `Rota atualizada para veículo ${vehicleId}`);
            }
        }

        this.audit('FINANCE_TX', `Nova ${type}: R$ ${val}`);
        this.saveData();
        this.renderFinance();
        this.renderFleetList(); 
        
        // Atualiza o mapa se ele já estiver carregado
        if (this.maps.mainFleet) {
            this.maps.mainFleet.remove();
            this.maps.mainFleet = null;
            this.initMap('mainFleetMap', [-23.55, -46.63], 8, true);
        }

        this.closeModal('finance');
        e.target.reset();
        
        // Esconde os campos extras
        const routeDiv = document.getElementById('logisticsRoute');
        if(routeDiv) routeDiv.classList.add('hidden');
    },

    // Salvar Cliente (CRM)
    saveCRM: function(e) {
        e.preventDefault();
        const company = document.getElementById('crmCompany').value;
        this.data.clients.push({
            id: Date.now(),
            company: company,
            contact: document.getElementById('crmContact').value,
            email: document.getElementById('crmEmail').value
        });
        this.audit('CRM_ADD', `Novo cliente: ${company}`);
        this.saveData();
        this.renderCRM();
        this.closeModal('crm');
        e.target.reset();
        this.showToast('Cliente cadastrado com sucesso!');
    },

    // Salvar RH
    saveHR: function(e) {
        e.preventDefault();
        const name = document.getElementById('hrName').value;
        this.data.employees.push({
            id: Date.now(),
            name: name,
            role: document.getElementById('hrRole').value,
            status: 'Ativo'
        });
        this.audit('HR_HIRE', `Contratação: ${name}`);
        this.saveData();
        this.renderHR();
        this.closeModal('hr');
        e.target.reset();
        this.showToast('Colaborador registrado!');
    },

    // Função genérica de exclusão
    deleteItem: function(type, idx) {
        if (confirm('Tem certeza que deseja remover este item? Esta ação será auditada.')) {
            this.audit('DELETE', `Removeu item de ${type}`);
            this.data[type].splice(idx, 1);
            this.saveData();
            this.renderAll();
            this.showToast('Item removido com sucesso.', 'warning');
        }
    },

    // ==========================================
    // 5. MAPAS E GRÁFICOS (VISUALIZAÇÃO)
    // ==========================================

    initMap: function(elemId, coords, zoom, isMain) {
        if (this.maps[elemId]) return; // Evita recriar se já existe
        
        const map = L.map(elemId, { center: coords, zoom: zoom, zoomControl: false });
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap & CartoDB',
            maxZoom: 19
        }).addTo(map);

        if (isMain) {
            // Adiciona marcadores interativos da frota
            this.data.fleet.forEach(v => {
                const icon = L.divIcon({
                    html: `<div class="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_15px_#3b82f6] text-white animate-pulse"><i class="fa-solid fa-truck"></i></div>`,
                    className: 'custom-div-icon',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });

                const marker = L.marker([v.lat, v.lng], {icon: icon}).addTo(map);
                
                // Popup rico
                marker.bindPopup(`
                    <div class="font-sans min-w-[200px]">
                        <div class="flex justify-between items-start border-b border-gray-600 pb-2 mb-2">
                            <h3 class="text-blue-400 font-bold m-0 text-sm">${v.id}</h3>
                            <span class="text-[10px] bg-blue-900 text-white px-1 rounded">${v.plate}</span>
                        </div>
                        <div class="text-xs text-gray-200 space-y-1">
                            <p><b>Veículo:</b> ${v.type}</p>
                            <p><b>Status:</b> ${v.status}</p>
                            <p><b>Carga:</b> ${v.product}</p>
                            <p class="text-green-400"><b>Origem:</b> ${v.origin}</p>
                            <p class="text-red-400"><b>Destino:</b> ${v.destination}</p>
                        </div>
                        <div class="mt-3 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-blue-500 h-full" style="width: ${v.progress}%"></div>
                        </div>
                    </div>
                `);
                
                v.marker = marker;
            });
            this.maps.mainFleet = map;
        } else {
            this.maps.mini = map;
        }
    },

    focusVehicle: function(id) {
        const v = this.data.fleet.find(i => i.id === id);
        if (v && this.maps.mainFleet) {
            this.maps.mainFleet.flyTo([v.lat, v.lng], 13, { duration: 1.5 });
            v.marker.openPopup();
        }
    },

    renderInsights: function() {
        const income = this.data.finance.filter(i => i.val > 0).reduce((a, b) => a + b.val, 0);
        const expense = Math.abs(this.data.finance.filter(i => i.val < 0).reduce((a, b) => a + b.val, 0));
        const ratio = expense > 0 ? (income / expense).toFixed(1) : '∞';
        
        // Texto IA
        const el = document.getElementById('ai-text');
        if(el) {
            if (ratio > 2) el.innerText = "Saúde Financeira: Excelente. Receita dobra despesas.";
            else if (ratio > 1) el.innerText = "Saúde Financeira: Estável. Margem positiva.";
            else el.innerText = "ALERTA: Despesas superando receitas. Atenção imediata.";
        }

        // Gráfico Doughnut
        if(document.getElementById('chartDoughnut')) {
            if (this.charts.doughnut) this.charts.doughnut.destroy();
            this.charts.doughnut = new Chart(document.getElementById('chartDoughnut'), {
                type: 'doughnut',
                data: {
                    labels: ['Vendas', 'Locações', 'Outros'],
                    datasets: [{
                        data: [income * 0.6, income * 0.3, income * 0.1],
                        backgroundColor: ['#3b82f6', '#a855f7', '#10b981'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#fff' } } } }
            });
        }

        // Gráfico Bar
        if(document.getElementById('chartBar')) {
            if (this.charts.bar) this.charts.bar.destroy();
            this.charts.bar = new Chart(document.getElementById('chartBar'), {
                type: 'bar',
                data: {
                    labels: ['Set', 'Out', 'Nov', 'Dez', 'Jan', 'Atual'],
                    datasets: [
                        { label: 'Receita', data: [40000, 45000, 42000, 50000, 48000, income], backgroundColor: '#22c55e' },
                        { label: 'Despesa', data: [20000, 22000, 21000, 25000, 23000, expense], backgroundColor: '#ef4444' }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { x: { display: false }, y: { display: false } }, plugins: { legend: { labels: { color: '#fff' } } } }
            });
        }
    },

    // ==========================================
    // 6. UTILITÁRIOS (Helpers)
    // ==========================================

    // UI Helper: Mostrar/Esconder campos de rota no modal financeiro
    toggleLogisticsFields: function() {
        const val = document.getElementById('finVehicle').value;
        const div = document.getElementById('logisticsRoute');
        if (div) {
            if (val !== '-') {
                div.classList.remove('hidden');
                document.getElementById('finOrigin').value = "CD Central"; 
            } else {
                div.classList.add('hidden');
            }
        }
    },

    updateKPIs: function() {
        const stockVal = this.data.inventory.reduce((a, b) => a + (b.price * b.stock), 0);
        const income = this.data.finance.filter(i => i.val > 0).reduce((a, b) => a + b.val, 0);
        const totalFin = this.data.finance.reduce((a, b) => a + b.val, 0);

        document.getElementById('kpi-stock').innerText = stockVal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        document.getElementById('kpi-rev').innerText = income.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        document.getElementById('kpi-fleet').innerText = this.data.fleet.length;
        document.getElementById('fin-total').innerText = totalFin.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    },

    audit: function(action, details) {
        const log = {
            date: new Date().toLocaleString(),
            user: 'Admin',
            action: action,
            details: details
        };
        this.data.auditLog.unshift(log);
        if (this.data.auditLog.length > 50) this.data.auditLog.pop(); // Limita histórico
        this.saveData();
        this.renderAudit();
    },

    showToast: function(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-circle-xmark';
        if (type === 'info') icon = 'fa-circle-info';
        
        toast.innerHTML = `<i class="fa-solid ${icon} text-lg text-white"></i> <span class="text-white text-sm">${msg}</span>`;
        container.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    exportData: function(type) {
        const data = this.data[type];
        if (!data || data.length === 0) return this.showToast('Sem dados para exportar.', 'warning');
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
        
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `nexus_${type}_report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast(`Relatório de ${type} exportado!`, 'success');
        this.audit('EXPORT_DATA', `Exportou dados: ${type}`);
    },

    // Navegação entre abas
    switchView: function(viewId) {
        // Esconde todas as seções
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        
        // Remove destaque dos botões
        document.querySelectorAll('.nav-btn').forEach(el => {
            el.classList.remove('active', 'text-blue-400', 'text-green-400', 'text-yellow-400', 'text-pink-400', 'text-purple-400', 'text-red-400');
        });
        
        // Mostra a seção nova
        const section = document.getElementById(`view-${viewId}`);
        if(section) section.classList.add('active');
        
        // Destaca o botão
        const btn = document.getElementById(`nav-${viewId}`);
        if(btn) {
            btn.classList.add('active');
            if(viewId==='finance') btn.classList.add('text-green-400');
            else if(viewId==='crm') btn.classList.add('text-yellow-400');
            else if(viewId==='hr') btn.classList.add('text-pink-400');
            else if(viewId==='audit') btn.classList.add('text-red-400');
            else if(viewId==='insights') btn.classList.add('text-purple-400');
            else btn.classList.add('text-blue-400');
        }

        // Lógica específica por aba
        if (viewId === 'fleet') {
            setTimeout(() => {
                if (!this.maps.mainFleet) this.initMap('mainFleetMap', [-23.55, -46.63], 8, true);
                else this.maps.mainFleet.invalidateSize();
            }, 100);
        }
        
        if (viewId === 'insights') {
            setTimeout(() => this.renderInsights(), 100);
        }
    },

    // Busca Global
    initSearch: function() {
        document.addEventListener('keydown', (e) => {
            if((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
            if(e.key === 'Escape') this.closeModal('search');
        });

        const input = document.getElementById('searchInput');
        if(input) {
            input.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const res = document.getElementById('searchResults');
                
                if(term.length < 2) { 
                    res.innerHTML = '<div class="p-4 text-center text-slate-500 text-xs">Digite para buscar...</div>'; 
                    return; 
                }

                const matches = [
                    { t: 'Dashboard', a: 'dashboard' }, { t: 'Estoque', a: 'inventory' }, { t: 'Frota', a: 'fleet' },
                    { t: 'Financeiro', a: 'finance' }, { t: 'CRM Clientes', a: 'crm' }, { t: 'RH Equipe', a: 'hr' },
                    { t: 'Insights BI', a: 'insights' }, { t: 'Auditoria', a: 'audit' }
                ].filter(i => i.t.toLowerCase().includes(term));

                if (matches.length === 0) {
                    res.innerHTML = '<div class="p-2 text-slate-500 text-xs">Nenhum resultado.</div>';
                } else {
                    res.innerHTML = matches.map(m => `
                        <div onclick="app.switchView('${m.a}');app.closeModal('search')" class="p-2 hover:bg-slate-700 cursor-pointer text-slate-300 text-sm rounded flex items-center gap-2 transition">
                            <i class="fa-solid fa-arrow-right text-blue-500"></i> ${m.t}
                        </div>
                    `).join('');
                }
            });
        }
    },

    openSearch: function() {
        document.getElementById('modal-search').classList.add('active');
        setTimeout(() => document.getElementById('searchInput').focus(), 100);
    },

    // Modais
    openModal: function(id) {
        document.getElementById(`modal-${id}`).classList.add('active');
        
        // Se for financeiro, preenche selects dinamicamente
        if(id === 'finance') {
            const cl = document.getElementById('finClient');
            const ve = document.getElementById('finVehicle');
            
            if(cl) cl.innerHTML = '<option value="-">Cliente Balcão</option>' + this.data.clients.map(c => `<option value="${c.company}">${c.company}</option>`).join('');
            if(ve) ve.innerHTML = '<option value="-">Sem Entrega (Retirada)</option>' + this.data.fleet.map(v => `<option value="${v.id}">${v.id} - ${v.type}</option>`).join('');
        }
    },

    closeModal: function(id) {
        document.getElementById(`modal-${id}`).classList.remove('active');
    },

    initClock: function() {
        setInterval(() => {
            const el = document.getElementById('clock');
            if(el) el.innerText = new Date().toLocaleTimeString('pt-BR');
        }, 1000);
    },

    logout: function() {
        if(confirm('Deseja realmente sair?')) {
            localStorage.removeItem('nexus_session');
            window.location.href = 'index.html';
        }
    }
};

// Iniciar a aplicação
document.addEventListener('DOMContentLoaded', () => app.init());
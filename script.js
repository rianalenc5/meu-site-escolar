// ==========================================
// CONFIGURAÇÕES E ESTADO GLOBAL
// ==========================================
let textoAtualParaLeitura = "";
let textoAtualParaCopia = "";
let condicaoAtualPesquisada = "Geral";
let filtroComentarioAtual = "todos";
let vozesDisponiveis = [];

const IMAGEM_PADRAO_MEDICA = "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1000&q=80";

function lerStorage(chave, padrao) {
  try {
    const item = localStorage.getItem(chave);
    return item ? JSON.parse(item) : padrao;
  } catch (e) {
    return padrao;
  }
}

function carregarVozes() {
  if ('speechSynthesis' in window) {
    vozesDisponiveis = window.speechSynthesis.getVoices();
  }
}

if ('speechSynthesis' in window) {
  carregarVozes();
  window.speechSynthesis.onvoiceschanged = carregarVozes;
}

// Interrompe áudio se o usuário trocar de aba
document.addEventListener('visibilitychange', () => {
  if (document.hidden && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    resetarBotaoAudio(document.getElementById('btn-audio'));
  }
});

// Fecha o painel de tema se clicar fora dele
document.addEventListener('click', (e) => {
  const wrapper = document.querySelector('.theme-settings-wrapper');
  const painel = document.getElementById('painel-tema');
  if (wrapper && painel && painel.style.display === 'block' && !wrapper.contains(e.target)) {
    painel.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  carregarPreferenciasTema();
  controlarNavegacaoPaginas();

  const campoPesquisa = document.getElementById('input-pesquisa');
  if (campoPesquisa) {
    renderizarHistorico();
    renderizarComentarios();
    campoPesquisa.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        buscarDoenca();
      }
    });
  }
});

// ==========================================
// PROTEÇÃO DE ROTA E REDIRECIONAMENTO
// ==========================================
function controlarNavegacaoPaginas() {
  const sessao = lerStorage('medinfo_sessao', null);
  const estaNaPaginaLogin = Boolean(document.getElementById('form-login'));

  if (estaNaPaginaLogin) {
    if (sessao && sessao.email) {
      window.location.href = 'index.html';
    }
  } else {
    if (!sessao || !sessao.email) {
      window.location.href = 'login.html';
      return;
    }

    const saudacaoEl = document.getElementById('usuario-logado-nome');
    if (saudacaoEl) {
      saudacaoEl.textContent = `Olá, ${sessao.nome}`;
    }

    const campoAutor = document.getElementById('autor-nome');
    if (campoAutor && !campoAutor.value) {
      campoAutor.value = sessao.nome;
    }
  }
}

// ==========================================
// AUTENTICAÇÃO COM HASH SHA-256
// ==========================================
async function gerarHashSenha(senha) {
  if (window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return btoa(senha);
}

function alternarVisibilidadeSenha(inputId, botao) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    botao.textContent = '🙈';
  } else {
    input.type = 'password';
    botao.textContent = '👁️';
  }
}

function alternarModoAuth(modo) {
  const formLogin = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');
  const tabLogin = document.getElementById('tab-login');
  const tabCadastro = document.getElementById('tab-cadastro');
  const erroLogin = document.getElementById('erro-login');
  const erroCadastro = document.getElementById('erro-cadastro');

  erroLogin.style.display = 'none';
  erroCadastro.style.display = 'none';

  if (modo === 'login') {
    formLogin.style.display = 'flex';
    formCadastro.style.display = 'none';
    tabLogin.classList.add('active');
    tabCadastro.classList.remove('active');
  } else {
    formLogin.style.display = 'none';
    formCadastro.style.display = 'flex';
    tabLogin.classList.remove('active');
    tabCadastro.classList.add('active');
  }
}

async function realizarCadastro() {
  const nome = document.getElementById('cad-nome').value.trim();
  const email = document.getElementById('cad-email').value.trim().toLowerCase();
  const senha = document.getElementById('cad-senha').value;
  const erroEl = document.getElementById('erro-cadastro');

  if (!nome || !email || !senha) {
    mostrarErroAuth(erroEl, "Preencha todos os campos para criar sua conta.");
    return;
  }

  const usuarios = lerStorage('medinfo_usuarios', []);
  const jaExiste = usuarios.some(u => u.email === email);

  if (jaExiste) {
    mostrarErroAuth(erroEl, "Este e-mail já está cadastrado. Faça login na aba 'Entrar'.");
    return;
  }

  const senhaHash = await gerarHashSenha(senha);
  usuarios.push({ nome, email, senhaHash });
  localStorage.setItem('medinfo_usuarios', JSON.stringify(usuarios));
  localStorage.setItem('medinfo_sessao', JSON.stringify({ nome, email }));

  window.location.href = 'index.html';
}

async function realizarLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const senha = document.getElementById('login-senha').value;
  const erroEl = document.getElementById('erro-login');

  const usuarios = lerStorage('medinfo_usuarios', []);
  const senhaHash = await gerarHashSenha(senha);
  const usuarioValido = usuarios.find(
    u => u.email === email && (u.senhaHash === senhaHash || u.senha === senha)
  );

  if (!usuarioValido) {
    mostrarErroAuth(erroEl, "E-mail ou senha incorretos. Se não tiver conta, clique em 'Criar Conta'.");
    return;
  }

  if (!usuarioValido.senhaHash) {
    usuarioValido.senhaHash = senhaHash;
    delete usuarioValido.senha;
    localStorage.setItem('medinfo_usuarios', JSON.stringify(usuarios));
  }

  localStorage.setItem('medinfo_sessao', JSON.stringify({
    nome: usuarioValido.nome,
    email: usuarioValido.email
  }));

  window.location.href = 'index.html';
}

function sairDaConta() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  localStorage.removeItem('medinfo_sessao');
  window.location.href = 'login.html';
}

function mostrarErroAuth(elemento, mensagem) {
  elemento.textContent = mensagem;
  elemento.style.display = 'block';
}

// ==========================================
// PERSONALIZAÇÃO DE TEMA E CORES
// ==========================================
function alternarPainelTema() {
  const painel = document.getElementById('painel-tema');
  if (!painel) return;
  painel.style.display = painel.style.display === 'none' ? 'block' : 'none';
}

function escurecerHex(hex, fator = 0.82) {
  const limpo = hex.replace('#', '');
  const r = Math.max(0, Math.floor(parseInt(limpo.substring(0, 2), 16) * fator));
  const g = Math.max(0, Math.floor(parseInt(limpo.substring(2, 4), 16) * fator));
  const b = Math.max(0, Math.floor(parseInt(limpo.substring(4, 6), 16) * fator));
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

function obterChaveTema() {
  const sessao = lerStorage('medinfo_sessao', null);
  return sessao && sessao.email ? `medinfo_tema_${sessao.email}` : 'medinfo_tema_geral';
}

function salvarPreferenciasTema(novasPrefs) {
  const atuais = lerStorage(obterChaveTema(), {
    modo: 'light',
    primary: '#0284c7',
    primaryHover: '#0369a1'
  });
  const atualizado = { ...atuais, ...novasPrefs };
  localStorage.setItem(obterChaveTema(), JSON.stringify(atualizado));
  localStorage.setItem('medinfo_tema_geral', JSON.stringify(atualizado));
}

function aplicarCorTema(corPrincipal, corHover) {
  document.documentElement.style.setProperty('--primary', corPrincipal);
  document.documentElement.style.setProperty('--primary-hover', corHover);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', corPrincipal);

  const picker = document.getElementById('input-cor-personalizada');
  if (picker) picker.value = corPrincipal;

  salvarPreferenciasTema({ primary: corPrincipal, primaryHover: corHover });
}

function aplicarCorPersonalizada(corHex) {
  const corHover = escurecerHex(corHex, 0.82);
  aplicarCorTema(corHex, corHover);
}

function definirModoTema(modo) {
  document.documentElement.setAttribute('data-theme', modo);

  const btnClaro = document.getElementById('btn-modo-claro');
  const btnEscuro = document.getElementById('btn-modo-escuro');
  if (btnClaro && btnEscuro) {
    btnClaro.classList.toggle('active', modo === 'light');
    btnEscuro.classList.toggle('active', modo === 'dark');
  }

  salvarPreferenciasTema({ modo });
}

function carregarPreferenciasTema() {
  const prefs = lerStorage(obterChaveTema(), null) || lerStorage('medinfo_tema_geral', null);
  if (!prefs) return;

  if (prefs.modo) {
    document.documentElement.setAttribute('data-theme', prefs.modo);
    const btnClaro = document.getElementById('btn-modo-claro');
    const btnEscuro = document.getElementById('btn-modo-escuro');
    if (btnClaro && btnEscuro) {
      btnClaro.classList.toggle('active', prefs.modo === 'light');
      btnEscuro.classList.toggle('active', prefs.modo === 'dark');
    }
  }

  if (prefs.primary) {
    document.documentElement.style.setProperty('--primary', prefs.primary);
    document.documentElement.style.setProperty('--primary-hover', prefs.primaryHover || escurecerHex(prefs.primary));

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', prefs.primary);

    const picker = document.getElementById('input-cor-personalizada');
    if (picker) picker.value = prefs.primary;
  }
}

function resetarTemaPadrao() {
  definirModoTema('light');
  aplicarCorTema('#0284c7', '#0369a1');
}

// ==========================================
// BUSCA INTELIGENTE E HISTÓRICO
// ==========================================
function preencherEBuscar(termo) {
  document.getElementById('input-pesquisa').value = termo;
  buscarDoenca();
}

function normalizarTexto(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function encontrarDadosClinicos(termoNormalizado) {
  if (typeof baseDadosMedica === 'undefined') return null;

  if (baseDadosMedica[termoNormalizado]) {
    return baseDadosMedica[termoNormalizado];
  }

  if (termoNormalizado.length >= 3) {
    const chaveParcial = Object.keys(baseDadosMedica).find(
      chave => chave.includes(termoNormalizado) || termoNormalizado.includes(chave)
    );
    return chaveParcial ? baseDadosMedica[chaveParcial] : null;
  }

  return null;
}

function salvarNoHistorico(nomeCondicao) {
  const sessao = lerStorage('medinfo_sessao', null);
  if (!sessao) return;

  const chaveHistorico = `medinfo_historico_${sessao.email}`;
  let historico = lerStorage(chaveHistorico, []);

  historico = historico.filter(item => item.toLowerCase() !== nomeCondicao.toLowerCase());
  historico.unshift(nomeCondicao);
  historico = historico.slice(0, 5);

  localStorage.setItem(chaveHistorico, JSON.stringify(historico));
  renderizarHistorico();
}

function renderizarHistorico() {
  const sessao = lerStorage('medinfo_sessao', null);
  const container = document.getElementById('historico-container');
  const listaEl = document.getElementById('lista-historico');
  if (!sessao || !container || !listaEl) return;

  const historico = lerStorage(`medinfo_historico_${sessao.email}`, []);
  listaEl.innerHTML = '';

  if (historico.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';
  historico.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = item;
    btn.addEventListener('click', () => preencherEBuscar(item));
    listaEl.appendChild(btn);
  });
}

function tratarErroImagem(imgEl) {
  if (imgEl.dataset.fallbackAplicado) {
    imgEl.parentElement.style.display = 'none';
    return;
  }
  imgEl.dataset.fallbackAplicado = 'true';
  imgEl.src = IMAGEM_PADRAO_MEDICA;
}

function buscarDoenca() {
  const campoInput = document.getElementById('input-pesquisa');
  const conteinerResposta = document.getElementById('area-resposta');
  const termoChave = normalizarTexto(campoInput.value);

  if (!termoChave) {
    alert("Por favor, digite uma condição de saúde para consultar.");
    return;
  }

  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  conteinerResposta.style.display = 'block';
  conteinerResposta.innerHTML = `
    <div class="ai-card">
      <span class="badge">Sintetizando Análise Médica</span>
      <p style="margin-top: 12px; font-weight: 500;">🔎 Consultando base clínica e compilando dados para <strong>"${escaparHtml(campoInput.value)}"</strong>...</p>
    </div>
  `;

  setTimeout(() => {
    let dados = encontrarDadosClinicos(termoChave);

    if (!dados) {
      const termoLimpo = campoInput.value.trim();
      const termoFormatado = termoLimpo.charAt(0).toUpperCase() + termoLimpo.slice(1);
      dados = {
        nome: termoFormatado,
        imagem: IMAGEM_PADRAO_MEDICA,
        legendaImagem: `Ilustração clínica informativa — ${termoFormatado}`,
        resumo: `${termoFormatado} é uma condição de saúde que exige análise fisiopatológica detalhada. Suas manifestações variam entre quadros agudos e crônicos.`,
        transmissao: `Pode ocorrer via transmissão infecciosa (contato direto, vetor, gotículas) ou desenvolvimento não transmissível (fatores genéticos, hábitos de vida e disfunções metabólicas).`,
        fisiopatologia: `A fisiopatologia envolve alterações funcionais nos tecidos ou órgãos afetados, podendo ser decorrente de processos inflamatórios, infecciosos, metabólicos ou genéticos.`,
        sintomas: `• Sintomas Iniciais: Desconforto geral, astenia (fadiga) e indisposição sistêmica.\n• Manifestações Específicas: Dores locais, febre ou alterações funcionais do sistema atingido.`,
        causa: `Fatores múltiplos podem incluir agentes patogênicos, predisposição genética, fatores ambientais e estilo de vida.`,
        tratamento: `1. Avaliação Médica Especializada;\n2. Prescrição de terapia farmacológica adequada;\n3. Acompanhamento com exames complementares e mudanças de hábitos.`,
        alerta: `⚠️ Procure atendimento médico urgente em caso de falta de ar severa, dor torácica, febre alta persistente ou rebaixamento de consciência.`,
        prevencao: `Adoção de estilo de vida saudável, alimentação balanceada, acompanhamento médico periódico e vacinação atualizada.`
      };
    }

    condicaoAtualPesquisada = dados.nome;
    salvarNoHistorico(dados.nome);
    alterarFiltroComentarios('atual');

    const subtituloComentarios = document.getElementById('subtitulo-comentarios');
    if (subtituloComentarios) {
      subtituloComentarios.textContent = `Deixe suas dúvidas, dicas de prevenção ou relatos sobre ${dados.nome}.`;
    }

    const textoAudio = `${dados.nome}. Resumo: ${dados.resumo}. Como se pega: ${dados.transmissao}. Sintomas principais: ${dados.sintomas}. Tratamento: ${dados.tratamento}. Sinais de alerta: ${dados.alerta}`;

    textoAtualParaLeitura = textoAudio
      .replace(/[•⚠️🚨🧬🩺🦠💊🛡️]/g, '')
      .replace(/\n+/g, '. ');

    textoAtualParaCopia = `🏥 MEDINFO DIGITAL - ${dados.nome.toUpperCase()}\n\n` +
      `📌 Resumo: ${dados.resumo}\n\n` +
      `🚨 Como se pega:\n${dados.transmissao}\n\n` +
      `🩺 Sintomas:\n${dados.sintomas}\n\n` +
      `💊 Tratamento:\n${dados.tratamento}\n\n` +
      `⚠️ Sinais de Alerta:\n${dados.alerta}`;

    const urlImagem = dados.imagem || IMAGEM_PADRAO_MEDICA;
    const legendaImagem = dados.legendaImagem || `Representação visual sobre ${dados.nome}`;

    conteinerResposta.innerHTML = `
      <div class="ai-card">
        <div class="ai-header">
          <span class="badge">Relatório IA MedInfo - Análise Detalhada</span>
          <div class="ai-actions">
            <button type="button" id="btn-audio" class="btn-tts" onclick="executarVoz()">
              🔊 Ouvir Relatório Completo
            </button>
            <select id="velocidade-voz" class="select-speed" title="Velocidade da leitura" onchange="alterarVelocidadeVoz()">
              <option value="0.95" selected>1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
            <button type="button" id="btn-copiar" class="btn-secondary-action" onclick="copiarRelatorio()">
              📋 Copiar
            </button>
            <button type="button" class="btn-secondary-action" onclick="window.print()">
              🖨️ PDF
            </button>
          </div>
        </div>

        <div class="ai-content">
          <h2>${escaparHtml(dados.nome)}</h2>
          
          <figure class="ai-media">
            <img src="${escaparHtml(urlImagem)}" alt="Ilustração sobre ${escaparHtml(dados.nome)}" onerror="tratarErroImagem(this)">
            <figcaption class="ai-media-caption">${escaparHtml(legendaImagem)}</figcaption>
          </figure>

          <p class="ai-summary">${escaparHtml(dados.resumo)}</p>

          <div class="info-grid">
            <div class="info-block highlight">
              <h3>🚨 Como se pega / Formas de Contágio</h3>
              <p style="white-space: pre-line;">${escaparHtml(dados.transmissao)}</p>
            </div>

            ${dados.fisiopatologia ? `
            <div class="info-block">
              <h3>🧬 Fisiopatologia e Mecanismo</h3>
              <p>${escaparHtml(dados.fisiopatologia)}</p>
            </div>
            ` : ''}

            <div class="info-block">
              <h3>🩺 Manifestações Clínicas & Sintomas</h3>
              <p style="white-space: pre-line;">${escaparHtml(dados.sintomas)}</p>
            </div>
            
            <div class="info-block">
              <h3>🦠 Etiologia & Fatores de Risco (Causas)</h3>
              <p style="white-space: pre-line;">${escaparHtml(dados.causa)}</p>
            </div>

            <div class="info-block">
              <h3>💊 Conduta Terapêutica & Tratamento</h3>
              <p style="white-space: pre-line;">${escaparHtml(dados.tratamento)}</p>
            </div>

            <div class="info-block alert">
              <h3>⚠️ Sinais de Alerta & Complicações Gravíssimas</h3>
              <p style="white-space: pre-line;">${escaparHtml(dados.alerta)}</p>
            </div>

            <div class="info-block">
              <h3>🛡️ Medidas Preventivas & Estilo de Vida</h3>
              <p style="white-space: pre-line;">${escaparHtml(dados.prevencao)}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }, 400);
}

function copiarRelatorio() {
  if (!textoAtualParaCopia) return;
  const btn = document.getElementById('btn-copiar');

  const confirmarCopia = () => {
    if (btn) {
      btn.textContent = '✅ Copiado!';
      setTimeout(() => {
        btn.textContent = '📋 Copiar';
      }, 2000);
    }
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textoAtualParaCopia)
      .then(confirmarCopia)
      .catch(() => copiarFallback(textoAtualParaCopia, confirmarCopia));
  } else {
    copiarFallback(textoAtualParaCopia, confirmarCopia);
  }
}

function copiarFallback(texto, callback) {
  const area = document.createElement('textarea');
  area.value = texto;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand('copy');
    callback();
  } catch (e) {
    alert("Não foi possível copiar automaticamente.");
  }
  document.body.removeChild(area);
}

// ==========================================
// RECURSO DE SÍNTESE DE VOZ (TTS)
// ==========================================
function alterarVelocidadeVoz() {
  if ('speechSynthesis' in window && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
    window.speechSynthesis.cancel();
    executarVoz();
  }
}

function executarVoz() {
  if (!('speechSynthesis' in window)) {
    alert("Seu navegador não possui suporte para reprodução de áudio.");
    return;
  }

  const btn = document.getElementById('btn-audio');
  const selectVelocidade = document.getElementById('velocidade-voz');
  const velocidade = selectVelocidade ? parseFloat(selectVelocidade.value) : 0.95;

  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
    resetarBotaoAudio(btn);
    return;
  }

  if (!textoAtualParaLeitura) return;

  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  if (vozesDisponiveis.length === 0) {
    vozesDisponiveis = window.speechSynthesis.getVoices();
  }

  const vozNatural = vozesDisponiveis.find(v => 
    v.lang.toLowerCase().includes('pt-br') && 
    (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Luciana'))
  ) || vozesDisponiveis.find(v => v.lang.toLowerCase().includes('pt'));

  const frases = textoAtualParaLeitura.match(/[^.!?]+[.!?]+/g) || [textoAtualParaLeitura];

  if (btn) {
    btn.innerHTML = '⏹️ Parar Áudio';
    btn.classList.add('active');
  }

  frases.forEach((frase, index) => {
    const ut = new SpeechSynthesisUtterance(frase.trim());
    ut.lang = 'pt-BR';
    ut.rate = velocidade;

    if (vozNatural) {
      ut.voice = vozNatural;
    }

    if (index === frases.length - 1) {
      ut.onend = () => resetarBotaoAudio(btn);
    }

    ut.onerror = (e) => {
      if (e.error !== 'interrupted') {
        resetarBotaoAudio(btn);
      }
    };

    window.speechSynthesis.speak(ut);
  });
}

function resetarBotaoAudio(btn) {
  if (btn) {
    btn.innerHTML = '🔊 Ouvir Relatório Completo';
    btn.classList.remove('active');
  }
}

// ==========================================
// SISTEMA DE COMENTÁRIOS CONTEXTUALIZADO
// ==========================================
function alterarFiltroComentarios(modo) {
  filtroComentarioAtual = modo;

  const btnTodos = document.getElementById('filtro-todos');
  const btnAtual = document.getElementById('filtro-atual');

  if (btnTodos && btnAtual) {
    btnTodos.classList.toggle('active', modo === 'todos');
    btnAtual.classList.toggle('active', modo === 'atual');
  }

  renderizarComentarios();
}

function atualizarAbasFiltroComentarios() {
  const btnAtual = document.getElementById('filtro-atual');
  if (!btnAtual) return;

  if (condicaoAtualPesquisada && condicaoAtualPesquisada !== "Geral") {
    btnAtual.style.display = 'inline-block';
    btnAtual.textContent = `Sobre ${condicaoAtualPesquisada}`;
  } else {
    btnAtual.style.display = 'none';
  }
}

function publicarComentario() {
  const inputNome = document.getElementById('autor-nome');
  const selectTipo = document.getElementById('autor-tipo');
  const inputMensagem = document.getElementById('autor-mensagem');
  const sessao = lerStorage('medinfo_sessao', null);

  const nome = inputNome.value.trim();
  const tipo = selectTipo ? selectTipo.value : 'relato';
  const mensagem = inputMensagem.value.trim();

  if (!nome || !mensagem) {
    alert("Preencha todos os campos antes de enviar o comentário.");
    return;
  }

  const comentarios = lerStorage('medinfo_comentarios', []);

  const novoComentario = {
    id: Date.now(),
    nome: nome,
    tipo: tipo,
    emailAutor: sessao ? sessao.email : null,
    condicao: condicaoAtualPesquisada,
    mensagem: mensagem,
    data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  };

  comentarios.unshift(novoComentario);
  localStorage.setItem('medinfo_comentarios', JSON.stringify(comentarios));

  inputMensagem.value = '';
  renderizarComentarios();
}

function renderizarComentarios() {
  const feed = document.getElementById('feed-comentarios');
  if (!feed) return;

  atualizarAbasFiltroComentarios();

  const sessao = lerStorage('medinfo_sessao', null);
  const comentarios = lerStorage('medinfo_comentarios', []);

  const listaFiltrada = filtroComentarioAtual === 'atual' && condicaoAtualPesquisada !== 'Geral'
    ? comentarios.filter(item => item.condicao && item.condicao.toLowerCase() === condicaoAtualPesquisada.toLowerCase())
    : comentarios;

  feed.innerHTML = '';

  if (listaFiltrada.length === 0) {
    const textoVazio = filtroComentarioAtual === 'atual'
      ? `Nenhum comentário registrado sobre <strong>${escaparHtml(condicaoAtualPesquisada)}</strong> ainda. Seja o primeiro!`
      : 'Nenhum comentário registrado até o momento. Seja o primeiro a compartilhar!';
    feed.innerHTML = `<p class="empty-state">${textoVazio}</p>`;
    return;
  }

  listaFiltrada.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'comment-card';

    const podeExcluir = sessao && item.emailAutor === sessao.email;
    const tagCondicao = item.condicao ? `<span class="comment-topic-tag">${escaparHtml(item.condicao)}</span>` : '';

    const isDuvida = item.tipo === 'duvida';
    const tagTipo = isDuvida
      ? `<span class="comment-type-tag duvida">❓ Dúvida</span>`
      : `<span class="comment-type-tag relato">🩺 Relato</span>`;

    card.innerHTML = `
      <div class="comment-header">
        <div class="comment-badges">
          <span class="comment-author">${escaparHtml(item.nome)}</span>
          ${tagTipo}
          ${tagCondicao}
        </div>
        <div>
          <span class="comment-date">${item.data}</span>
          ${podeExcluir ? `<button type="button" class="btn-delete" onclick="deletarComentario(${item.id})" title="Excluir">&times;</button>` : ''}
        </div>
      </div>
      <p class="comment-body">${escaparHtml(item.mensagem)}</p>
    `;

    feed.appendChild(card);
  });
}

function deletarComentario(id) {
  const sessao = lerStorage('medinfo_sessao', null);
  if (!sessao) return;

  let comentarios = lerStorage('medinfo_comentarios', []);
  comentarios = comentarios.filter(item => !(item.id === id && item.emailAutor === sessao.email));

  localStorage.setItem('medinfo_comentarios', JSON.stringify(comentarios));
  renderizarComentarios();
}

function escaparHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// REGISTRO DO PWA (MODO APLICATIVO E OFFLINE)
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(() => console.log('MedInfo PWA pronto para uso offline.'))
      .catch((erro) => console.warn('Falha ao registrar Service Worker:', erro));
  });
}
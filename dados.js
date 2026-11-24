// ==========================================
// BANCO DE DADOS MÉDICO (dados.js)
// ==========================================
const baseDadosMedica = {
  "dengue": {
    nome: "Dengue",
    imagem: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80",
    legendaImagem: "Prevenção, hidratação e cuidados clínicos contra a Dengue",
    resumo: "Infecção viral aguda causada pelo vírus da Dengue (DENV-1, DENV-2, DENV-3 ou DENV-4), transmitida pela picada da fêmea do mosquito Aedes aegypti.",
    transmissao: "• Picada da fêmea do mosquito Aedes aegypti infectada pelo vírus.\n• O mosquito se contamina ao picar uma pessoa doente e transmite o vírus para outras pessoas após 8 a 12 dias de incubação no inseto.\n• NÃO há transmissão direta de pessoa para pessoa (contato físico, saliva ou ar).",
    fisiopatologia: "O vírus infecta células do sistema imune e endoteliais, podendo causar extravasamento plasmático e alteração na coagulação sanguínea.",
    sintomas: "Febre alta de início súbito (39°C a 40°C), cefaleia severa, dor retro-orbital, mialgia intensa, artralgia, prostração e exantema maculopapular.",
    causa: "Vírus RNA da família Flaviviridae. Transmissão exclusiva por vetor (Aedes aegypti ou Aedes albopictus infectados).",
    tratamento: "Hidratação oral vigorosa com soro de reidratação oral e água, repouso absoluto. Uso de analgésicos e antitérmicos simples como Paracetamol e Dipirona.",
    alerta: "⚠️ Sinais de alarme: Dor abdominal intensa, vômitos persistentes e sangramento de mucosas. EVITAR rigorosamente Ácido Acetilsalicílico (Aspirina) e Ibuprofeno.",
    prevencao: "Eliminar recipientes com água parada, uso diário de repelentes com DEET ou Icaridina e telas nas janelas."
  },
  "gripe": {
    nome: "Gripe (Influenza)",
    imagem: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1000&q=80",
    legendaImagem: "Infecção respiratória viral aguda — prevenção e cuidados",
    resumo: "Infecção viral respiratória aguda contagiosa do sistema respiratório, podendo acometer vias aéreas superiores e inferiores.",
    transmissao: "• Inalação de gotículas respiratórias expelidas quando a pessoa infectada tosse, espirra ou fala.\n• Contato direto ou indireto com superfícies e objetos contaminados por secreções respiratórias, seguido do toque nas mucosas da boca, nariz ou olhos.",
    fisiopatologia: "O vírus ataca o epitélio respiratório, provocando inflamação local, necrose celular e resposta imune sistêmica.",
    sintomas: "Febre alta (> 38°C), calafrios, tosse seca, dor de garganta, coriza, dores musculares (mialgia) severas e fadiga extrema.",
    causa: "Vírus Influenza (tipos A e B causam as epidemias sazonais). Transmitido via gotículas expelidas ao falar, tossir ou espirrar.",
    tratamento: "Repouso, alta ingestão hídrica e medicamentos sintomáticos. Antivirais específicos (Oseltamivir/Tamiflu) para casos graves ou grupos de risco.",
    alerta: "Sinais de gravidade: Falta de ar (dispneia), dor ou pressão persistente no peito, cianose (lábios arroxados) e confusão mental.",
    prevencao: "Vacinação anual atualizada contra a Influenza, higienização constante das mãos e etiqueta respiratória."
  },
  "diabetes": {
    nome: "Diabetes Mellitus",
    imagem: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80",
    legendaImagem: "Monitoramento glicêmico e controle metabólico no Diabetes",
    resumo: "Distúrbio metabólico crônico e heterogêneo caracterizado pela hiperglicemia persistente, resultante de defeitos na secreção ou ação da insulina.",
    transmissao: "• NÃO é uma doença contagiosa (não se pega de outra pessoa).\n• Tipo 1: Desenvolvimento autoimune (o próprio sistema imunológico destrói as células do pâncreas).\n• Tipo 2: Adquirida ao longo da vida devido à combinação de predisposição genética, alimentação inadequada, sedentarismo e obesidade.",
    fisiopatologia: "Tipo 1: Destruição autoimune das células beta pancreáticas. Tipo 2: Resistência periférica à insulina associada à deficiência relativa de sua secreção.",
    sintomas: "Poliúria (urinar em excesso), Polidipsia (sede excessiva), Polifagia (fome constante) e Perda inexplicável de peso.",
    causa: "Fatores genéticos e autoimunes (Tipo 1). Estilo de vida, obesidade abdominal, sedentarismo e predisposição genética (Tipo 2).",
    tratamento: "Tipo 1: Insulinoterapia contínua. Tipo 2: Alimentação com baixo índice glicêmico, exercícios físicos, antidiabéticos orais e insulina se necessário.",
    alerta: "Complicações agudas como Cetoacidose Diabética. A longo prazo: risco de retinopatia, nefropatia e doenças cardiovasculares.",
    prevencao: "Manutenção do peso adequado, prática de atividades físicas regulares e redução de açúcares refinados."
  },
  "hipertensao": {
    nome: "Hipertensão Arterial Sistêmica (HAS)",
    imagem: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80",
    legendaImagem: "Aferição regular da pressão arterial e saúde cardiovascular",
    resumo: "Condição clínica multifatorial caracterizada por níveis elevados e sustentados da pressão arterial (PA ≥ 140/90 mmHg).",
    transmissao: "• NÃO é transmissível de pessoa para pessoa.\n• Desenvolve-se gradualmente ao longo dos anos devido ao enrijecimento das artérias, hábitos alimentares (excesso de sal), falta de atividade física, estresse e hereditariedade.",
    fisiopatologia: "Aumento da resistência vascular periférica e/ou do débito cardíaco, levando ao enrijecimento e lesão do endotélio vascular.",
    sintomas: "Frequentemente assintomática. Em picos: dor na nuca (occipital), tontura, zumbido no ouvido e visão embaçada.",
    causa: "Fatores genéticos, consumo excessivo de sódio, obesidade, sedentarismo, tabagismo e estresse crônico.",
    tratamento: "Uso contínuo de anti-hipertensivos prescritos por médico, reeducação alimentar (dieta DASH) e exercícios aeróbicos.",
    alerta: "Crise Hipertensiva (PA > 180/120 mmHg) com dor no peito ou alteração neurológica exige atendimento de emergência.",
    prevencao: "Redução do consumo de sal/sódio para menos de 5g/dia, controle de peso e eliminação do tabagismo."
  }
};
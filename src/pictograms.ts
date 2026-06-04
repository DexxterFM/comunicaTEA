import { Smile, Heart, Users, Coffee, BookOpen, Sparkles, Frown, Droplet, LucideIcon } from 'lucide-react';

export interface PictogramCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
  textColor: string;
  borderColor: string;
}

export interface PictogramItem {
  emoji: string;
  label: string;
  keywords: string[];
  category: string;
  speechText: string;
  pecsDescription?: string; // Guidance on how this item fits PECS phase training
}

export const pictogramCategories: PictogramCategory[] = [
  { id: 'actions', name: 'Ações / Verbos', iconName: 'Sparkles', color: 'bg-amber-55 text-amber-950', textColor: 'text-amber-800', borderColor: 'border-amber-300' },
  { id: 'feelings', name: 'Sentimentos / Emoções', iconName: 'Smile', color: 'bg-indigo-55 text-indigo-950', textColor: 'text-indigo-805', borderColor: 'border-indigo-300' },
  { id: 'basic_needs', name: 'Necessidades Básicas', iconName: 'Heart', color: 'bg-red-55 text-red-950', textColor: 'text-red-800', borderColor: 'border-red-300' },
  { id: 'people', name: 'Pessoas e Família', iconName: 'Users', color: 'bg-sky-55 text-sky-950', textColor: 'text-sky-800', borderColor: 'border-sky-300' },
  { id: 'food', name: 'Alimentos e Bebidas', iconName: 'Coffee', color: 'bg-emerald-55 text-emerald-950', textColor: 'text-emerald-800', borderColor: 'border-emerald-300' },
  { id: 'objects', name: 'Brinquedos e Objetos', iconName: 'BookOpen', color: 'bg-pink-55 text-pink-950', textColor: 'text-pink-800', borderColor: 'border-pink-300' },
  { id: 'places', name: 'Lugares e Rotina', iconName: 'Frown', color: 'bg-teal-55 text-teal-950', textColor: 'text-teal-800', borderColor: 'border-teal-300' },
  { id: 'school', name: 'Escola / Terapia', iconName: 'Droplet', color: 'bg-purple-55 text-purple-950', textColor: 'text-purple-800', borderColor: 'border-purple-300' }
];

export const pictogramImagesDB: PictogramItem[] = [
  // 1. Actions / Ações
  {
    emoji: '🙋‍♂️',
    label: 'Quero',
    keywords: ['quero', 'desejar', 'pedir', 'preciso', 'favor', 'ajudar'],
    category: 'actions',
    speechText: 'Eu quero',
    pecsDescription: 'Utilizado na Fase I e II do PECS para iniciar pedidos espontâneos de alta motivação.'
  },
  {
    emoji: '🥤',
    label: 'Beber',
    keywords: ['beber', 'agua', 'copo', 'sede', 'suco', 'liquido'],
    category: 'actions',
    speechText: 'Beber',
    pecsDescription: 'Incentiva a expressão de sede física, regulando o comportamento comunicativo.'
  },
  {
    emoji: '🍽️',
    label: 'Comer',
    keywords: ['comer', 'fome', 'mastigar', 'refeição', 'almoço', 'janta', 'comida'],
    category: 'actions',
    speechText: 'Comer',
    pecsDescription: 'Crucial para autonomia alimentar diária em casa e na clínica.'
  },
  {
    emoji: '🤲',
    label: 'Me dá',
    keywords: ['dar', 'pegar', 'receber', 'trazer', 'por favor'],
    category: 'actions',
    speechText: 'Me dá',
    pecsDescription: 'Promove a entrega voluntária e o engajamento físico durante trocas de reforçadores.'
  },
  {
    emoji: '🤝',
    label: 'Me ajuda',
    keywords: ['ajudar', 'socorro', 'apoio', 'auxilio', 'dificuldade', 'ajuda'],
    category: 'actions',
    speechText: 'Me ajuda, por favor',
    pecsDescription: 'Reduz frustrações e crises de birra ao ensinar o pedido verbal alternativo de cooperação.'
  },
  {
    emoji: '🛑',
    label: 'Parar',
    keywords: ['parar', 'chega', 'nao quero', 'interromper', 'basta', 'stop'],
    category: 'actions',
    speechText: 'Parar',
    pecsDescription: 'Reforço negativo saudável. Dá ao paciente o direito de pausar atividades incômodas.'
  },
  {
    emoji: '🛌',
    label: 'Dormir',
    keywords: ['dormir', 'sono', 'deitar', 'cansado', 'ninar', 'cama'],
    category: 'actions',
    speechText: 'Dormir',
    pecsDescription: 'Comunicação voltada à regulação do ciclo de descanso e rotinas noturnas.'
  },
  {
    emoji: '🧼',
    label: 'Lavar',
    keywords: ['lavar', 'limpar', 'higiene', 'sabonete', 'agua', 'maos'],
    category: 'actions',
    speechText: 'Lavar',
    pecsDescription: 'Instrução e expressão de rotinas essenciais de higiene corporal.'
  },
  {
    emoji: '🚶',
    label: 'Ir',
    keywords: ['ir', 'andar', 'caminhar', 'sair', 'passeio', 'rua'],
    category: 'actions',
    speechText: 'Ir',
    pecsDescription: 'Indica intenção de locomoção ou transição de ambientes.'
  },
  {
    emoji: '👀',
    label: 'Ver',
    keywords: ['ver', 'olhar', 'assistir', 'enxergar', 'tela', 'desenho'],
    category: 'actions',
    speechText: 'Ver',
    pecsDescription: 'Uso cognitivo para chamar atenção conjunta sobre objetos de interesse mútuo.'
  },
  {
    emoji: '👂',
    label: 'Ouvir',
    keywords: ['ouvir', 'som', 'barulho', 'escutar', 'musica', 'barulhento'],
    category: 'actions',
    speechText: 'Ouvir',
    pecsDescription: 'Relacionado ao processamento auditivo de estímulos do ambiente.'
  },
  {
    emoji: '🗣️',
    label: 'Falar',
    keywords: ['falar', 'dizer', 'contar', 'conversar', 'boca'],
    category: 'actions',
    speechText: 'Falar',
    pecsDescription: 'Estímulo à vocalização assistida concomitante aos cartões.'
  },
  {
    emoji: '🧩',
    label: 'Brincar',
    keywords: ['brincar', 'jogo', 'diversao', 'amigo', 'peca'],
    category: 'actions',
    speechText: 'Brincar',
    pecsDescription: 'Promove a socialização, o brincar livre e o uso funcional de brinquedos.'
  },
  {
    emoji: '🎨',
    label: 'Pintar',
    keywords: ['pintar', 'desenhar', 'colorir', 'arte', 'canetinha', 'pincel'],
    category: 'actions',
    speechText: 'Pintar',
    pecsDescription: 'Atividade motora fina de autorregulação e expressão livre.'
  },
  {
    emoji: '✍️',
    label: 'Escrever',
    keywords: ['escrever', 'papel', 'caneta', 'lapis', 'escola', 'tarefa'],
    category: 'actions',
    speechText: 'Escrever',
    pecsDescription: 'Utilizado no suporte pedagógico acadêmico.'
  },
  {
    emoji: '🏃',
    label: 'Correr',
    keywords: ['correr', 'pressa', 'exercicio', 'fugir', 'pular'],
    category: 'actions',
    speechText: 'Correr',
    pecsDescription: 'Solicitação sensorial de queima de energia motora grossa.'
  },
  {
    emoji: '🎶',
    label: 'Cantar',
    keywords: ['cantar', 'musica', 'voz', 'microfone', 'musiquinha'],
    category: 'actions',
    speechText: 'Cantar',
    pecsDescription: 'Utilizado na musicoterapia para ativação de redes neurais da fala.'
  },
  {
    emoji: '🧎',
    label: 'Sentar',
    keywords: ['sentar', 'cadeira', 'sentado', 'chao', 'calma'],
    category: 'actions',
    speechText: 'Sentar',
    pecsDescription: 'Comandos direcionais ou autorregulação em posições.'
  },

  // 2. Feelings / Sentimentos
  {
    emoji: '😊',
    label: 'Feliz',
    keywords: ['feliz', 'alegre', 'contente', 'bem', 'otimo', 'sorriso'],
    category: 'feelings',
    speechText: 'Estou feliz',
    pecsDescription: 'Fase IV e V do PECS. Incentiva a habilidade de expressar estados emocionais internos.'
  },
  {
    emoji: '😢',
    label: 'Triste',
    keywords: ['triste', 'chorar', 'magoado', 'chateado', 'tristeza'],
    category: 'feelings',
    speechText: 'Estou triste',
    pecsDescription: 'Fundamental para exteriorizar angústias sem recorrer a crises auto-lesivas.'
  },
  {
    emoji: '😠',
    label: 'Bravo',
    keywords: ['bravo', 'irritado', 'raiva', 'furioso', 'nervoso'],
    category: 'feelings',
    speechText: 'Estou com raiva',
    pecsDescription: 'Permite ao paciente nomear a sua frustração emocional de maneira socialmente aceitável.'
  },
  {
    emoji: '🥱',
    label: 'Cansado',
    keywords: ['cansado', 'sono', 'exausto', 'preguiça', 'fadiga'],
    category: 'feelings',
    speechText: 'Estou cansado',
    pecsDescription: 'Indica a necessidade de pausa nas demandas diárias.'
  },
  {
    emoji: '😨',
    label: 'Medo',
    keywords: ['medo', 'assustado', 'terror', 'sustado', 'barulho', 'escuro'],
    category: 'feelings',
    speechText: 'Estou com medo',
    pecsDescription: 'Permite identificar gatilhos sensoriais ou ambientais que geram pavor ou sobressalto.'
  },
  {
    emoji: '😰',
    label: 'Ansioso',
    keywords: ['ansioso', 'nervoso', 'agitado', 'apreensivo', 'angustia'],
    category: 'feelings',
    speechText: 'Estou ansioso',
    pecsDescription: 'Útil nas transições de rotina onde a quebra de padrão de atividades causa ansiedade.'
  },
  {
    emoji: '🤕',
    label: 'Dor',
    keywords: ['dor', 'doendo', 'machucado', 'dodoi', 'ferida', 'cabeca', 'barriga'],
    category: 'feelings',
    speechText: 'Estou com dor',
    pecsDescription: 'Gatilho de extrema importância médica e reabilitiva para atuar de forma ágil em intercorrências físicas.'
  },
  {
    emoji: '🤢',
    label: 'Enojado / Enjoado',
    keywords: ['enjoo', 'com nojo', 'náusea', 'vomitar', 'mal', 'doente', 'ruim'],
    category: 'feelings',
    speechText: 'Estou enjoado',
    pecsDescription: 'Expressão de desconforto gastrointestinal ou hipersensibilidade olfativa/gustativa.'
  },
  {
    emoji: '😌',
    label: 'Calmo',
    keywords: ['calmo', 'relaxado', 'tranquilo', 'paz', 'alivio'],
    category: 'feelings',
    speechText: 'Estou calmo',
    pecsDescription: 'Reforça o reconhecimento dos momentos de autorregulação emocional alcançados.'
  },
  {
    emoji: '🤪',
    label: 'Brincalhão',
    keywords: ['brincalhao', 'bobo', 'rir', 'piada', 'engraçado'],
    category: 'feelings',
    speechText: 'Estou brincalhão',
    pecsDescription: 'Comunicação recreativa e expressão de bom humor com parceiros.'
  },

  // 3. Basic Needs / Necessidades Básicas
  {
    emoji: '🚽',
    label: 'Banheiro',
    keywords: ['banheiro', 'xixi', 'coco', 'sanitario', 'privada', 'urina'],
    category: 'basic_needs',
    speechText: 'Quero ir ao banheiro',
    pecsDescription: 'Necessidade diária de alta importância de independência corporal (desfralde asistido).'
  },
  {
    emoji: '💧',
    label: 'Água',
    keywords: ['agua', 'sede', 'copo', 'beber', 'garrafa', 'liquido'],
    category: 'basic_needs',
    speechText: 'Quero beber água',
    pecsDescription: 'Pedido altamente pragmático ensinado nos primeiros dias de intervenção terapêutica.'
  },
  {
    emoji: '🪥',
    label: 'Escovar Dentes',
    keywords: ['dente', 'escova', 'pasta', 'higiene', 'bochecho', 'boca', 'limpar'],
    category: 'basic_needs',
    speechText: 'Quero escovar os dentes',
    pecsDescription: 'Estruturação de rotinas pós-refeições fundamentais.'
  },
  {
    emoji: '🧼',
    label: 'Sabão',
    keywords: ['lavar mao', 'banho', 'higiene', 'limpar', 'torneira'],
    category: 'basic_needs',
    speechText: 'Lavar as mãos',
    pecsDescription: 'Higiene e esterilização de forma autônoma e guiada.'
  },
  {
    emoji: '🚿',
    label: 'Banho',
    keywords: ['banho', 'chuveiro', 'agua quente', 'limpar', 'limpo'],
    category: 'basic_needs',
    speechText: 'Quero tomar banho',
    pecsDescription: 'Integração de estímulos táteis da água durante a rotina do lar.'
  },
  {
    emoji: '💤',
    label: 'Soneca',
    keywords: ['sono', 'dormir', 'deitar', 'descanso', 'cama'],
    category: 'basic_needs',
    speechText: 'Preciso de uma soneca',
    pecsDescription: 'Auxilia na descompressão sensorial em momentos de fadiga escolar ou clínica.'
  },
  {
    emoji: '💊',
    label: 'Remédio',
    keywords: ['remedio', 'dor', 'xarope', 'doutor', 'comprimido', 'medicação'],
    category: 'basic_needs',
    speechText: 'Tomar remédio',
    pecsDescription: 'Compreensão de tratamentos de saúde em andamento.'
  },
  {
    emoji: '🥶',
    label: 'Frio',
    keywords: ['frio', 'gelado', 'casaco', 'tremer', 'ar condicionado'],
    category: 'basic_needs',
    speechText: 'Estou com frio',
    pecsDescription: 'Solicitação física para agasalho ou ajuste de temperatura.'
  },
  {
    emoji: '🥵',
    label: 'Calor',
    keywords: ['calor', 'quente', 'sol', 'suando', 'ventilador'],
    category: 'basic_needs',
    speechText: 'Estou com calor',
    pecsDescription: 'Facilita ajustes de conforto físico (retirar peças de roupa, pedir água).'
  },
  {
    emoji: '🩹',
    label: 'Bandaid',
    keywords: ['curativo', 'machucado', 'ralado', 'dor', 'sangue'],
    category: 'basic_needs',
    speechText: 'Colocar um curativo',
    pecsDescription: 'Alento psicológico tátil para acalmar pequenos desconfortos corporais.'
  },

  // 4. People / Pessoas
  {
    emoji: '👦',
    label: 'Eu',
    keywords: ['eu', 'mim', 'meu', 'garoto', 'menino', 'garota', 'pessoa'],
    category: 'people',
    speechText: 'Eu',
    pecsDescription: 'Formulação inicial da auto-identidade nos painéis.'
  },
  {
    emoji: '👩',
    label: 'Mamãe',
    keywords: ['mae', 'mamae', 'mulher', 'familia', 'amor'],
    category: 'people',
    speechText: 'Mamãe',
    pecsDescription: 'Referência ao principal canal de afeto e segurança familiar.'
  },
  {
    emoji: '👨',
    label: 'Papai',
    keywords: ['pai', 'papai', 'homem', 'familia', 'responsavel'],
    category: 'people',
    speechText: 'Papai',
    pecsDescription: 'Referência ao canal de apoio e segurança familiar.'
  },
  {
    emoji: '👩‍⚕️',
    label: 'Terapeuta',
    keywords: ['terapeuta', 'medica', 'tia', 'psicóloga', 'fono', 'terapia', 'clinica'],
    category: 'people',
    speechText: 'Minha Terapeuta',
    pecsDescription: 'Identificação de figuras de condução de reabilitação e desenvolvimento.'
  },
  {
    emoji: '👩‍🏫',
    label: 'Professor',
    keywords: ['professor', 'escolinha', 'tia', 'aula', 'escola'],
    category: 'people',
    speechText: 'Meu Professor',
    pecsDescription: 'Comunicação integrada entre equipes especializadas e escola.'
  },
  {
    emoji: '🧒',
    label: 'Amigo',
    keywords: ['amigo', 'colega', 'crianca', 'parceiro', 'brincar'],
    category: 'people',
    speechText: 'Meu amigo',
    pecsDescription: 'Fomenta habilidades de interação social e cooperação mútua.'
  },
  {
    emoji: '👴',
    label: 'Vovô',
    keywords: ['vovo', 'avô', 'velhinho', 'familia'],
    category: 'people',
    speechText: 'Vovô',
    pecsDescription: 'Referência à rede primária estendida familiar.'
  },
  {
    emoji: '👵',
    label: 'Vovó',
    keywords: ['vovo', 'avó', 'velhinha', 'familia'],
    category: 'people',
    speechText: 'Vovó',
    pecsDescription: 'Referência à rede primária estendida familiar.'
  },
  {
    emoji: '🐕',
    label: 'Cachorrinho',
    keywords: ['cachorro', 'cao', 'pet', 'animal', 'bichinho', 'fofo'],
    category: 'people',
    speechText: 'Cachorro',
    pecsDescription: 'Comunicação afetiva com animais de estimação terapêuticos.'
  },
  {
    emoji: '🐈',
    label: 'Gatinho',
    keywords: ['gato', 'miau', 'pet', 'animal', 'bichinho'],
    category: 'people',
    speechText: 'Gato',
    pecsDescription: 'Estímulo à afetividade com pets domésticos.'
  },

  // 5. Food / Alimentos
  {
    emoji: '🍎',
    label: 'Maçã',
    keywords: ['maca', 'fruta', 'lanche', 'saudavel', 'comer'],
    category: 'food',
    speechText: 'Comer maçã',
    pecsDescription: 'Pedido de comida com textura rígida, importante para motricidade orofacial.'
  },
  {
    emoji: '🍌',
    label: 'Banana',
    keywords: ['banana', 'fruta', 'doce', 'lanche', 'saudavel'],
    category: 'food',
    speechText: 'Comer banana',
    pecsDescription: 'Reforçador alimentar nutritivo e fácil de digerir.'
  },
  {
    emoji: '🥛',
    label: 'Leite',
    keywords: ['leite', 'copo', 'bebida', 'cafe', 'fome', 'beber'],
    category: 'food',
    speechText: 'Beber leite',
    pecsDescription: 'Nutrição diária rotineira matinal ou noturna.'
  },
  {
    emoji: '🧃',
    label: 'Suco',
    keywords: ['suco', 'caixinha', 'fruta', 'beber', 'doce', 'lanche'],
    category: 'food',
    speechText: 'Beber suco de caixinha',
    pecsDescription: 'Alta preferência sensorial (reforçador potente em treinamentos).'
  },
  {
    emoji: '🍪',
    label: 'Biscoito',
    keywords: ['biscoito', 'bolacha', 'doce', 'chocolate', 'crocante'],
    category: 'food',
    speechText: 'Comer biscoito',
    pecsDescription: 'Reforçador seco muito comum em metodologias ABA/PECS iniciais.'
  },
  {
    emoji: '🍞',
    label: 'Pão',
    keywords: ['pao', 'trigo', 'manteiga', 'cafe da manha', 'comer'],
    category: 'food',
    speechText: 'Comer pão',
    pecsDescription: 'Alimento básico nas manhãs e tardes no lar.'
  },
  {
    emoji: '🍛',
    label: 'Almoçar',
    keywords: ['arroz', 'feijao', 'almoco', 'janta', 'comida', 'prato'],
    category: 'food',
    speechText: 'Quero comer meu prato de arroz e feijão',
    pecsDescription: 'Comunicação voltada às principais refeições estruturadas.'
  },
  {
    emoji: '🍕',
    label: 'Pizza',
    keywords: ['pizza', 'queijo', 'massa', 'fast food', 'gostoso', 'comida'],
    category: 'food',
    speechText: 'Comer pizza',
    pecsDescription: 'Para refeições festivas ou momentos de lazer com a família.'
  },
  {
    emoji: '🥩',
    label: 'Carne',
    keywords: ['carne', 'churrasco', 'frango', 'jantar', 'proteina'],
    category: 'food',
    speechText: 'Comer carne',
    pecsDescription: 'Expressão de preferências alimentícias salgadas.'
  },
  {
    emoji: '🍫',
    label: 'Chocolate',
    keywords: ['chocolate', 'doce', 'cacau', 'sobremesa', 'gostoso'],
    category: 'food',
    speechText: 'Quero chocolate',
    pecsDescription: 'Reforçador altamente cobiçado de baixíssima latência (oferecer em micro porções).'
  },
  {
    emoji: '🍦',
    label: 'Sorvete',
    keywords: ['sorvete', 'doce', 'gelado', 'picole', 'calor'],
    category: 'food',
    speechText: 'Comer sorvete',
    pecsDescription: 'Reforçador gelado de verão com fortes propriedades de toque sensorial língua.'
  },
  {
    emoji: '🍰',
    label: 'Bolo',
    keywords: ['bolo', 'festa', 'doce', 'aniversario', 'lanchinho'],
    category: 'food',
    speechText: 'Comer bolo',
    pecsDescription: 'Alimento festivo de grande impacto visual.'
  },

  // 6. Objects / Brinquedos e Objetos
  {
    emoji: '🧸',
    label: 'Ursino',
    keywords: ['brinquedo', 'ursinho', 'pelucia', 'fofinho', 'bicho', 'conchego'],
    category: 'objects',
    speechText: 'Pegar meu ursinho de pelúcia',
    pecsDescription: 'Objeto de transição comum utilizado para segurança emocional.'
  },
  {
    emoji: '📚',
    label: 'Livro',
    keywords: ['livro', 'historia', 'ler', 'estudar', 'figuras', 'folhear'],
    category: 'objects',
    speechText: 'Quero ver os livros',
    pecsDescription: 'Estimulo pedagógico e visual calmo.'
  },
  {
    emoji: '📱',
    label: 'Tablet',
    keywords: ['tablet', 'ipad', 'desenho', 'jogar', 'tela', 'celular', 'youtube'],
    category: 'objects',
    speechText: 'Quero usar o Tablet',
    pecsDescription: 'Gatilho de altíssima motivação. Recomenda-se uso monitorado e com tempo programado.'
  },
  {
    emoji: '📺',
    label: 'Desenho na TV',
    keywords: ['tv', 'televisao', 'desenho', 'filme', 'netflix', 'youtube'],
    category: 'objects',
    speechText: 'Quero assistir televisão',
    pecsDescription: 'Momento de lazer e fixação de atenção.'
  },
  {
    emoji: '⚽',
    label: 'Bola',
    keywords: ['bola', 'futebol', 'chutar', 'quadra', 'jogar', 'brincar'],
    category: 'objects',
    speechText: 'Jogar bola',
    pecsDescription: 'Atividade física coletiva para exteriorização de energia.'
  },
  {
    emoji: '🚲',
    label: 'Bicicleta',
    keywords: ['bicicleta', 'bike', 'andar', 'parque', 'pedalar'],
    category: 'objects',
    speechText: 'Andar de bicicleta',
    pecsDescription: 'Coordenação psicomotora global de alta tecnologia corporal.'
  },
  {
    emoji: '🚗',
    label: 'Carrinho',
    keywords: ['carrinho', 'carro', 'roda', 'passeio', 'brincar'],
    category: 'objects',
    speechText: 'Quero brincar com meu carrinho de brinquedo',
    pecsDescription: 'Instiga o brincar simbólico ou o alinhamento espacial de brinquedos (frequentemente visto em TEA).'
  },
  {
    emoji: '🎒',
    label: 'Mochila',
    keywords: ['mochila', 'escola', 'guardar', 'carregar', 'rotina'],
    category: 'objects',
    speechText: 'Pegar minha mochila',
    pecsDescription: 'Organização pré e pós-rotina escolar.'
  },
  {
    emoji: '🧩',
    label: 'Quebra-Cabeça',
    keywords: ['quebracabeca', 'puzzle', 'pecas', 'montar', 'brinquedo'],
    category: 'objects',
    speechText: 'Quero brincar de quebra-cabeça',
    pecsDescription: 'Desenvolve foco visual extraordinário e raciocínio geométrico estruturado.'
  },
  {
    emoji: '🧱',
    label: 'Blocos de Montar',
    keywords: ['lego', 'blocos', 'montar', 'empilhar', 'pecinhas'],
    category: 'objects',
    speechText: 'Brincar com os blocos de montar',
    pecsDescription: 'Ideal para treinar paciência, sequenciamento de cores e fomento motor.'
  },

  // 7. Places / Lugares
  {
    emoji: '🏡',
    label: 'Casa',
    keywords: ['casa', 'lar', 'moradia', 'familia', 'conchego', 'voltar'],
    category: 'places',
    speechText: 'Quero ir para casa',
    pecsDescription: 'Comunicação calmante de fim de dia para solicitar retorno ao porto seguro doméstico.'
  },
  {
    emoji: '🏫',
    label: 'Escola',
    keywords: ['escola', 'estudar', 'aula', 'professora', 'coleguinha'],
    category: 'places',
    speechText: 'Ir para a escola',
    pecsDescription: 'Preparação psicológica de rotina diária matutina.'
  },
  {
    emoji: '🌳',
    label: 'Parque',
    keywords: ['parque', 'arvore', 'escorregador', 'praça', 'grama', 'ar livre'],
    category: 'places',
    speechText: 'Quero ir ao parque',
    pecsDescription: 'Excelente reforçador de lazer natural para estímulos sensoriais de balanço/escorregador.'
  },
  {
    emoji: '🏥',
    label: 'Clínica',
    keywords: ['clinica', 'terapia', 'consulta', 'medico', 'tia', 'desenvolvimento'],
    category: 'places',
    speechText: 'Ir para a clínica de terapia',
    pecsDescription: 'Auxilia na aceitação do local de reabilitação através da rotina representada.'
  },
  {
    emoji: '🛏️',
    label: 'Quarto',
    keywords: ['quarto', 'cama', 'cobertor', 'seguro', 'quieto'],
    category: 'places',
    speechText: 'Ir para o meu quarto',
    pecsDescription: 'Uso de refúgio protetivo contra meltdowns se o ambiente comum estiver sobrecarregado de estímulos.'
  },
  {
    emoji: '🏊',
    label: 'Piscina',
    keywords: ['piscina', 'nadar', 'agua', 'calor', 'natação'],
    category: 'places',
    speechText: 'Quero ir na piscina',
    pecsDescription: 'Estímulo físico hidro-terápico adorado por crianças no espectro.'
  },
  {
    emoji: '🛒',
    label: 'Supermercado',
    keywords: ['supermercado', 'comprar', 'mercado', 'doces', 'comida'],
    category: 'places',
    speechText: 'Ir ao mercado',
    pecsDescription: 'Uso social integrado com os pais durante tarefas cotidianas.'
  },
  {
    emoji: '🏖️',
    label: 'Praia',
    keywords: ['praia', 'mar', 'areia', 'calor', 'sol', 'viagem'],
    category: 'places',
    speechText: 'Quero passear na praia',
    pecsDescription: 'Visualização motivadora de viagens ou feriados.'
  },

  // 8. School / Escola e Terapia
  {
    emoji: '✏️',
    label: 'Lápis',
    keywords: ['lapis', 'escrever', 'desenhar', 'colorir', 'pontas'],
    category: 'school',
    speechText: 'Lápis de desenhar',
    pecsDescription: 'Solicitação de material escolar padrão.'
  },
  {
    emoji: '📒',
    label: 'Caderno',
    keywords: ['caderno', 'livrinho', 'anotaçao', 'dever', 'pauta'],
    category: 'school',
    speechText: 'Meu caderno',
    pecsDescription: 'Trabalho focado em mesa ou em terapias educacionais individuais.'
  },
  {
    emoji: '✂️',
    label: 'Tesoura',
    keywords: ['tesoura', 'cortar', 'papel', 'colagem', 'pontas'],
    category: 'school',
    speechText: 'Usar a tesoura escolar',
    pecsDescription: 'Uso planejado do corte, estimulando uso das duas mãos integradas.'
  },
  {
    emoji: '🧴',
    label: 'Cola',
    keywords: ['cola', 'colar', 'papel', 'grudar', 'recorte'],
    category: 'school',
    speechText: 'Passar cola',
    pecsDescription: 'Utilizada nas terapias de integração sensorial tátil (mexer com cola estimula textura).'
  },
  {
    emoji: '🎵',
    label: 'Música',
    keywords: ['musica', 'barulhinho', 'violao', 'dancar', 'escutar'],
    category: 'school',
    speechText: 'Colocar uma música para eu ouvir',
    pecsDescription: 'Regulador auditivo potente. Crianças autistas respondem muito bem à musicalização.'
  },
  {
    emoji: '👍',
    label: 'Sim',
    keywords: ['sim', 'aceito', 'quero', 'ok', 'certo', 'concordar'],
    category: 'school',
    speechText: 'Sim',
    pecsDescription: 'Expressão de consentimento e resposta afirmativa rápida.'
  },
  {
    emoji: '👎',
    label: 'Não',
    keywords: ['nao', 'recuso', 'nao quero', 'rejeito', 'tirar', 'errado'],
    category: 'school',
    speechText: 'Não',
    pecsDescription: 'Expressão explícita de recusa saudável. Previne crises por contrariedade silenciosa.'
  },
  {
    emoji: '⏰',
    label: 'Tempo Acabou',
    keywords: ['acabar', 'tempo', 'relogio', 'timer', 'finalizado'],
    category: 'school',
    speechText: 'O tempo da brincadeira acabou',
    pecsDescription: 'Gerencia as transições de tarefas informadas visualmente para reduzir resistência.'
  },
  {
    emoji: '🤫',
    label: 'Silêncio',
    keywords: ['silencio', 'quieto', 'barulho', 'calma', 'ouvido'],
    category: 'school',
    speechText: 'Por favor, façam silêncio',
    pecsDescription: 'Indica irritabilidade ou hipersensibilidade a poluição de barulho externa.'
  }
];

export function searchPictograms(query: string): PictogramItem[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return pictogramImagesDB;

  return pictogramImagesDB.filter(item => 
    item.label.toLowerCase().includes(normalized) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(normalized)) ||
    item.speechText.toLowerCase().includes(normalized)
  );
}

export function searchByCategory(categoryId: string): PictogramItem[] {
  return pictogramImagesDB.filter(item => item.category === categoryId);
}

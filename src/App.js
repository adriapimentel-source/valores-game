import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ════════════════════════════════════════════════════════════════
// FONTS — Atkinson Hyperlegible (Braille Institute, low-vision)
// ════════════════════════════════════════════════════════════════
function useFonts() {
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap";
    document.head.appendChild(l);
    return () => document.head.removeChild(l);
  }, []);
}

// ════════════════════════════════════════════════════════════════
// GLOBAL CSS
// ════════════════════════════════════════════════════════════════
const GCSS = `
*,*::before,*::after{box-sizing:border-box}

/* ── Fluid font scale ──────────────────────────────────────────
   clamp(min, preferred, max)
   mobile  : ~18px
   notebook: ~19–20px
   desktop : 20px cap
──────────────────────────────────────────────────────────────── */
html{font-size:clamp(17px, 1.5vw, 20px)}

body{margin:0;background:#071E26;overflow-x:hidden}
*{font-family:'Atkinson Hyperlegible','Verdana',sans-serif;letter-spacing:.03em;word-spacing:.06em;line-height:1.75}
:focus-visible{outline:3px solid #B8CC2A;outline-offset:3px;border-radius:4px}
:focus:not(:focus-visible){outline:none}
button{min-height:48px;cursor:pointer;border:none}
input{font-family:'Atkinson Hyperlegible','Verdana',sans-serif}
input::placeholder{color:#4F8C96}

/* ── Tablet / notebook: wider card, bigger breathing room ───── */
@media(min-width:640px){
  html{font-size:clamp(18px,1.4vw,20px)}
}

/* ── Desktop: cap width and center with side padding ─────────  */
@media(min-width:1024px){
  html{font-size:19px}
}

@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{0%{transform:scale(1)}40%{transform:scale(1.04)}100%{transform:scale(1)}}
@keyframes shimmer{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}
`;
function useGCSS() {
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GCSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);
}

// ════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ════════════════════════════════════════════════════════════════
// FMM — Fundação Matias Machline: navy-teal bg | yellow-green #B8CC2A | blue #3A8EC8
const T = {
  bg0:"#071E26", bg1:"#0C2E3A", bg2:"#10404F", bg3:"#145060", bg4:"#1A6070",
  bdr:"#1D7080", bdrHi:"#2A8FA0",
  txt:"#EFF8FA", txt2:"#9FCDD6", txt3:"#4F8C96",
  amber:"#B8CC2A", amberD:"#96A820",
  AM:"#F2A22A",   // Abertura à Mudança — laranja quente
  AP:"#8E7AE0",   // Autopromoção — violeta
  C :"#3A8EC8",   // Conservação — azul FMM
  AT:"#3FCBA8",   // Autotranscendência — teal
  universalismo   :"#2DE2D4",
  benevolencia    :"#FF85C0",
  tradicao        :"#F2A22A",
  conformidade    :"#74BFFF",
  seguranca       :"#3A8EC8",
  poder           :"#B8A4FF",
  realizacao      :"#C8DC30",
  hedonismo       :"#FF7F7F",
  estimulacao     :"#5CE8A0",
  autodeterminacao:"#50D0FF",
};

// ════════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════════
const TURMAS = ["1AA","1AB","1AC","1AD","1AE","1BA","1BB","1BC","1BD","1BE"];

const VALORES = {
  universalismo:{
    nome:"Universalismo", emoji:"🌍", ang:18, axis:"AT",
    desc:"Compreender, tolerar e proteger todas as pessoas e a natureza.",
    keywords:["igualdade","justiça","natureza","solidariedade","diversidade"],
    desejo:"Compartilhar posts sobre injustiças sem agir de verdade.",
    valor:"Agir de forma consistente por justiça, mesmo quando é difícil.",
  },
  benevolencia:{
    nome:"Benevolência", emoji:"💛", ang:54, axis:"AT",
    desc:"Preservar e melhorar o bem-estar das pessoas próximas.",
    keywords:["cuidado","lealdade","generosidade","afeto","dedicação"],
    desejo:"Querer ser aceite e querido por todas as pessoas.",
    valor:"Colocar o bem-estar de quem ama acima dos próprios interesses.",
  },
  tradicao:{
    nome:"Tradição", emoji:"🌿", ang:90, axis:"C",
    desc:"Respeitar e valorizar os costumes e a cultura de origem.",
    keywords:["família","raízes","costumes","respeito","história"],
    desejo:"Seguir tradições só para evitar conflito familiar.",
    valor:"Honrar origens como fonte de identidade e pertencimento.",
  },
  conformidade:{
    nome:"Conformidade", emoji:"🤝", ang:126, axis:"C",
    desc:"Respeitar normas e regras que protegem a convivência coletiva.",
    keywords:["disciplina","normas","consideração","ordem","responsabilidade"],
    desejo:"Obedecer apenas para evitar punição ou crítica.",
    valor:"Respeitar regras porque acredita na convivência saudável.",
  },
  seguranca:{
    nome:"Segurança", emoji:"🛡️", ang:162, axis:"C",
    desc:"Buscar harmonia, estabilidade e proteção nas relações.",
    keywords:["proteção","estabilidade","harmonia","saúde","pertencimento"],
    desejo:"Fugir de qualquer incerteza ou desconforto.",
    valor:"Construir bases sólidas para si mesmo e para quem ama.",
  },
  poder:{
    nome:"Poder", emoji:"👑", ang:198, axis:"AP",
    desc:"Buscar prestígio e influência sobre pessoas e recursos.",
    keywords:["liderança","influência","prestígio","ambição","reconhecimento"],
    desejo:"Buscar fama e acumular seguidores nas redes.",
    valor:"Usar influência para criar impacto positivo no mundo.",
  },
  realizacao:{
    nome:"Realização", emoji:"🏆", ang:234, axis:"AP",
    desc:"Buscar sucesso pessoal demonstrando competência.",
    keywords:["competência","sucesso","mérito","excelência","conquista"],
    desejo:"Tirar nota máxima para impressionar os outros.",
    valor:"Desenvolver capacidades para alcançar metas que importam.",
  },
  hedonismo:{
    nome:"Hedonismo", emoji:"✨", ang:270, axis:"AM",
    desc:"Valorizar o prazer e a gratificação como parte da vida.",
    keywords:["prazer","alegria","diversão","bem-estar","leveza"],
    desejo:"Buscar prazer imediato sem pensar nas consequências.",
    valor:"Incluir momentos prazerosos numa vida plena e equilibrada.",
  },
  estimulacao:{
    nome:"Estimulação", emoji:"⚡", ang:306, axis:"AM",
    desc:"Buscar novidade, emoção e desafio como forma de crescer.",
    keywords:["aventura","novidade","adrenalina","curiosidade","ousadia"],
    desejo:"Fazer coisas arriscadas pela adrenalina e pelo status.",
    valor:"Buscar experiências novas como forma de crescer.",
  },
  autodeterminacao:{
    nome:"Autodeterminação", emoji:"🧭", ang:342, axis:"AM",
    desc:"Agir com independência, criatividade e autonomia.",
    keywords:["liberdade","autonomia","criatividade","originalidade","independência"],
    desejo:"Fazer o que quiser sem dar satisfação a ninguém.",
    valor:"Exercer autonomia de forma consciente e responsável.",
  },
};
const VKEYS = Object.keys(VALORES);

// Quadrant definitions (4 axes of Schwartz)
const QUADRANTS = {
  AM:{ label:"Abertura à Mudança", accent:T.AM, keys:["autodeterminacao","estimulacao","hedonismo"],
       desc:"Liberdade, novidade e prazer como motores de escolha." },
  AP:{ label:"Autopromoção",       accent:T.AP, keys:["realizacao","poder"],
       desc:"Sucesso pessoal, influência e reconhecimento." },
  C :{ label:"Conservação",        accent:T.C,  keys:["seguranca","conformidade","tradicao"],
       desc:"Ordem, proteção e estabilidade social." },
  AT:{ label:"Autotranscendência", accent:T.AT, keys:["benevolencia","universalismo"],
       desc:"Bem-estar coletivo e cuidado com o mundo." },
};

// Mission statement — correct grammatical forms per value
const VALOR_MISSION = {
  universalismo:    { adj:"universalista",                         ctx:"ambientes onde a diversidade e a justiça são valorizadas",          contrib:"um mundo mais igualitário e sustentável" },
  benevolencia:     { adj:"benevolente",                           ctx:"ambientes onde o cuidado e a empatia são cultivados",               contrib:"o bem-estar das pessoas ao redor" },
  tradicao:         { adj:"fiel às suas raízes",                   ctx:"contextos onde a tradição e os valores são respeitados",            contrib:"a preservação do que tem significado e história" },
  conformidade:     { adj:"comprometida com a convivência",        ctx:"ambientes organizados onde o respeito mútuo é valorizado",          contrib:"uma convivência mais harmoniosa para todos" },
  seguranca:        { adj:"estável e segura",                      ctx:"ambientes onde a proteção e a confiança são garantidas",            contrib:"estruturas mais seguras para todas as pessoas" },
  poder:            { adj:"influente e impactante",                ctx:"espaços onde a liderança e a iniciativa são reconhecidas",          contrib:"mudanças reais e transformações positivas" },
  realizacao:       { adj:"realizada e competente",                ctx:"ambientes onde o esforço e o mérito são valorizados",               contrib:"resultados concretos que fazem diferença" },
  hedonismo:        { adj:"plena e equilibrada",                   ctx:"contextos que valorizam o bem-estar e a alegria saudável",          contrib:"mais leveza e prazer à vida das pessoas" },
  estimulacao:      { adj:"movida por novos desafios",             ctx:"ambientes dinâmicos onde a inovação e a ousadia são incentivadas",  contrib:"experiências transformadoras e memoráveis" },
  autodeterminacao: { adj:"autodeterminada",                       ctx:"ambientes onde a autonomia e a criatividade são respeitadas",       contrib:"escolhas livres, conscientes e autênticas" },
};

// PVQ-21 (ESS, 2009) — adapted to gender-neutral Portuguese
// Mapping: each item → value key
const PVQ_21 = [
  { text:"Essa pessoa pensa em novas ideias e gosta de fazer as coisas de forma própria e original.",                                               val:"autodeterminacao" },
  { text:"Ter muito dinheiro e possuir coisas caras é importante para essa pessoa.",                                                                val:"poder"           },
  { text:"Ela acredita que todas as pessoas do mundo deveriam ter oportunidades iguais na vida.",                                                   val:"universalismo"   },
  { text:"É muito importante demonstrar suas habilidades. Ela quer que as pessoas admirem o que faz.",                                             val:"realizacao"      },
  { text:"Viver em um ambiente seguro é fundamental para essa pessoa. Ela evita qualquer coisa que coloque sua segurança em risco.",                val:"seguranca"       },
  { text:"Essa pessoa gosta de surpresas e está sempre procurando coisas novas para fazer na vida.",                                               val:"estimulacao"     },
  { text:"Ela acredita que as pessoas deveriam sempre seguir as regras, mesmo quando ninguém está observando.",                                    val:"conformidade"    },
  { text:"É importante para ela ouvir as pessoas que pensam diferente. Ela quer entendê-las, mesmo sem concordar.",                                val:"universalismo"   },
  { text:"Ser humilde e modesta é importante para essa pessoa. Ela prefere não chamar atenção para si.",                                           val:"tradicao"        },
  { text:"Aproveitar os prazeres da vida é muito importante para essa pessoa.",                                                                    val:"hedonismo"       },
  { text:"Tomar as próprias decisões é fundamental para essa pessoa. Ela gosta de ser livre e não depender dos outros.",                           val:"autodeterminacao"},
  { text:"Ajudar e cuidar do bem-estar das pessoas ao redor é muito importante para essa pessoa.",                                                 val:"benevolencia"    },
  { text:"Ser bem-sucedida é importante para essa pessoa. Ela espera que as pessoas reconheçam suas conquistas.",                                  val:"realizacao"      },
  { text:"Que o governo garanta segurança contra todas as ameaças é fundamental para essa pessoa.",                                                val:"seguranca"       },
  { text:"Essa pessoa procura aventuras e quer ter uma vida excitante.",                                                                           val:"estimulacao"     },
  { text:"É importante comportar-se de modo adequado. Ela quer evitar qualquer coisa que as pessoas possam considerar errada.",                   val:"conformidade"    },
  { text:"É importante que as pessoas respeitem o que ela diz e sigam sua orientação.",                                                            val:"poder"           },
  { text:"Ser leal e se dedicar às pessoas próximas é fundamental para essa pessoa.",                                                              val:"benevolencia"    },
  { text:"Ela acredita firmemente que as pessoas deveriam proteger a natureza e cuidar do meio ambiente.",                                         val:"universalismo"   },
  { text:"Seguir os costumes transmitidos pela religião ou pela família é importante para essa pessoa.",                                           val:"tradicao"        },
  { text:"Essa pessoa busca todas as oportunidades para se divertir e fazer coisas que lhe tragam prazer.",                                        val:"hedonismo"       },
];
const PVQ_LABELS = ["Nada parecido","Pouco parecido","Bastante parecido","Muito parecido"];
const PVQ_SCORES = [0, 1, 2, 3]; // points per rating choice

// Per-dilema accent colors — rotate to bring attention
const DILEMA_ACCENTS = ["#FFB703","#E05C8A","#3FCBA8","#5BA4F5","#FF8C42","#C4A0FF"];

const DILEMAS = [
  {id:1, badge:"Amizade e Pressão",                zona:"Abertura ↔ Conservação",              emoji:"🎉",
   titulo:"A Festa Proibida",
   contexto:"Sexta à noite. As mensagens não param de chegar.",
   narrativa:"Seus amigos te convidaram para uma festa — sem os pais saberem. Você prometeu à família que ia estudar. Todo mundo vai. O FOMO bate forte.",
   opcoes:[
     {letra:"A", t:"Vou! Essa memória vai durar pra sempre.", v:{hedonismo:2,estimulacao:2}},
     {letra:"B", t:"Fico em casa. Promessa é promessa.", v:{conformidade:2,tradicao:1,seguranca:1}},
     {letra:"C", t:"Converso com minha família com honestidade e negocio.", v:{autodeterminacao:2,benevolencia:1}},
   ]},
  {id:2, badge:"Escola e Justiça",                 zona:"Autopromoção ↔ Autotranscendência",    emoji:"📚",
   titulo:"O Trabalho em Grupo",
   contexto:"Você fez 80% do projeto. Na hora da apresentação...",
   narrativa:"Um colega assumiu a fala como se tivesse feito tudo. O professor elogiou 'o grupo'. Você sente um nó no estômago.",
   opcoes:[
     {letra:"A", t:"Explico minha contribuição ao professor depois da aula.", v:{realizacao:2,poder:1}},
     {letra:"B", t:"Deixo passar. O grupo todo se beneficia da nota.", v:{benevolencia:1,conformidade:2}},
     {letra:"C", t:"Converso com o colega em particular e digo como me senti.", v:{universalismo:2,benevolencia:1}},
   ]},
  {id:3, badge:"Futuro e Carreira",                zona:"Autopromoção ↔ Abertura",              emoji:"🌅",
   titulo:"A Pressão do Futuro",
   contexto:"'O que você vai ser?' — a pergunta que não quer calar.",
   narrativa:"Sua família quer medicina. Você tem paixão por artes. Todo mundo fala de vestibular. Você sente que precisa escolher entre segurança e autenticidade.",
   opcoes:[
     {letra:"A", t:"Medicina. Estabilidade é fundamental. Posso me adaptar depois.", v:{seguranca:2,poder:1}},
     {letra:"B", t:"Artes. Minha paixão não tem preço. Vou arriscar.", v:{autodeterminacao:3,estimulacao:1}},
     {letra:"C", t:"Pesquiso carreiras que unam criatividade e estabilidade.", v:{realizacao:1,autodeterminacao:2,seguranca:1}},
   ]},
  {id:4, badge:"Solidariedade",                    zona:"Autotranscendência",                   emoji:"💙",
   titulo:"O Colega em Dificuldade",
   contexto:"Você descobre algo que quase ninguém sabe.",
   narrativa:"Um colega está passando fome. A família enfrenta dificuldades sérias. Não pediu ajuda a ninguém. Você pode agir, mas exige tempo e energia.",
   opcoes:[
     {letra:"A", t:"Organizo uma vaquinha discreta com amigos para ajudar.", v:{benevolencia:2,universalismo:2}},
     {letra:"B", t:"Abordo essa pessoa com respeito e ofereço minha ajuda diretamente.", v:{benevolencia:3}},
     {letra:"C", t:"Aviso discretamente a um orientador da escola.", v:{universalismo:2,seguranca:1}},
   ]},
  {id:5, badge:"Novos Horizontes",                 zona:"Abertura à Mudança",                   emoji:"✈️",
   titulo:"A Oportunidade Diferente",
   contexto:"Uma chance única aparece — mas com um preço.",
   narrativa:"Vaga para um intercâmbio de 3 meses fora da cidade. Nova escola, novo idioma, nova rotina. Você teria que deixar tudo que conhece.",
   opcoes:[
     {letra:"A", t:"Vou! Experiências assim mudam a vida.", v:{estimulacao:3,autodeterminacao:1}},
     {letra:"B", t:"Fico. Meus vínculos aqui são mais importantes agora.", v:{seguranca:2,tradicao:1,benevolencia:1}},
     {letra:"C", t:"Envolvo minha família na decisão e analisamos juntos.", v:{conformidade:1,seguranca:1,autodeterminacao:1}},
   ]},
  {id:6, badge:"Redes Sociais",                    zona:"Autopromoção ↔ Autotranscendência",    emoji:"📱",
   titulo:"O Viral Problemático",
   contexto:"15 segundos que complicaram tudo.",
   narrativa:"Um vídeo seu viralizou, mas comentários apontam que algo que você disse pode ter ofendido um grupo. O engajamento está alto. O desconforto também.",
   opcoes:[
     {letra:"A", t:"Deixo rolar. A maioria curtiu e foi sem querer mesmo.", v:{poder:2,hedonismo:1}},
     {letra:"B", t:"Apago e faço um pedido de desculpas público.", v:{universalismo:2,conformidade:1}},
     {letra:"C", t:"Respondo os comentários e ouço quem se sentiu ofendido.", v:{universalismo:2,benevolencia:1,autodeterminacao:1}},
   ]},
];

const REFLEXOES = [
  {id:"conteudo", titulo:"Seu Universo", tipo:"multi",
   perg:"Que tipo de conteúdo você mais consome? Pode marcar mais de um.",
   opts:[
     {t:"🔬 Tech, ciência, como as coisas funcionam",  v:{autodeterminacao:1,estimulacao:1}},
     {t:"🎨 Arte, música, design e criatividade",       v:{autodeterminacao:2,hedonismo:1}},
     {t:"🏋️ Esportes, fitness, aventura e desafios",   v:{estimulacao:2,realizacao:1}},
     {t:"💼 Negócios, empreendedorismo e liderança",   v:{realizacao:2,poder:1}},
     {t:"🌱 Causas sociais, meio ambiente, ativismo",  v:{universalismo:3}},
     {t:"🏠 Família, bem-estar, culinária e lifestyle", v:{benevolencia:2,tradicao:1}},
     {t:"😂 Entretenimento, humor, games, cultura pop", v:{hedonismo:2,estimulacao:1}},
     {t:"📰 Notícias, política e segurança pública",   v:{seguranca:1,universalismo:1}},
   ]},
  {id:"decisao", titulo:"O Que Te Guia", tipo:"single",
   perg:"Quando você precisa tomar uma decisão difícil, o que mais pesa?",
   opts:[
     {t:"🧭 Ser fiel a quem sou e ao que acredito",           v:{autodeterminacao:2}},
     {t:"⚖️ O que é mais justo para todo mundo",              v:{universalismo:2}},
     {t:"🏆 O que vai me fazer crescer e ter sucesso",        v:{realizacao:2}},
     {t:"❤️ O bem-estar de quem eu amo",                      v:{benevolencia:2}},
     {t:"🛡️ O que vai me dar mais segurança e estabilidade",  v:{seguranca:2}},
     {t:"📋 O que é esperado de mim pela família e escola",   v:{conformidade:2}},
   ]},
];

// ════════════════════════════════════════════════════════════════
// GOOGLE SHEETS CONFIG
// Teacher: paste your Apps Script Web App URL below
// ════════════════════════════════════════════════════════════════
const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwAczHoYi6gUfM__AsQGtiNcxxVI61WENOTupDEMIX_3GhkTAZC6lbzGU4f9696MIAs/exec";

async function sendToSheets(reg, scores) {
  if (!SHEETS_WEBHOOK_URL) return { ok: false, msg: "URL não configurada" };
  const top = top3(scores);
  const payload = {
    timestamp: new Date().toISOString(),
    nome: reg.nome, ra: reg.ra, turma: reg.turma,
    valor1: VALORES[top[0]]?.nome || "",
    valor2: VALORES[top[1]]?.nome || "",
    valor3: VALORES[top[2]]?.nome || "",
    ...Object.fromEntries(VKEYS.map(k => [k, scores[k] || 0])),
  };
  try {
    await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, msg: e.message };
  }
}

// ════════════════════════════════════════════════════════════════
// UTILS
// ════════════════════════════════════════════════════════════════
const zero = () => Object.fromEntries(VKEYS.map(k => [k, 0]));
const addS = (prev, d) => { const n={...prev}; Object.entries(d||{}).forEach(([k,v])=>{n[k]=(n[k]||0)+v}); return n; };
const normS = s => { const mv=Math.max(...Object.values(s),1); return Object.fromEntries(Object.entries(s).map(([k,v])=>[k,v/mv])); };
const top3 = s => [...Object.entries(s)].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);
const axisScore = s => {
  const n=normS(s), g=ks=>ks.reduce((a,k)=>a+(n[k]||0),0)/ks.length;
  return { AT:g(["universalismo","benevolencia"]), AP:g(["poder","realizacao"]), AM:g(["autodeterminacao","estimulacao","hedonismo"]), C:g(["seguranca","conformidade","tradicao"]) };
};

// ════════════════════════════════════════════════════════════════
// SVG HELPERS
// ════════════════════════════════════════════════════════════════
function pt(cx,cy,r,deg){const rad=(deg-90)*Math.PI/180;return{x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)};}
function wedgePath(cx,cy,r1,r2,a0,a1){
  const p1=pt(cx,cy,r1,a0),p2=pt(cx,cy,r2,a0),p3=pt(cx,cy,r2,a1),p4=pt(cx,cy,r1,a1);
  return `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)}L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}A${r2} ${r2} 0 0 1 ${p3.x.toFixed(1)} ${p3.y.toFixed(1)}L${p4.x.toFixed(1)} ${p4.y.toFixed(1)}A${r1} ${r1} 0 0 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}Z`;
}

// PCD icon — fiel à imagem enviada (círculo | cabeça | braços | pernas em V | pontos ciano)
function A11yIcon({ size=32, color="#B8CC2A" }) {
  const dot = "#29C9D4";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      role="img" aria-label="Símbolo de pessoa com deficiência — ícone atualizado"
      fill="none">
      <circle cx="50" cy="50" r="44" stroke={color} strokeWidth="5"/>
      <circle cx="50" cy="16" r="7.5" fill={dot}/>
      <line x1="50" y1="23" x2="50" y2="46" stroke={color} strokeWidth="5" strokeLinecap="round"/>
      <line x1="50" y1="36" x2="14" y2="44" stroke={color} strokeWidth="5" strokeLinecap="round"/>
      <line x1="50" y1="36" x2="86" y2="44" stroke={color} strokeWidth="5" strokeLinecap="round"/>
      <line x1="50" y1="46" x2="28" y2="82" stroke={color} strokeWidth="5" strokeLinecap="round"/>
      <line x1="50" y1="46" x2="72" y2="82" stroke={color} strokeWidth="5" strokeLinecap="round"/>
      <circle cx="14" cy="44" r="5.5" fill={dot}/>
      <circle cx="86" cy="44" r="5.5" fill={dot}/>
      <circle cx="28" cy="82" r="5.5" fill={dot}/>
      <circle cx="72" cy="82" r="5.5" fill={dot}/>
    </svg>
  );
}

// Schwartz Circle — clean SVG, no overlapping labels
// Emoji labels go on a separate outer ring, axis labels go as HTML outside
function SchwartzCircle({ scores, size=280 }) {
  const cx=size/2, cy=size/2;
  const R=size*0.34;
  const ri=size*0.10;
  const emojiR=R+size*0.10;

  const n=useMemo(()=>normS(scores),[scores]);
  const rPts=VKEYS.map(k=>{const{ang}=VALORES[k],rv=ri+(R-ri)*(n[k]||0);return pt(cx,cy,rv,ang);});
  const rPath=rPts.map((p,i)=>`${i?"L":"M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("")+"Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      role="img" aria-label="Círculo de Schwartz com seu perfil de valores"
      style={{overflow:"visible", display:"block"}}>
      <defs>
        <filter id="sc-glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
      </defs>
      {[0.33,0.66,1].map(f=>(
        <circle key={f} cx={cx} cy={cy} r={ri+(R-ri)*f}
          fill="none" stroke={T.bdr} strokeWidth="0.5" strokeDasharray="3 5" opacity="0.5"/>
      ))}
      <line x1={cx} y1={cy-R} x2={cx} y2={cy+R} stroke={T.bdr} strokeWidth="0.5"/>
      <line x1={cx-R} y1={cy} x2={cx+R} y2={cy} stroke={T.bdr} strokeWidth="0.5"/>
      {VKEYS.map(k=>{
        const{ang}=VALORES[k],sc=n[k]||0;
        return <path key={k} d={wedgePath(cx,cy,ri,R,ang-18,ang+18)}
          fill={T[k]} opacity={0.07+sc*0.60} stroke={T.bg0} strokeWidth="1.5"/>;
      })}
      <path d={rPath} fill="none" stroke={T.amber} strokeWidth="7" opacity="0.14" strokeLinejoin="round" filter="url(#sc-glow)"/>
      <path d={rPath} fill={T.amber} opacity="0.06"/>
      <path d={rPath} fill="none" stroke={T.amber} strokeWidth="2.5" strokeLinejoin="round"/>
      {rPts.map((p,i)=>(
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill={T[VKEYS[i]]} opacity="0.22"/>
          <circle cx={p.x} cy={p.y} r="3" fill={T[VKEYS[i]]} stroke={T.bg0} strokeWidth="1.5"/>
        </g>
      ))}
      {VKEYS.map(k=>{
        const{ang,emoji}=VALORES[k],lp=pt(cx,cy,emojiR,ang);
        return <text key={k} x={lp.x} y={lp.y}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={size*0.056} aria-hidden="true" style={{userSelect:"none"}}>
          {emoji}
        </text>;
      })}
      <circle cx={cx} cy={cy} r={ri} fill={T.bg1} stroke={T.bdrHi} strokeWidth="1.5"/>
      <text x={cx} y={cy-4} textAnchor="middle" dominantBaseline="middle"
        fontSize={size*0.038} fill={T.txt} fontWeight="700">VOCÊ</text>
      <text x={cx} y={cy+10} textAnchor="middle" dominantBaseline="middle"
        fontSize={size*0.028} fill={T.txt3}>perfil</text>
    </svg>
  );
}

// Circle with axis labels as HTML (no SVG text collision)
function SchwartzCircleLabeled({ scores, size=280 }) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{fontSize:"0.65rem",fontWeight:700,color:T.AT,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6,textAlign:"center"}}>
        ↑ AUTO-TRANSCENDÊNCIA
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <div style={{fontSize:"0.6rem",fontWeight:700,color:T.AM,letterSpacing:"0.08em",textTransform:"uppercase",writingMode:"vertical-rl",transform:"rotate(180deg)",whiteSpace:"nowrap",marginRight:4}}>
          ABERTURA À MUDANÇA ↑
        </div>
        <SchwartzCircle scores={scores} size={size}/>
        <div style={{fontSize:"0.6rem",fontWeight:700,color:T.C,letterSpacing:"0.08em",textTransform:"uppercase",writingMode:"vertical-rl",whiteSpace:"nowrap",marginLeft:4}}>
          ↑ CONSERVAÇÃO
        </div>
      </div>
      <div style={{fontSize:"0.65rem",fontWeight:700,color:T.AP,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:6,textAlign:"center"}}>
        ↓ AUTO-PROMOÇÃO
      </div>
    </div>
  );
}

function MiniCircle({ scores, size=54 }) {
  const cx=size/2, cy=size/2, R=size*.37, ri=size*.10;
  const n=normS(scores);
  const rPts=VKEYS.map(k=>{const{ang}=VALORES[k];return pt(cx,cy,ri+(R-ri)*(n[k]||0),ang);});
  const rPath=rPts.map((p,i)=>`${i?"L":"M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("")+"Z";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {VKEYS.map(k=><path key={k} d={wedgePath(cx,cy,ri,R,VALORES[k].ang-18,VALORES[k].ang+18)} fill={T[k]} opacity="0.22" stroke="none"/>)}
      <path d={rPath} fill={T.amber} opacity="0.08"/>
      <path d={rPath} fill="none" stroke={T.amber} strokeWidth="1.5" strokeLinejoin="round"/>
      {rPts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="2" fill={T[VKEYS[i]]}/>)}
      <circle cx={cx} cy={cy} r={ri} fill={T.bg1} stroke={T.bdr} strokeWidth="1"/>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════
// UI PRIMITIVES
// ════════════════════════════════════════════════════════════════
const PAGE = {
  maxWidth:"min(600px, 96vw)",
  margin:"0 auto",
  padding:"clamp(20px,4vw,40px) clamp(16px,5vw,48px) 56px",
  minHeight:"100vh",
  display:"flex",
  flexDirection:"column",
};

function Card({ children, accent, noPad, style:extra }) {
  return (
    <div style={{
      background:T.bg1,
      borderTop:`1px solid ${T.bdr}`,
      borderRight:`1px solid ${T.bdr}`,
      borderBottom:`1px solid ${T.bdr}`,
      borderLeft:`4px solid ${accent||T.bdrHi}`,
      borderRadius:"0 14px 14px 0",
      padding:noPad?0:"18px 20px",
      ...extra,
    }}>
      {children}
    </div>
  );
}

function BigBtn({ onClick, disabled, children, accent, "aria-label":al }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={al}
      style={{
        width:"100%", minHeight:60, padding:"14px 24px", borderRadius:14,
        fontSize:"1rem", fontWeight:700, border:`2px solid ${disabled?T.bdr:accent||T.amber}`,
        background:disabled?T.bg3:accent||T.amber,
        color:disabled?T.txt3:T.bg0, opacity:disabled?.5:1,
        cursor:disabled?"not-allowed":"pointer", transition:"all 0.15s",
      }}>
      {children}
    </button>
  );
}

function SLabel({ children, accent }) {
  return (
    <div style={{fontSize:"0.76rem",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",
      color:accent||T.txt2,marginBottom:10,
      textShadow:accent?`0 0 12px ${accent}55`:"none",
    }}>
      {children}
    </div>
  );
}

function ProgBar({ pct, accent, thick=8 }) {
  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
      aria-label={`${pct}%`}
      style={{height:thick,borderRadius:thick/2,background:T.bg3,overflow:"hidden"}}>
      <div style={{height:"100%",borderRadius:thick/2,background:accent||T.amber,width:`${pct}%`,transition:"width 0.6s ease"}}/>
    </div>
  );
}

function PhaseHeader({ phase, total, label, scores, accent }) {
  const pct=Math.round((phase/total)*100);
  return (
    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:28}}>
      <MiniCircle scores={scores} size={52}/>
      <div style={{flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.8rem",marginBottom:5}}>
          <span style={{fontWeight:700,color:accent||T.amber}}>{label}</span>
          <span style={{color:T.txt3}}>{pct}%</span>
        </div>
        <ProgBar pct={pct} accent={accent||T.amber}/>
        <div style={{fontSize:"0.75rem",color:T.txt3,marginTop:4}}>Fase {phase} de {total}</div>
      </div>
    </div>
  );
}

function FadeUp({ children, id }) {
  const [vis,setVis]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setVis(true),50);return()=>clearTimeout(t);},[id]);
  return (
    <div style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(10px)",transition:"opacity 0.3s ease,transform 0.3s ease"}}>
      {children}
    </div>
  );
}

function Chip({ active, accent, onClick, children }) {
  return (
    <button onClick={onClick} role="checkbox" aria-checked={active}
      style={{
        padding:"8px 14px", borderRadius:99, fontSize:"0.86rem",
        whiteSpace:"nowrap", fontWeight:active?700:500, minHeight:44,
        cursor:"pointer", transition:"all 0.15s",
        border:`2px solid ${active?accent||T.amber:T.bdr}`,
        background:active?`${accent||T.amber}20`:T.bg3,
        color:active?accent||T.amber:T.txt2,
      }}>
      {children}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════
// ACCESSIBILITY PANEL
// ════════════════════════════════════════════════════════════════
function A11yPanel({ s, set, onClose }) {
  const ref=useRef(null);
  useEffect(()=>{ref.current?.focus();},[]);
  return (
    <div role="dialog" aria-modal="true" aria-label="Acessibilidade"
      onClick={onClose}
      style={{position:"fixed",inset:0,zIndex:60,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"flex-start",justifyContent:"flex-end",padding:16,paddingTop:68}}>
      <div ref={ref} tabIndex={-1} onClick={e=>e.stopPropagation()}
        style={{background:T.bg2,border:`2px solid ${T.bdrHi}`,borderRadius:20,padding:24,width:296,boxShadow:"0 24px 60px rgba(0,0,0,0.6)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:"1rem",fontWeight:700,color:T.txt}}>Acessibilidade</span>
          <button onClick={onClose} aria-label="Fechar"
            style={{background:T.bg3,border:`1px solid ${T.bdr}`,borderRadius:8,width:36,height:36,color:T.txt2,fontSize:20,cursor:"pointer"}}>×</button>
        </div>
        {[{k:"highContrast",l:"Alto contraste extremo",h:"Preto e branco absolutos"},{k:"reduceMotion",l:"Sem animações",h:"Para TDAH e sensibilidade visual"},{k:"bigText",l:"Texto extra grande",h:"+25% no tamanho"}].map(({k,l,h})=>(
          <label key={k} style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:18,cursor:"pointer"}}>
            <div role="switch" aria-checked={s[k]} onClick={()=>set(p=>({...p,[k]:!p[k]}))}
              style={{minWidth:44,height:26,borderRadius:13,background:s[k]?T.amber:T.bg4,position:"relative",transition:"background .2s",border:`2px solid ${s[k]?T.amber:T.bdrHi}`,cursor:"pointer",marginTop:2}}>
              <div style={{position:"absolute",top:2,left:s[k]?18:2,width:18,height:18,borderRadius:9,background:s[k]?T.bg0:T.txt2,transition:"left .2s"}}/>
            </div>
            <div><div style={{fontWeight:700,color:T.txt,fontSize:"0.9rem"}}>{l}</div><div style={{color:T.txt3,fontSize:"0.76rem",marginTop:2}}>{h}</div></div>
          </label>
        ))}
        <div style={{borderTop:`1px solid ${T.bdr}`,paddingTop:14}}>
          <SLabel>Tamanho do texto</SLabel>
          <div style={{display:"flex",gap:8}}>
            {[{k:0,l:"A"},{k:1,l:"A+"},{k:2,l:"A++"}].map(({k,l})=>(
              <button key={k} onClick={()=>set(p=>({...p,fontSize:k}))} aria-pressed={s.fontSize===k}
                style={{flex:1,minHeight:48,borderRadius:10,fontSize:k===0?"1rem":k===1?"1.15rem":"1.3rem",fontWeight:700,cursor:"pointer",
                  background:s.fontSize===k?T.amber:T.bg3,color:s.fontSize===k?T.bg0:T.txt2,
                  border:`2px solid ${s.fontSize===k?T.amber:T.bdr}`}}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREEN: WELCOME
// ════════════════════════════════════════════════════════════════
function WelcomeScreen({ onStart }) {
  return (
    <div style={{...PAGE,alignItems:"center",justifyContent:"center",textAlign:"center",position:"relative",overflow:"hidden"}}>
      <div aria-hidden style={{position:"fixed",top:"-8%",left:"50%",transform:"translateX(-50%)",width:600,height:280,borderRadius:"50%",filter:"blur(80px)",background:"radial-gradient(ellipse,rgba(255,183,3,.10) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:440,position:"relative",zIndex:1}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:20,position:"relative"}}>
          <SchwartzCircle scores={zero()} size={Math.min(220, (typeof window!=="undefined"?window.innerWidth:360) * 0.55)}/>
          <div aria-hidden style={{position:"absolute",bottom:0,left:0,right:0,height:80,background:`linear-gradient(transparent,${T.bg0})`}}/>
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${T.amber}18`,border:`2px solid ${T.amber}45`,borderRadius:99,padding:"6px 18px",fontSize:"0.72rem",fontWeight:700,color:T.amber,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:18}}>
          Projeto de Vida · 1º Ano EM
        </div>
        <h1 style={{fontSize:"2.5rem",fontWeight:700,color:T.txt,margin:"0 0 10px",lineHeight:1.15}}>Quem Sou Eu?</h1>
        <p style={{fontSize:"1.05rem",color:T.txt2,margin:"0 0 10px"}}>Uma jornada pelos seus valores</p>
        <p style={{fontSize:"0.92rem",color:T.txt3,lineHeight:1.85,margin:"0 0 32px",maxWidth:360,marginLeft:"auto",marginRight:"auto"}}>
          Descubra o que guia suas escolhas de verdade. Aprenda a diferença entre o que você{" "}
          <strong style={{color:T.txt2}}>deseja</strong> e o que você{" "}
          <strong style={{color:T.txt2}}>valoriza</strong>.
        </p>
        <BigBtn onClick={onStart}>Começar Jornada →</BigBtn>
        <p style={{fontSize:"0.78rem",color:T.txt3,marginTop:14}}>~20 min · Baseado na Teoria de Schwartz · 4 fases</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREEN: REGISTRO
// ════════════════════════════════════════════════════════════════
function RegistroScreen({ onNext, reg, setReg }) {
  const ok=reg.nome.trim().length>2&&reg.ra.trim().length>0&&reg.turma;
  return (
    <div style={PAGE}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:"2.8rem",marginBottom:12}}>👤</div>
        <h2 style={{fontSize:"1.6rem",fontWeight:700,color:T.txt,margin:"0 0 6px"}}>Identificação</h2>
        <p style={{fontSize:"0.92rem",color:T.txt3,margin:0}}>Dados para gerar o perfil personalizado</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:20,flex:1}}>
        {[{lbl:"Nome completo",key:"nome",ph:"Ex: Ana Lima",type:"text"},{lbl:"RA — Registro do Aluno",key:"ra",ph:"Ex: 123456",type:"text"}].map(({lbl,key,ph,type})=>(
          <div key={key}>
            <label htmlFor={`input-${key}`} style={{display:"block",fontSize:"0.85rem",fontWeight:700,color:T.txt2,marginBottom:8}}>{lbl}</label>
            <input id={`input-${key}`} type={type} value={reg[key]}
              onChange={e=>setReg(p=>({...p,[key]:e.target.value}))} placeholder={ph}
              style={{width:"100%",minHeight:56,padding:"14px 18px",borderRadius:12,background:T.bg3,border:`2px solid ${reg[key].trim().length>1?T.amber:T.bdr}`,color:T.txt,fontSize:"1rem",outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}/>
          </div>
        ))}
        <div>
          <div style={{fontSize:"0.85rem",fontWeight:700,color:T.txt2,marginBottom:10}}>Turma</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
            {TURMAS.map(t=>(
              <button key={t} onClick={()=>setReg(p=>({...p,turma:t}))} aria-pressed={reg.turma===t}
                style={{minHeight:52,borderRadius:12,fontSize:"0.9rem",fontWeight:700,cursor:"pointer",transition:"all .15s",background:reg.turma===t?T.amber:T.bg3,border:`2px solid ${reg.turma===t?T.amber:T.bdr}`,color:reg.turma===t?T.bg0:T.txt2}}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{marginTop:32}}>
        <BigBtn onClick={onNext} disabled={!ok}>
          {ok?`Olá, ${reg.nome.split(" ")[0]}! Vamos lá →`:"Preencha todos os campos"}
        </BigBtn>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREEN: INTRO — includes map explanation card
// ════════════════════════════════════════════════════════════════
function IntroScreen({ onNext }) {
  const [step,setStep]=useState(0);
  const cards=[
    {em:"🧭",t:"O que são valores?",
     d:"Valores não são opiniões. São princípios profundos que guiam sua conduta mesmo quando ninguém está olhando. Eles explicam por que você faz o que faz."},
    {em:"💭",t:"Desejo vs. Valor",
     d:"Querer curtidas nas redes é um desejo momentâneo. Querer fazer a diferença na vida das pessoas é um valor. Esta jornada ensina a diferença entre os dois."},
    {em:"🔬",t:"Base científica",
     d:"Usamos a Teoria dos Valores de Shalom Schwartz, validada em mais de 80 países. Você responderá ao PVQ-21 adaptado + cenários narrativos + reflexões."},
    {em:"🗺️",t:"O Mapa de Schwartz",
     d:"Ao final, você verá um mapa circular com 10 valores distribuídos em 4 eixos. O radar mostra onde seu perfil é mais forte. Quanto mais preenchido o setor, mais esse valor guia você."},
    {em:"🎯",t:"Como funciona",
     d:"Você vai passar por 4 fases com diferentes tipos de cenários e perguntas. O mais importante é responder com sinceridade — não existe resposta certa. Em caso de dúvida, escolha a primeira opção que veio à cabeça: a primeira reação revela o valor que realmente guia você, sem filtros."},
  ];
  const c=cards[step];
  return (
    <div style={PAGE}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <SLabel accent={T.amber}>Introdução</SLabel>
        <h2 style={{fontSize:"1.6rem",fontWeight:700,color:T.txt,margin:0}}>Antes de começar...</h2>
      </div>
      <div style={{background:T.bg1,border:`1px solid ${T.bdrHi}`,borderRadius:18,padding:"32px 26px",flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",marginBottom:22,minHeight:220}}>
        <div style={{fontSize:"3.2rem",marginBottom:18}}>{c.em}</div>
        <h3 style={{fontSize:"1.2rem",fontWeight:700,color:T.txt,margin:"0 0 14px"}}>{c.t}</h3>
        <p style={{fontSize:"0.98rem",color:T.txt2,lineHeight:1.85,margin:0}}>{c.d}</p>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:22}} role="tablist">
        {cards.map((_,i)=>(
          <button key={i} role="tab" aria-selected={i===step} aria-label={`Slide ${i+1}`} onClick={()=>setStep(i)}
            style={{width:i===step?30:10,height:10,borderRadius:5,padding:0,border:`2px solid ${i===step?T.amber:T.bdrHi}`,background:i===step?T.amber:T.bg4,cursor:"pointer",transition:"all .25s"}}/>
        ))}
      </div>
      <BigBtn onClick={()=>step<cards.length-1?setStep(step+1):onNext()}>
        {step<cards.length-1?`Próximo (${step+2}/${cards.length}) →`:"Começar Fase 1 →"}
      </BigBtn>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREEN: PVQ-21 (Phase 1 of 4) — Scientific profile
// ════════════════════════════════════════════════════════════════
function PVQScreen({ onNext, scores, onScores }) {
  const PER_PAGE=7;
  const [page,setPage]=useState(0);
  const [answers,setAnswers]=useState({});
  const [highlight,setHighlight]=useState(null); // idx of first unanswered
  const itemRefs=useRef({});
  const totalPages=Math.ceil(PVQ_21.length/PER_PAGE);
  const pageItems=PVQ_21.slice(page*PER_PAGE,(page+1)*PER_PAGE);
  const allAnswered=pageItems.every((_,i)=>answers[page*PER_PAGE+i]!==undefined);
  const ACCENT="#8DC63F"; // FMM green

  // Scroll to top when page changes
  useEffect(()=>{
    window.scrollTo({top:0,behavior:"smooth"});
    setHighlight(null);
  },[page]);

  const handleNext=()=>{
    // Find first unanswered on this page
    const firstMissing = pageItems.findIndex((_,i)=>answers[page*PER_PAGE+i]===undefined);
    if(firstMissing !== -1){
      const missingIdx = page*PER_PAGE+firstMissing;
      setHighlight(missingIdx);
      const el = itemRefs.current[missingIdx];
      if(el) el.scrollIntoView({behavior:"smooth", block:"center"});
      return;
    }
    if(page<totalPages-1){setPage(page+1);}
    else{
      PVQ_21.forEach((item,i)=>{
        const rating=answers[i];
        if(rating!==undefined){
          const pts=PVQ_SCORES[rating];
          if(pts>0) onScores({[item.val]:pts});
        }
      });
      onNext();
    }
  };

  return (
    <div style={PAGE}>
      <PhaseHeader phase={1} total={4} label="Perfil Científico" scores={scores} accent={ACCENT}/>
      <div style={{display:"flex",gap:6,marginBottom:20}}>
        {Array.from({length:totalPages},(_,i)=>(
          <div key={i} style={{flex:1,height:5,borderRadius:3,background:i<page?ACCENT:i===page?T.amber:T.bg4,border:`1.5px solid ${i<=page?ACCENT:T.bdr}`,transition:"all .3s"}}/>
        ))}
      </div>
      <div style={{marginBottom:16}}>
        <SLabel accent={ACCENT}>PVQ-21 · Página {page+1} de {totalPages}</SLabel>
        <h2 style={{fontSize:"1.2rem",fontWeight:700,color:T.txt,margin:"0 0 6px",lineHeight:1.4}}>
          O quanto essa pessoa se parece com você?
        </h2>
        <p style={{fontSize:"0.85rem",color:T.txt3,margin:0,lineHeight:1.65}}>
          Para cada descrição abaixo, marque o quanto você se identifica. Não há certo ou errado — responda com honestidade.
        </p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:24}}>
        {pageItems.map((item,localIdx)=>{
          const globalIdx=page*PER_PAGE+localIdx;
          const chosen=answers[globalIdx];
          return (
            <div key={globalIdx}
              ref={el=>itemRefs.current[globalIdx]=el}
              style={{background:T.bg1,
                borderTop:`1px solid ${highlight===globalIdx?"#FF6B6B":T.bdr}`,
                borderRight:`1px solid ${highlight===globalIdx?"#FF6B6B":T.bdr}`,
                borderBottom:`1px solid ${highlight===globalIdx?"#FF6B6B":T.bdr}`,
                borderLeft:`4px solid ${chosen!==undefined?ACCENT:highlight===globalIdx?"#FF6B6B":T.bdr}`,
                borderRadius:"0 14px 14px 0",padding:"16px 18px",
                outline:highlight===globalIdx?"2px solid #FF6B6B":"none",
                transition:"all .2s"}}>
              {highlight===globalIdx && (
                <div style={{fontSize:"0.76rem",fontWeight:700,color:"#FF6B6B",marginBottom:8}}>
                  ⚠️ Marque uma opção para continuar
                </div>
              )}
              <p style={{fontSize:"0.95rem",color:T.txt2,margin:"0 0 14px",lineHeight:1.8}}>
                <span style={{fontFamily:"monospace",fontSize:"0.75rem",color:T.txt3,marginRight:8}}>{globalIdx+1}.</span>
                {item.text}
              </p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                {PVQ_LABELS.map((lbl,ri)=>{
                  const isSel=chosen===ri;
                  return (
                    <button key={ri}
                      onClick={()=>{setAnswers(p=>({...p,[globalIdx]:ri}));setHighlight(null);}}
                      aria-pressed={isSel}
                      style={{minHeight:44,borderRadius:10,fontSize:"0.78rem",fontWeight:isSel?700:500,cursor:"pointer",transition:"all .15s",
                        border:`2px solid ${isSel?ACCENT:T.bdr}`,
                        background:isSel?`${ACCENT}30`:T.bg3,
                        color:isSel?"#fff":T.txt3,
                        lineHeight:1.3,padding:"6px 4px"}}>
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <BigBtn onClick={handleNext} accent={ACCENT}>
        {page<totalPages-1?`Próxima página (${page+2}/${totalPages}) →`:"Ver Seus Heróis →"}
      </BigBtn>
      <p style={{fontSize:"0.78rem",color:T.txt3,textAlign:"center",marginTop:12}}>
        Instrumento PVQ-21 · ESS (2009) · adaptado ao português
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREEN: PHASE 2 — HEROES
// ════════════════════════════════════════════════════════════════
function Phase1Screen({ onNext, scores, onScores }) {
  const ACCENT=T.amber;
  const [heroes,setHeroes]=useState([{nome:"",tags:[]},{nome:"",tags:[]},{nome:"",tags:[]}]);
  const [idx,setIdx]=useState(0);
  const h=heroes[idx];
  const inputRef=useRef(null);
  useEffect(()=>{inputRef.current?.focus();},[idx]);

  const toggleTag=tag=>setHeroes(prev=>{
    const n=[...prev],curr=n[idx],already=curr.tags.find(t=>t.t===tag.t);
    n[idx]={...curr,tags:already?curr.tags.filter(t=>t.t!==tag.t):curr.tags.length<5?[...curr.tags,tag]:curr.tags};
    return n;
  });
  const handleNext=()=>{
    if(idx<2)setIdx(idx+1);
    else{heroes.forEach(h=>h.tags.forEach(tag=>onScores(tag.v)));onNext();}
  };
  const canNext=h.nome.trim().length>0&&h.tags.length>0;

  return (
    <div style={PAGE}>
      <PhaseHeader phase={2} total={4} label="Seus Heróis" scores={scores} accent={ACCENT}/>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[0,1,2].map(i=><div key={i} style={{flex:1,height:6,borderRadius:3,background:i<idx?ACCENT:i===idx?T.amber:T.bg4,border:`1.5px solid ${i<=idx?ACCENT:T.bdr}`,transition:"all .3s"}}/>)}
      </div>
      <h2 style={{fontSize:"1.4rem",fontWeight:700,color:T.txt,margin:"0 0 4px"}}>Herói {idx+1} de 3</h2>
      <p style={{fontSize:"0.92rem",color:T.txt3,margin:"0 0 20px"}}>Pense em alguém que você admira — pode ser real ou fictício.</p>
      <Card accent={ACCENT} style={{marginBottom:18}}>
        <label htmlFor={`hero-${idx}`} style={{display:"block",fontSize:"0.85rem",fontWeight:700,color:T.txt2,marginBottom:8}}>Nome do herói ou heroína</label>
        <input ref={inputRef} id={`hero-${idx}`} type="text" value={h.nome}
          onChange={e=>setHeroes(prev=>{const n=[...prev];n[idx]={...n[idx],nome:e.target.value};return n;})}
          placeholder="Ex: Minha avó, Simba, Malala..."
          style={{width:"100%",minHeight:52,padding:"12px 16px",borderRadius:10,background:T.bg3,border:`2px solid ${h.nome.trim().length>0?ACCENT:T.bdr}`,color:T.txt,fontSize:"1.05rem",fontWeight:700,outline:"none",boxSizing:"border-box",marginBottom:20,transition:"border-color .2s"}}/>
        <label style={{display:"block",fontSize:"0.85rem",fontWeight:700,color:T.txt2,marginBottom:10}}>
          O que você admira nessa pessoa?{" "}
          <span style={{color:T.txt3,fontWeight:400}}>Escolha até 5 qualidades</span>
        </label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}} role="group">
          {[
            {t:"Criativo(a)",v:{autodeterminacao:2}},{t:"Corajoso(a)",v:{estimulacao:2}},{t:"Alegre",v:{hedonismo:1,estimulacao:1}},
            {t:"Determinado(a)",v:{realizacao:2}},{t:"Influente",v:{poder:2}},{t:"Protetor(a)",v:{seguranca:1,benevolencia:1}},
            {t:"Responsável",v:{conformidade:2}},{t:"Tradicional",v:{tradicao:2}},{t:"Generosa",v:{benevolencia:2}},
            {t:"Justo(a)",v:{universalismo:2}},{t:"Independente",v:{autodeterminacao:2}},{t:"Aventureiro(a)",v:{estimulacao:2}},
            {t:"Ambiciosa",v:{realizacao:2}},{t:"Leal",v:{benevolencia:2}},{t:"Empática",v:{benevolencia:1,universalismo:1}},
            {t:"Curioso(a)",v:{autodeterminacao:1,estimulacao:1}},{t:"Honesto(a)",v:{universalismo:1,conformidade:1}},
            {t:"Equilibrado(a)",v:{seguranca:2}},{t:"Solidário(a)",v:{benevolencia:1,universalismo:1}},{t:"Autêntico(a)",v:{autodeterminacao:2}},
            {t:"Carismática",v:{poder:1,realizacao:1}},{t:"Destemida",v:{estimulacao:2}},
          ].map(tag=>{
            const sel=h.tags.some(t=>t.t===tag.t),locked=!sel&&h.tags.length>=5;
            return <Chip key={tag.t} active={sel} accent={ACCENT} onClick={()=>!locked&&toggleTag(tag)}>
              <span style={{opacity:locked?.3:1}}>{tag.t}</span>
            </Chip>;
          })}
        </div>
        {h.tags.length>0&&(
          <div style={{marginTop:14,padding:"10px 14px",borderRadius:10,background:T.bg3,border:`1px solid ${ACCENT}40`}}>
            <div style={{fontSize:"0.78rem",color:T.txt3,marginBottom:4}}>Você admira em <strong style={{color:T.txt}}>{h.nome||"?"}</strong>:</div>
            <div style={{fontSize:"0.92rem",fontWeight:700,color:ACCENT}}>{h.tags.map(t=>t.t).join(" · ")}</div>
          </div>
        )}
      </Card>
      <div style={{display:"flex",gap:10,padding:"12px 16px",borderRadius:10,background:T.bg2,border:`1px solid ${T.bdr}`,marginBottom:22,alignItems:"flex-start"}}>
        <span style={{fontSize:"1.1rem"}}>💡</span>
        <p style={{fontSize:"0.83rem",color:T.txt3,margin:0,lineHeight:1.7}}>O que você admira nos outros geralmente revela o que valoriza em você.</p>
      </div>
      <BigBtn onClick={handleNext} disabled={!canNext} accent={ACCENT}>
        {idx<2?`Próximo Herói (${idx+2}/3) →`:"Ver os Dilemas →"}
      </BigBtn>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREEN: PHASE 3 — DILEMMAS (rotating colors per question)
// ════════════════════════════════════════════════════════════════
function Phase2Screen({ onNext, scores, onScores }) {
  const [idx,setIdx]=useState(0);
  const [chosen,setChosen]=useState(null);
  const [shown,setShown]=useState(false);
  const d=DILEMAS[idx];
  const ACCENT=DILEMA_ACCENTS[idx];

  // allow re-selection freely — lock only happens when "Next" is clicked
  const choose = opt => {
    setChosen(opt);
    setShown(true);
  };
  const goNext = () => {
    if (chosen) onScores(chosen.v);
    if (idx < DILEMAS.length - 1) {
      setIdx(idx + 1); setChosen(null); setShown(false);
      window.scrollTo({top:0,behavior:"smooth"});
    }
    else onNext();
  };

  return (
    <div style={PAGE}>
      <PhaseHeader phase={3} total={4} label="Dilemas da Vida Real" scores={scores} accent={ACCENT}/>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
        <div style={{flex:1,height:1,background:T.bdr}}/>
        <div style={{fontSize:"0.72rem",color:T.txt3,background:T.bg3,padding:"4px 12px",borderRadius:99,border:`1px solid ${T.bdr}`,whiteSpace:"nowrap"}}>{d.zona}</div>
        <div style={{flex:1,height:1,background:T.bdr}}/>
      </div>
      {/* Scenario card */}
      <div style={{background:T.bg1,borderTop:`1px solid ${T.bdr}`,borderRight:`1px solid ${T.bdr}`,borderBottom:`1px solid ${T.bdr}`,borderLeft:`5px solid ${ACCENT}`,borderRadius:"0 18px 18px 0",overflow:"hidden",marginBottom:18}}>
        <div style={{padding:"14px 20px",display:"flex",alignItems:"center",gap:14,background:`${ACCENT}14`,borderBottom:`1px solid ${ACCENT}28`}}>
          <span aria-hidden style={{fontSize:"2rem"}}>{d.emoji}</span>
          <div>
            <SLabel accent={ACCENT}>{d.badge}</SLabel>
            <h2 style={{fontSize:"1.2rem",fontWeight:700,color:T.txt,margin:0}}>{d.titulo}</h2>
          </div>
        </div>
        <div style={{padding:"14px 20px 18px"}}>
          <p style={{fontSize:"0.83rem",color:T.txt3,fontStyle:"italic",margin:"0 0 8px",lineHeight:1.6}}>{d.contexto}</p>
          <p style={{fontSize:"0.98rem",color:T.txt2,lineHeight:1.85,margin:0}}>{d.narrativa}</p>
        </div>
      </div>
      <fieldset style={{border:"none",padding:0,margin:"0 0 16px"}}>
        <legend style={{fontSize:"0.82rem",fontWeight:700,color:T.txt3,marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase"}}>O que você faz?</legend>
        {/* hint: can change selection */}
        <p style={{fontSize:"0.78rem",color:T.txt3,margin:"0 0 12px",lineHeight:1.6}}>
          Selecione uma opção. Pode trocar antes de continuar.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {d.opcoes.map((opt,i)=>{
            const isSel = chosen?.t === opt.t;
            return (
              <button key={i} onClick={()=>choose(opt)} aria-pressed={isSel}
                style={{
                  width:"100%", textAlign:"left", minHeight:64,
                  padding:"14px 18px", borderRadius:14,
                  fontSize:"0.97rem", fontWeight:isSel?700:500,
                  lineHeight:1.65, cursor:"pointer", transition:"all .18s",
                  background: isSel ? `${ACCENT}22` : T.bg2,
                  border: `2px solid ${isSel ? ACCENT : T.bdrHi}`,
                  color: isSel ? T.txt : T.txt2,
                  display:"flex", alignItems:"flex-start", gap:10,
                }}>
                <span aria-hidden style={{fontFamily:"monospace",fontSize:"0.82rem",fontWeight:700,color:isSel?ACCENT:T.txt3,flexShrink:0}}>{opt.letra}.</span>
                <span style={{flex:1}}>{opt.t}</span>
                {isSel && <span aria-hidden style={{color:ACCENT,fontSize:"1rem",flexShrink:0}}>✓</span>}
              </button>
            );
          })}
        </div>
      </fieldset>
      {/* Reflection — updates live as selection changes */}
      {shown && chosen && (
        <div style={{borderRadius:12,padding:"13px 17px",marginBottom:16,background:`${ACCENT}12`,border:`2px solid ${ACCENT}40`,fontSize:"0.88rem",lineHeight:1.75}}>
          <strong style={{color:ACCENT}}>💡 Reflexão:</strong>{" "}
          <span style={{color:T.txt2}}>Essa escolha ativa os valores de{" "}</span>
          <strong style={{color:T.txt}}>{Object.keys(chosen.v).map(k=>VALORES[k].nome).join(", ")}</strong>
          <span style={{color:T.txt2}}>. Não há resposta certa — só a sua.</span>
        </div>
      )}
      <BigBtn onClick={goNext} disabled={!chosen} accent={ACCENT}>
        {idx<DILEMAS.length-1?`Confirmar e ir para o próximo (${idx+2}/${DILEMAS.length}) →`:"Confirmar e ir para a fase final →"}
      </BigBtn>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:14}} aria-hidden>
        {DILEMAS.map((_,i)=><div key={i} style={{height:7,borderRadius:4,transition:"all .3s",width:i===idx?22:7,background:i<idx?DILEMA_ACCENTS[i]:i===idx?ACCENT:T.bg4}}/>)}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREEN: PHASE 4 — REFLECTIONS
// ════════════════════════════════════════════════════════════════
function Phase3Screen({ onNext, scores, onScores }) {
  const ACCENT=T.AT;
  const [step,setStep]=useState(0);
  const [mc,setMc]=useState([]);
  const [sc,setSc]=useState(null);
  const r=REFLEXOES[step];
  const isMulti=r?.tipo==="multi";
  const canNext=step===0?mc.length>0:sc!==null;

  const handleNext=()=>{
    if(step===0)mc.forEach(a=>onScores(a.v));
    if(step===1&&sc)onScores(sc.v);
    if(step<REFLEXOES.length-1)setStep(step+1);
    else onNext();
  };
  const toggleMc=opt=>setMc(prev=>prev.find(a=>a.t===opt.t)?prev.filter(a=>a.t!==opt.t):[...prev,opt]);

  return (
    <div style={PAGE}>
      <PhaseHeader phase={4} total={4} label="Reflexões" scores={scores} accent={ACCENT}/>
      <div style={{marginBottom:22}}>
        <SLabel accent={ACCENT}>{r.titulo}</SLabel>
        <h2 style={{fontSize:"1.3rem",fontWeight:700,color:T.txt,margin:"0 0 8px",lineHeight:1.45}}>{r.perg}</h2>
        {isMulti&&<p style={{fontSize:"0.83rem",color:T.txt3,margin:0}}>Pode marcar mais de uma opção.</p>}
      </div>
      <fieldset style={{border:"none",padding:0,margin:"0 0 24px",display:"flex",flexDirection:"column",gap:10}}>
        <legend style={{position:"absolute",width:1,height:1,overflow:"hidden"}}>{r.perg}</legend>
        {r.opts.map((opt,i)=>{
          const sel=isMulti?mc.some(a=>a.t===opt.t):sc?.t===opt.t;
          return (
            <button key={i} onClick={()=>isMulti?toggleMc(opt):setSc(opt)} aria-pressed={sel}
              style={{width:"100%",textAlign:"left",minHeight:58,padding:"14px 18px",borderRadius:14,fontSize:"0.98rem",fontWeight:sel?700:500,lineHeight:1.65,cursor:"pointer",transition:"all .18s",
                background:sel?`${ACCENT}20`:T.bg2,
                border:`2px solid ${sel?ACCENT:T.bdrHi}`,
                color:sel?T.txt:T.txt2}}>
              {sel&&<span aria-hidden style={{color:ACCENT,marginRight:10,fontWeight:800}}>✓</span>}
              {opt.t}
            </button>
          );
        })}
      </fieldset>
      <BigBtn onClick={handleNext} disabled={!canNext} accent={ACCENT}>
        {step<REFLEXOES.length-1?"Próxima Pergunta →":"Ver Meu Perfil 🎯"}
      </BigBtn>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// RESULTS TABS
// ════════════════════════════════════════════════════════════════

// TAB 1: Mapa — circle + 4 quadrant grid (like reference image)
function MapaTab({ scores }) {
  const n=useMemo(()=>normS(scores),[scores]);
  const ax=useMemo(()=>axisScore(scores),[scores]);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
        <SchwartzCircleLabeled scores={scores} size={Math.min(280, (typeof window!=="undefined"?window.innerWidth:360) * 0.75)}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {Object.entries(QUADRANTS).map(([axKey,quad])=>{
          const axPct=Math.round(ax[axKey]*100);
          return (
            <div key={axKey} style={{background:T.bg1,borderTop:`3px solid ${quad.accent}`,borderRight:`1px solid ${T.bdr}`,borderBottom:`1px solid ${T.bdr}`,borderLeft:`1px solid ${T.bdr}`,borderRadius:"0 0 14px 14px",padding:"14px 14px"}}>
              <div style={{fontSize:"0.72rem",fontWeight:700,color:quad.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>{quad.label}</div>
              <div style={{fontSize:"0.72rem",color:T.txt3,lineHeight:1.5,marginBottom:12}}>{quad.desc}</div>
              {quad.keys.map(k=>{
                const v=VALORES[k],pct=Math.round((n[k]||0)*100);
                return (
                  <div key={k} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.8rem",marginBottom:4}}>
                      <span style={{color:T.txt2}}>{v.emoji} {v.nome}</span>
                      <span style={{color:T[k],fontWeight:700,fontFamily:"monospace"}}>{pct}%</span>
                    </div>
                    <ProgBar pct={pct} accent={T[k]} thick={6}/>
                  </div>
                );
              })}
              <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${T.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"0.72rem",color:T.txt3}}>Força do eixo</span>
                <span style={{fontSize:"0.92rem",fontWeight:700,color:quad.accent,fontFamily:"monospace"}}>{axPct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// TAB 2: Top 3 — with keywords + gradient strength
function Top3Tab({ scores }) {
  const top=useMemo(()=>{const t=top3(scores);return t.length>=3?t:VKEYS.slice(0,3);},[scores]);
  const n=useMemo(()=>normS(scores),[scores]);
  const STRENGTHS=[{label:"Mais forte",borderW:6,iconSize:52,badgeOp:1.0},{label:"Segundo",borderW:4,iconSize:44,badgeOp:0.78},{label:"Terceiro",borderW:3,iconSize:38,badgeOp:0.58}];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {top.map((k,i)=>{
        const v=VALORES[k],cor=T[k],pct=Math.round((n[k]||0)*100),{label,borderW,iconSize,badgeOp}=STRENGTHS[i];
        return (
          <article key={k} style={{background:T.bg1,borderTop:`1px solid ${T.bdr}`,borderRight:`1px solid ${T.bdr}`,borderBottom:`1px solid ${T.bdr}`,borderLeft:`${borderW}px solid ${cor}`,borderRadius:"0 16px 16px 0"}}>
            <div style={{padding:"18px 20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <div style={{width:iconSize,height:iconSize,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:`${iconSize*0.035+0.6}rem`,background:`${cor}${Math.round(badgeOp*30).toString(16).padStart(2,"0")}`,border:`2px solid ${cor}${Math.round(badgeOp*100).toString(16).padStart(2,"0")}`,flexShrink:0}}>
                  {v.emoji}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:"0.72rem",color:T.txt3,fontFamily:"monospace",marginBottom:2}}>#{i+1} · {label}</div>
                  <div style={{fontSize:"1.15rem",fontWeight:700,color:T.txt}}>{v.nome}</div>
                </div>
                <div style={{fontSize:"1.3rem",fontWeight:700,fontFamily:"monospace",color:cor,opacity:badgeOp}}>{pct}%</div>
              </div>
              <ProgBar pct={pct} accent={cor} thick={10}/>
              <p style={{fontSize:"0.92rem",color:T.txt2,lineHeight:1.8,margin:"12px 0 14px"}}>{v.desc}</p>
              {/* Keywords */}
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
                {v.keywords.map(kw=>(
                  <span key={kw} style={{background:`${cor}1C`,border:`1px solid ${cor}55`,borderRadius:99,padding:"3px 10px",fontSize:"0.76rem",fontWeight:600,color:cor,opacity:badgeOp}}>
                    {kw}
                  </span>
                ))}
              </div>
              {/* Desejo vs Valor */}
              <div style={{background:T.bg3,borderRadius:12,padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"flex",gap:10,fontSize:"0.88rem"}}>
                  <span>💭</span>
                  <div>
                    <div style={{fontSize:"0.7rem",fontWeight:700,color:"#FFC850",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>Desejo momentâneo</div>
                    <p style={{color:T.txt3,margin:0,lineHeight:1.75}}>{v.desejo}</p>
                  </div>
                </div>
                <div style={{height:1,background:T.bdr}}/>
                <div style={{display:"flex",gap:10,fontSize:"0.88rem"}}>
                  <span>✦</span>
                  <div>
                    <div style={{fontSize:"0.7rem",fontWeight:700,color:T.AT,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>Valor fundamental</div>
                    <p style={{color:T.txt,margin:0,lineHeight:1.75}}>{v.valor}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

// TAB 3: Reflexão — invitation framing + fixed mission conjugation
function ReflexaoTab({ scores, reg }) {
  const top=useMemo(()=>{
    const t=top3(scores);
    // fallback to first 3 VKEYS if scores are all zero
    return t.length>=3?t:VKEYS.slice(0,3);
  },[scores]);
  const m=VALOR_MISSION[top[0]]||VALOR_MISSION["autodeterminacao"];
  const v1=VALORES[top[0]]||VALORES["autodeterminacao"];
  const v2=VALORES[top[1]]||VALORES["benevolencia"];
  const v3=VALORES[top[2]]||VALORES["universalismo"];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <Card accent={T.AT}>
        <SLabel accent={T.AT}>📖 Sobre valores autênticos</SLabel>
        <p style={{fontSize:"0.95rem",color:T.txt2,lineHeight:1.85,margin:"0 0 10px",textAlign:"justify"}}>
          Valores não são o que você <em>diz</em> que acredita — são o que guia suas ações quando ninguém está olhando, quando você está sob pressão, quando tem que escolher entre o fácil e o certo.
        </p>
        <p style={{fontSize:"0.95rem",color:T.txt2,lineHeight:1.85,margin:0,textAlign:"justify"}}>
          Não existe perfil "melhor". Existe o <strong style={{color:T.txt}}>seu</strong>, autêntico.
        </p>
      </Card>

      {/* Invitation to reflect — framing text before questions */}
      <Card accent="#FFC850">
        <SLabel accent="#FFC850">⚡ Convite à Reflexão</SLabel>
        <p style={{fontSize:"0.92rem",color:T.txt2,lineHeight:1.85,margin:"0 0 18px",textAlign:"justify"}}>
          As perguntas abaixo são um <strong style={{color:T.txt}}>convite</strong>, não uma avaliação. Reserve um momento para pensar com honestidade sobre você. Não há respostas certas — há apenas as suas.
        </p>
        <ol style={{margin:0,paddingLeft:22,display:"flex",flexDirection:"column",gap:16}}>
          {[
            `Em que situação desta semana você agiu a partir de ${v1.nome.toLowerCase()}? Dê um exemplo concreto.`,
            `Você já agiu por desejo momentâneo e se arrependeu? O que o valor ${v1.nome} teria sugerido?`,
            `Como ${v1.nome.toLowerCase()} aparece nas suas relações com amigos e família?`,
          ].map((q,i)=>(
            <li key={i} style={{fontSize:"0.95rem",color:T.txt2,lineHeight:1.8,paddingLeft:4,textAlign:"justify"}}>{q}</li>
          ))}
        </ol>
      </Card>

      {/* Mission statement — grammatically correct, inclusive language */}
      <div style={{background:`linear-gradient(135deg,${T.amber}14,${T.AT}12)`,border:`2px solid ${T.amber}42`,borderRadius:16,padding:"20px 22px"}}>
        <SLabel accent={T.amber}>🎯 Minha missão de carreira (esboço)</SLabel>
        <p style={{fontSize:"1rem",color:T.txt2,lineHeight:1.9,fontStyle:"italic",margin:"0 0 6px",textAlign:"justify"}}>
          "Serei mais feliz quando puder ser uma pessoa{" "}
          <strong style={{color:T[top[0]],fontStyle:"normal"}}>{m.adj}</strong>,
          {" "}em <strong style={{color:T[top[1]],fontStyle:"normal"}}>{m.ctx}</strong>,
          {" "}de modo a contribuir com{" "}
          <strong style={{color:T[top[2]],fontStyle:"normal"}}>{m.contrib}</strong>."
        </p>
        <p style={{fontSize:"0.78rem",color:T.txt3,margin:0}}>
          Com base nos seus valores: {v1.nome} · {v2.nome} · {v3.nome}
        </p>
      </div>

      <p style={{textAlign:"center",fontSize:"0.78rem",color:T.txt3,lineHeight:1.7}}>
        Teoria dos Valores Básicos de Schwartz (2005)<br/>
        PVQ-21 · ESS (2009) · adaptado ao português brasileiro
      </p>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════
// TAB 4: SAIBA MAIS — descrição científica dos 4 eixos e 10 valores
// Baseado em: Schwartz (2005), Tamayo & Porto (2009), PVQ-21 ESS
// ════════════════════════════════════════════════════════════════
const SAIBA_DATA = [
  {
    axKey:"AT", titulo:"Autotranscendência",
    desc:"Engloba valores que priorizam o bem-estar coletivo em detrimento dos interesses pessoais. Pessoas com alto índice neste eixo tendem a agir por empatia, solidariedade e senso de justiça global. É o oposto da Autopromoção.",
    ref:"Schwartz (1992) define este polo como a tendência de transcender os interesses do ego para promover o bem-estar dos outros e da natureza.",
    valores:[
      { key:"universalismo", titulo:"Universalismo",
        def:"Compreensão, tolerância e proteção do bem-estar de todas as pessoas e da natureza.",
        exemplos:"Lutar por igualdade racial, defender o meio ambiente, valorizar a diversidade cultural.",
        oposto:"Poder — enquanto o universalismo busca o bem de todos, o poder busca domínio sobre outros.",
        ref:"Derivado das necessidades de sobrevivência do grupo e da interação com aqueles fora do círculo próximo (Schwartz, 1992)." },
      { key:"benevolencia", titulo:"Benevolência",
        def:"Preservação e melhoria do bem-estar das pessoas com quem se tem contato frequente.",
        exemplos:"Cuidar de amigos em dificuldade, ser leal à família, agir com generosidade no cotidiano.",
        oposto:"Realização — benevolência prioriza o outro; realização prioriza o sucesso pessoal.",
        ref:"Origina-se da necessidade de afiliação e de manter relações de grupo positivas (Schwartz & Bilisky, 1990)." },
    ]
  },
  {
    axKey:"AM", titulo:"Abertura à Mudança",
    desc:"Reúne valores ligados à independência intelectual e emocional, à busca de novidades e ao prazer. Pessoas neste polo tendem a questionar o estabelecido, explorar o novo e seguir seus próprios caminhos. É o oposto da Conservação.",
    ref:"Schwartz (1992) descreve este polo como a motivação para seguir o próprio pensamento e impulso, abraçando a mudança e a novidade.",
    valores:[
      { key:"autodeterminacao", titulo:"Autodeterminação",
        def:"Independência no pensamento e na ação — escolher, criar e explorar de forma autônoma.",
        exemplos:"Tomar decisões próprias, criar projetos originais, questionar normas por princípio.",
        oposto:"Conformidade e Tradição — que valorizam seguir regras e costumes estabelecidos.",
        ref:"Deriva das necessidades de controle, autonomia e interação independente com o ambiente (Deci & Ryan, apud Schwartz, 1992)." },
      { key:"estimulacao", titulo:"Estimulação",
        def:"Busca de excitação, novidade e desafio como fonte de motivação.",
        exemplos:"Experimentar esportes radicais, viajar para lugares desconhecidos, buscar novas experiências.",
        oposto:"Segurança e Conformidade — que valorizam estabilidade e previsibilidade.",
        ref:"Relacionada à necessidade biológica de ativação e estimulação variada para manter nível ideal de funcionamento (Schwartz, 1992)." },
      { key:"hedonismo", titulo:"Hedonismo",
        def:"Busca de prazer e gratificação sensorial para si mesmo.",
        exemplos:"Apreciar momentos de lazer, valorizar experiências agradáveis, incluir diversão na rotina.",
        oposto:"Conformidade — que restringe impulsos em prol das normas coletivas.",
        ref:"Derivado das necessidades orgânicas de prazer, presente em todos os organismos (Schwartz & Bilisky, 1990)." },
    ]
  },
  {
    axKey:"C", titulo:"Conservação",
    desc:"Engloba valores que enfatizam a ordem, a autocoerção e a resistência à mudança. Pessoas neste polo tendem a valorizar a estabilidade, o respeito às normas e a preservação das estruturas sociais existentes. É o oposto da Abertura à Mudança.",
    ref:"Schwartz (1992) descreve este polo como a motivação para preservar práticas tradicionais e proteger a estabilidade das estruturas sociais.",
    valores:[
      { key:"seguranca", titulo:"Segurança",
        def:"Busca de segurança, harmonia e estabilidade na sociedade, nos relacionamentos e no self.",
        exemplos:"Priorizar estabilidade financeira, valorizar ambientes previsíveis, proteger a família.",
        oposto:"Estimulação — que busca novidade e risco.",
        ref:"Deriva da necessidade básica de proteção e de pertencimento a grupos estáveis (Schwartz, 1992)." },
      { key:"conformidade", titulo:"Conformidade",
        def:"Restrição de ações, inclinações e impulsos que possam perturbar ou prejudicar outros.",
        exemplos:"Seguir regras escolares, respeitar a vez de falar, obedecer combinados mesmo sem fiscalização.",
        oposto:"Autodeterminação — que valoriza agir segundo a própria vontade.",
        ref:"Origina-se da necessidade de inibir tendências que possam minar o funcionamento e a coesão do grupo (Schwartz, 1992)." },
      { key:"tradicao", titulo:"Tradição",
        def:"Respeito, comprometimento e aceitação dos costumes e ideias transmitidos pela cultura e religião.",
        exemplos:"Valorizar festas e rituais familiares, respeitar a sabedoria dos mais velhos, manter práticas culturais.",
        oposto:"Autodeterminação — que valoriza criar e questionar o estabelecido.",
        ref:"Grupos desenvolvem práticas e símbolos compartilhados; aceitar essas tradições expressa solidariedade e unicidade do grupo (Schwartz, 1992)." },
    ]
  },
  {
    axKey:"AP", titulo:"Autopromoção",
    desc:"Reúne valores que priorizam o sucesso pessoal, a busca de status e o controle sobre pessoas e recursos. Pessoas neste polo tendem a ser orientadas por metas individuais e pelo reconhecimento externo. É o oposto da Autotranscendência.",
    ref:"Schwartz (1992) descreve este polo como a motivação para promover os próprios interesses, mesmo à custa dos outros.",
    valores:[
      { key:"realizacao", titulo:"Realização",
        def:"Busca de sucesso pessoal por meio da demonstração de competência segundo padrões sociais.",
        exemplos:"Buscar excelência acadêmica, conquistar metas profissionais, ser reconhecido pelo mérito.",
        oposto:"Benevolência — que prioriza o bem-estar do outro antes do sucesso próprio.",
        ref:"Deriva da necessidade de demonstrar competência para obter aprovação social (Schwartz & Bilisky, 1990)." },
      { key:"poder", titulo:"Poder",
        def:"Busca de status social, prestígio e controle sobre pessoas e recursos.",
        exemplos:"Assumir posições de liderança, buscar influência, construir uma reputação de autoridade.",
        oposto:"Universalismo — que busca igualdade entre as pessoas.",
        ref:"Enraizado nas necessidades de dominância e controle presentes em todos os grupos sociais hierárquicos (Schwartz, 1992)." },
    ]
  },
];

function SaibaMaisTab() {
  const [open, setOpen] = useState({});
  const toggle = key => setOpen(p => ({...p, [key]: !p[key]}));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Header */}
      <div style={{background:T.bg2,borderRadius:14,padding:"16px 18px",border:`1px solid ${T.bdrHi}`}}>
        <SLabel accent={T.amber}>📚 Base Científica</SLabel>
        <p style={{fontSize:"0.92rem",color:T.txt2,lineHeight:1.85,margin:0,textAlign:"justify"}}>
          Os 10 valores abaixo formam a <strong style={{color:T.txt}}>Teoria dos Valores Básicos de Schwartz</strong>, validada em mais de 80 países. Eles se organizam em 4 grandes eixos opostos em pares. Toque em cada valor para entender o que ele significa na prática.
        </p>
      </div>

      {SAIBA_DATA.map(({axKey, titulo, desc, ref, valores}) => {
        const accent = T[axKey];
        return (
          <div key={axKey} style={{borderRadius:16,overflow:"hidden",
            border:`2px solid ${accent}`,
            boxShadow:`0 0 0 1px ${accent}22, 0 4px 20px ${accent}14`}}>
            {/* Axis header — unique bg per quadrant */}
            <div style={{
              background: axKey==="AT" ? "rgba(63,203,168,0.13)"
                        : axKey==="AM" ? "rgba(242,162,42,0.13)"
                        : axKey==="C"  ? "rgba(58,142,200,0.13)"
                        :                "rgba(142,122,224,0.13)",
              padding:"16px 18px",borderBottom:`1px solid ${accent}30`}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:14,height:14,borderRadius:"50%",background:accent,flexShrink:0}}/>
                <h3 style={{fontSize:"1.05rem",fontWeight:700,color:accent,margin:0}}>{titulo}</h3>
              </div>
              <p style={{fontSize:"0.88rem",color:T.txt2,lineHeight:1.8,margin:"0 0 8px",textAlign:"justify"}}>{desc}</p>
              <p style={{fontSize:"0.76rem",color:T.txt3,lineHeight:1.7,margin:0,fontStyle:"italic",textAlign:"justify"}}>"{ref}"</p>
            </div>

            {/* Values accordion */}
            <div style={{background: axKey==="AT" ? "#0C3530"
                                    : axKey==="AM" ? "#2E1F0A"
                                    : axKey==="C"  ? "#0A1E2E"
                                    :                "#1A1228"}}>
              {valores.map(v => {
                const cor = T[v.key];
                const isOpen = open[v.key];
                return (
                  <div key={v.key} style={{borderBottom:`1px solid ${T.bdr}`}}>
                    {/* Accordion trigger */}
                    <button onClick={()=>toggle(v.key)}
                      aria-expanded={isOpen}
                      style={{width:"100%",textAlign:"left",padding:"14px 18px",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:12,minHeight:54}}>
                      <span style={{fontSize:"1.1rem"}}>{VALORES[v.key].emoji}</span>
                      <span style={{flex:1,fontSize:"0.97rem",fontWeight:700,color:cor}}>{v.titulo}</span>
                      <span style={{color:T.txt3,fontSize:"0.85rem",transition:"transform .2s",display:"inline-block",transform:isOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
                    </button>

                    {/* Accordion content */}
                    {isOpen && (
                      <div style={{padding:"0 18px 18px",display:"flex",flexDirection:"column",gap:12}}>
                        {/* Definition */}
                        <div style={{background:T.bg3,borderRadius:10,padding:"12px 14px",borderLeft:`3px solid ${cor}`}}>
                          <div style={{fontSize:"0.7rem",fontWeight:700,color:cor,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>Definição</div>
                          <p style={{fontSize:"0.9rem",color:T.txt,lineHeight:1.8,margin:0,textAlign:"justify"}}>{v.def}</p>
                        </div>
                        {/* Examples */}
                        <div style={{background:T.bg3,borderRadius:10,padding:"12px 14px",borderLeft:`3px solid ${T.amber}`}}>
                          <div style={{fontSize:"0.7rem",fontWeight:700,color:T.amber,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>✦ Na prática</div>
                          <p style={{fontSize:"0.9rem",color:T.txt2,lineHeight:1.8,margin:0,textAlign:"justify"}}>{v.exemplos}</p>
                        </div>
                        {/* Opposite */}
                        <div style={{background:T.bg3,borderRadius:10,padding:"12px 14px",borderLeft:`3px solid ${T.txt3}`}}>
                          <div style={{fontSize:"0.7rem",fontWeight:700,color:T.txt3,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>↔ Valor oposto</div>
                          <p style={{fontSize:"0.9rem",color:T.txt2,lineHeight:1.8,margin:0,textAlign:"justify"}}>{v.oposto}</p>
                        </div>
                        {/* Reference */}
                        <p style={{fontSize:"0.76rem",color:T.txt3,lineHeight:1.7,margin:0,fontStyle:"italic",textAlign:"justify"}}>{v.ref}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <p style={{textAlign:"center",fontSize:"0.76rem",color:T.txt3,lineHeight:1.8,margin:0}}>
        Fontes: Schwartz, S.H. (1992). Universals in the content and structure of values.<br/>
        Tamayo & Porto (2009). Validação do QPV no Brasil. Psic.: Teoria e Pesquisa, 25(3).<br/>
        PVQ-21 · European Social Survey (2009).
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SCREEN: RESULTS
// ════════════════════════════════════════════════════════════════
function ResultsScreen({ scores, reg }) {
  const [tab,setTab]=useState("mapa");
  const [sent,setSent]=useState(null); // null | "ok" | "erro"
  const TABS=[{k:"mapa",l:"Mapa"},{k:"top3",l:"Top 3"},{k:"reflexao",l:"Reflexão"},{k:"saibamais",l:"📚 Entenda"}];

  // Envio automático ao chegar na tela — sem precisar clicar
  useEffect(()=>{
    if(!SHEETS_WEBHOOK_URL) return;
    sendToSheets(reg, scores).then(res => setSent(res.ok ? "ok" : "erro"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReenviar = async () => {
    setSent(null);
    const res = await sendToSheets(reg, scores);
    setSent(res.ok ? "ok" : "erro");
  };

  return (
    <div style={PAGE}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <SLabel accent={T.amber}>Seu Perfil de Valores</SLabel>
        <h1 style={{fontSize:"1.8rem",fontWeight:700,color:T.txt,margin:"0 0 6px",lineHeight:1.2}}>{reg.nome.split(" ")[0]}, aqui está você</h1>
        <p style={{fontSize:"0.85rem",color:T.txt3,margin:0}}>Turma {reg.turma} · RA {reg.ra}</p>
      </div>

      {/* Status do envio — discreto no topo */}
      {SHEETS_WEBHOOK_URL && (
        <div style={{textAlign:"center",marginBottom:16,fontSize:"0.82rem",minHeight:24}}>
          {sent===null && (
            <span style={{color:T.txt3}}>📤 Salvando resultado...</span>
          )}
          {sent==="ok" && (
            <span style={{color:T.AT,fontWeight:700}}>✅ Resultado salvo com sucesso!</span>
          )}
          {sent==="erro" && (
            <span>
              <span style={{color:T.hedonismo,fontWeight:700,marginRight:10}}>⚠️ Erro ao salvar.</span>
              <button onClick={handleReenviar}
                style={{background:"none",border:`1px solid ${T.hedonismo}`,borderRadius:6,color:T.hedonismo,padding:"2px 10px",fontSize:"0.8rem",cursor:"pointer",fontWeight:700}}>
                Tentar novamente
              </button>
            </span>
          )}
        </div>
      )}

      {/* Tabs — faixa chamativa com cor única por aba */}
      <div role="tablist"
        style={{display:"flex",gap:6,padding:"6px",marginBottom:24,
          background:"linear-gradient(135deg,#071E26 0%,#0C3530 50%,#0A1E2E 100%)",
          borderRadius:16,border:`2px solid ${T.bdrHi}`,
          boxShadow:"0 4px 24px rgba(0,0,0,0.5)"}}>
        {TABS.map(({k,l})=>{
          const tabAccents={mapa:T.AT,top3:T.amber,reflexao:T.AM,saibamais:"#8DC63F"};
          const ac=tabAccents[k];
          const isActive=tab===k;
          return (
            <button key={k} role="tab" aria-selected={isActive} onClick={()=>setTab(k)}
              style={{
                flex:1, minHeight:52, borderRadius:11,
                fontSize:"0.82rem", fontWeight:700, cursor:"pointer",
                lineHeight:1.25, padding:"6px 4px",
                transition:"all .2s",
                background: isActive ? ac : "transparent",
                border: `2px solid ${isActive ? ac : ac+"66"}`,
                color: isActive ? T.bg0 : ac,
                boxShadow: isActive ? `0 2px 12px ${ac}55` : "none",
              }}>
              {l}
            </button>
          );
        })}
      </div>

      <FadeUp id={tab}>
        {tab==="mapa"    && <MapaTab scores={scores}/>}
        {tab==="top3"    && <Top3Tab scores={scores}/>}
        {tab==="reflexao"  && <ReflexaoTab scores={scores} reg={reg}/>}
        {tab==="saibamais" && <SaibaMaisTab/>}
      </FadeUp>

      <div style={{height:40}}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════════
export default function App() {
  useFonts();
  useGCSS();

  const [screen,setScreen]=useState("welcome");
  const [reg,setReg]=useState({nome:"",ra:"",turma:""});
  const [scores,setScores]=useState(zero);
  const [showA11y,setShowA11y]=useState(false);
  const [a11y,setA11y]=useState({fontSize:0,highContrast:false,reduceMotion:false,bigText:false});

  const go=useCallback(s=>setScreen(s),[]);
  const addScores=useCallback(v=>setScores(p=>addS(p,v)),[]);

  const fsSizes=["18px","20px","22px"];
  // Apply font size to <html> so rem units scale everywhere
  useEffect(()=>{
    const base = a11y.bigText ? "22px" : fsSizes[a11y.fontSize] || "18px";
    document.documentElement.style.fontSize = base;
    return () => { document.documentElement.style.fontSize = ""; };
  }, [a11y.fontSize, a11y.bigText]);

  const rootStyle={
    minHeight:"100vh",
    background:a11y.highContrast?"#000":T.bg0,
    color:a11y.highContrast?"#fff":T.txt,
    fontFamily:"'Atkinson Hyperlegible','Verdana',sans-serif",
  };

  return (
    <div style={rootStyle}>
      {/* Accessibility toggle */}
      <button onClick={()=>setShowA11y(true)} aria-label="Abrir configurações de acessibilidade"
        style={{position:"fixed",top:16,right:16,zIndex:50,width:50,height:50,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:T.bg2,border:`2px solid ${T.bdrHi}`,cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,0.5)"}}>
        <A11yIcon size={26} color={T.amber}/>
      </button>

      {showA11y&&<A11yPanel s={a11y} set={setA11y} onClose={()=>setShowA11y(false)}/>}

      <FadeUp id={screen}>
        {screen==="welcome"  && <WelcomeScreen  onStart={()=>go("registro")}/>}
        {screen==="registro" && <RegistroScreen onNext={()=>go("intro")} reg={reg} setReg={setReg}/>}
        {screen==="intro"    && <IntroScreen    onNext={()=>go("pvq")}/>}
        {screen==="pvq"      && <PVQScreen      onNext={()=>go("phase1")} scores={scores} onScores={addScores}/>}
        {screen==="phase1"   && <Phase1Screen   onNext={()=>go("phase2")} scores={scores} onScores={addScores}/>}
        {screen==="phase2"   && <Phase2Screen   onNext={()=>go("phase3")} scores={scores} onScores={addScores}/>}
        {screen==="phase3"   && <Phase3Screen   onNext={()=>go("results")} scores={scores} onScores={addScores}/>}
        {screen==="results"  && <ResultsScreen  scores={scores} reg={reg}/>}
      </FadeUp>
    </div>
  );
}

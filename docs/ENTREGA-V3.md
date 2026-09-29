# Saúde Shalon — prévia editorial v3

Implementação do wireframe aprovado: hero branco/azul com fotografia documental, avaliação de 2–3h, análise de 800 parâmetros presenciais, consulta explicativa, sessão inicial conforme indicação e retorno incluído. A oferta aparece logo após a abertura. A continuidade é separada e não condiciona o retorno. Sem preços ou formulário.

Layout fluido, Source Serif 4 nos títulos e Manrope na interface, áreas de leitura ampliadas no celular, seis fichas de recursos com fotos, FAQ nativo, menu e diálogos com teclado, movimento reduzido e vídeo externo carregado após clique. Nenhuma foto foi inventada e nenhum depoimento fictício foi publicado. A foto da autoridade é diferente da abertura; o texto não se sobrepõe a rostos.

O WhatsApp continua sem número, conforme instrução. Configurar WHATSAPP_OFICIAL na Vercel ou site.config.mjs; enquanto vazio, o botão apresenta o aviso de revisão, sem abrir telefone fictício. A edição ainda exige validação de imagens, texto técnico, credenciais e dados jurídicos antes de campanha.

Código na branch feat/saude-shalon-lp. Não mesclar com main: main é a LP do evento. O workflow aplica a transformação editorial uma única vez, executa testes e versiona o HTML resultante; scripts/refine-layout.mjs é apenas uma migração idempotente. A fonte editável final permanece em src/index.html. Tokens e refinamentos em public/assets/editorial.css e comportamento progressivo em public/assets/editorial.js. Os demais módulos e configurações permanecem preservados.

Testes unitários e estáticos são executados no build. A verificação de navegador em 12 larguras, de 320 a 1920 px, registra qa/v3/report.json e screenshots. Ela verifica overflow, sobreposição entre texto e imagem, legibilidade mínima dos textos centrais, menu, foco, diálogos, FAQ, detalhes e carregamento do vídeo. Não representa certificação integral de acessibilidade ou medição de conversão.

O workflow lê os metadados de deployment pela integração GitHub e registra PREVIEW_REPORT nos logs. Sucesso de build não equivale a prévia aberta sem autenticação. O artefato contém o código e os resultados; um eventual bloqueio de acesso da Vercel é informado, não contornado.

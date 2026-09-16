# Saúde Shalon · Landing page

Landing page editorial e responsiva para o **Saúde Shalon — Centro Terapêutico Avançado**. Layout branco e azul, Source Serif 4 nos títulos, Manrope na interface, imagens reais do acervo de marketing e contato pelo WhatsApp. Sem formulário, tabela de preços ou pixels ativos.

## Estado da entrega

**Prévia de revisão.** A base visual e funcional está construída. O telefone oficial permanece vazio. Enquanto não for configurado, o botão abre um aviso de revisão: nenhuma mensagem é enviada e nenhum número fictício é utilizado. Depoimentos são espaços claramente identificados, não relatos inventados.

O código desta LP está na branch **`feat/saude-shalon-lp`**. A branch `main` mantém a LP do evento Além dos Sintomas. **Não mesclar esta branch em `main` para publicar a nova clínica**, pois são páginas diferentes. Para operação independente, use um novo projeto Vercel configurado para esta branch ou mova este código para um repositório próprio.

## Executar

Node.js 22 ou superior. Não há dependências de produção para instalar.

```sh
git clone --single-branch --branch feat/saude-shalon-lp https://github.com/gestorfagundes2025-cmd/alem-dos-sintomas.git saude-shalon-lp
cd saude-shalon-lp
npm test
npm run build
npm run preview
```

O servidor local abre na porta `4173`. `npm run dev` também constrói e serve o site; não implementa hot reload. Após editar, execute o build novamente e atualize o navegador.

## Vercel

O arquivo `vercel.json` define projeto estático (`Other`), build `npm run build`, saída `dist`, headers de segurança e URLs limpas. O diretório raiz é o deste projeto, não `src` nem `dist`. O build não exige instalação de pacotes.

A integração existente pode gerar um **Preview Deployment** a partir da branch. Isso não altera o domínio de produção do evento. Caso a integração não gere a prévia automaticamente, importe o código em um **projeto Vercel separado** e configure a branch de origem corretamente antes de publicar. Não aponte o domínio do evento para esta LP.

Para ativar o WhatsApp, configure `WHATSAPP_OFICIAL` nas variáveis de ambiente da Vercel (DDI 55 + DDD + número, somente dígitos) ou edite `whatsapp` em `site.config.mjs`. Não há um valor de exemplo utilizável na configuração padrão. Faça novo deploy após a alteração.

## Revisão e campanha

`site.config.mjs` centraliza nome, mensagem, telefone, domínio canônico, identificação jurídica e aprovações. Não insira chaves privadas nem dados de pacientes nesse arquivo.

- Modo padrão: `review`, com `noindex,nofollow`, `robots.txt` restritivo, aviso e espaços de revisão.
- `SITE_MODE=live` exige telefone, URL HTTPS, dados jurídicos e as quatro aprovações explícitas. Um build incompleto falha, em vez de liberar informações fictícias.
- Deployments com `VERCEL_ENV=preview` permanecem em revisão, mesmo quando o modo live é solicitado.
- As seções delimitadas por `REVIEW:START` e `REVIEW:END` são retiradas no build live. Para utilizar depoimentos reais, substitua os espaços com autorização e adapte a seção para a publicação; não deixe os placeholders fora desses delimitadores.
- `noindex` é uma orientação para buscadores, **não controle de acesso**. A branch e os previews podem ser públicos. Não colocar informações confidenciais aqui.

## Conteúdo e limites

O conteúdo diferencia avaliação presencial de 2–3 horas, análise de 800 parâmetros, explicação, sessão inicial conforme indicação, contato aos 20 dias e retorno aos 45 dias. Protocolos de continuidade são contratados à parte. Não afirma 800 exames ou 800 diagnósticos. A etapa terapêutica não é apresentada como consulta pessoal com a doutora.

Antes de campanha, validar oferta, responsabilidades profissionais, alegações clínicas, autorizações de imagem, dados jurídicos e identidade final. O wordmark tipográfico é uma composição de revisão, não um arquivo de logotipo oficial. O logotipo histórico localizado identificava outra frente e não foi apresentado como a nova marca.

## Imagens e fontes

As três imagens utilizadas vieram de acervo institucional de marketing acessível na execução. A origem técnica está em `assets.manifest.json`. O acesso a um arquivo não substitui a autorização de uso de imagem; a aprovação permanece pendente.

O build usa primeiro as imagens locais em `public/assets`. Na ausência, baixa a versão reduzida dos arquivos públicos indicados no manifesto. A automação do GitHub versiona essas imagens na branch depois de um build bem-sucedido, para não depender de novos downloads em cada deploy. Se uma fonte ficar indisponível antes disso, coloque a imagem autorizada no caminho informado e execute novamente.

No pacote ZIP entregue, as imagens já estão incluídas, otimizadas e sem EXIF. Fontes são carregadas pelo Google Fonts com `display=swap` e fallbacks. **Não há arquivos de fontes distribuídos no projeto.**

## Organização

```text
src/index.html           Conteúdo e estrutura semântica
src/styles.css           Tokens, componentes e responsividade
src/main.js              Menu, diálogos e botões
src/contact.mjs          Validação do telefone e URL do WhatsApp
src/privacidade.html     Minuta informativa de privacidade
site.config.mjs          Configuração pública
public/assets/           Imagens e favicon
scripts/                 Build, verificação e servidor
tests/contact.test.mjs   Testes de configuração e contato
vercel.json              Configuração de hospedagem
.github/workflows/       Verificação e versionamento de imagens
```

## Medição

O código emite apenas o evento **local** `shalon:contact-intent` com `placement` e `channel`. Não envia esse evento à Meta, ao Google ou a um servidor. Representa intenção de clique, não mensagem enviada, lead validado, agendamento ou venda. Mensuração de saúde e compartilhamento de dados exigem uma implementação posterior adequada; não adicionar informações clínicas ao evento, à URL ou à mensagem pré-preenchida.

## Testes

`npm test`: dez testes unitários. `npm run build`: geração e verificação da grafia obrigatória, ausência de preços e formulário, H1, IDs, âncoras e imagens. A revisão visual e de interação foi executada em Chromium em oito larguras, de 320 a 1440 px. Consulte `docs/QA.md` para resultados e limitações.

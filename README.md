# Jornada Além dos Sintomas

Landing page estática criada a partir da identidade, logotipo e foto real da Dra. Elizete presentes no ZIP fornecido. O quiz original não foi modificado.

## Antes de receber tráfego

1. Checkout informado pelo responsável e configurado em `dist/assets/config.js`: https://pay.hub.la/u4gdUmckM4Y0xMqv9e5W . Os botões de compra usam esse destino. Uma configuração vazia volta ao modo de prévia.
2. Confirmar o ingresso: mantido R$ 69 conforme o último alinhamento explícito do usuário. A reunião de 08/09 contém menção a R$ 69,90. Para mudar, editar `ticketPrice`; a página atualiza todas as indicações visíveis. Atualizar também os valores estáticos do HTML como fallback.
3. Confirmar dados públicos do rodapé, CRM/RQE copiados da base, data, horário e conteúdo da aula com a equipe.
4. Não divulgar como página ativa antes de conferir que o checkout é dessa oferta e que o valor coincide. Não foram feitas compras de teste.

## Publicação externa

O conteúdo de `dist/` funciona em hospedagem estática, inclusive Hostinger, preservando a estrutura de arquivos. A versão Sites serve como prévia privada; liberar uma versão pública exige configurar primeiro o checkout. A meta `noindex, nofollow` pode permanecer em uma LP de campanha; só altere se houver intenção de indexação.

### Vercel pelo GitHub

O arquivo `vercel.json` na raiz configura a publicação de `dist/`, onde estão `index.html`, a página de privacidade e os assets. O projeto é estático e não precisa instalar dependências nem executar build.

Ao importar este repositório, mantenha **Root Directory** na raiz do repositório (campo vazio ou `.`) e use a branch `main`. O arquivo define **Framework Preset: Other**, comandos de instalação/build vazios e **Output Directory: dist**. Não configure `dist` simultaneamente como Root Directory e Output Directory.

Se uma publicação anterior retornar 404, publique o commit que contém `vercel.json`. A integração com o GitHub deve criar uma nova publicação após o push; se isso não ocorrer, selecione **Redeploy** no deployment do commit atualizado. A rota `/` deve exibir a landing page e `/privacidade.html` deve abrir a política de privacidade.

## Acesso e mensuração

Os CTAs redirecionam na mesma aba ao checkout validado; preservam os parâmetros existentes do destino e repassam apenas UTMs da URL atual. Nenhuma resposta do quiz, informação clínica ou dado pessoal é coletado. Não há pixel, GTM, cookies de publicidade, envio de dados ou eventos Purchase simulados. Um evento DOM local `jornada:checkout-click` expõe apenas a posição do botão para futura integração autorizada. Qualquer mensuração publicitária adicional exige configuração própria e revisão de privacidade.

## Validação realizada

Checagens estáticas de referências locais, HTML e sintaxe JavaScript; verificação programática da lógica de checkout sem abrir o destino nem fazer pagamento. Revisão visual em navegador Chromium, com áreas de exibição de 320, 390, 768, 1024 e 1440 pixels. Nenhum transbordamento horizontal ou imagem quebrada nas larguras verificadas. Texto ampliado a 200% também conferido em 320 e 390 pixels. A verificação se limita ao navegador e às condições descritas; não inclui compra nem pagamento real.

## Conteúdo

Oferta pública: aula ao vivo, 16/09/2026 às 19h; grupo apenas para avisos/acesso. Não promete replay, consulta, amostra capilar, acompanhamento de 30 dias, resultado clínico ou parâmetros de teste. A oferta posterior está fora da LP.

## Revisão de setembro de 2026

Marca revisada para **Instituto Shalon**, com N, inclusive metadados, textos alternativos e privacidade. Copy centrada em cansaço/fadiga, alterações intestinais, queda de cabelo e sono, apresentando três objetivos educativos. A Dra. Elizete conduz a narrativa; o ingresso inclui apenas a aula e o grupo de avisos/acesso.

O cronômetro usa `eventStart: "2026-09-16T19:00:00-03:00"`, equivalente a 22h UTC. Recalcula o intervalo pela hora atual e não reinicia após o prazo. Na hora do evento, encerra a contagem e desabilita os botões de inscrição. As simulações cobrem virada do prazo, aba suspensa, atraso do temporizador e configuração inválida. A precisão depende do relógio do dispositivo.

## Desenvolvimento e revisão

`npm ci` e `npm run dev -- --port 4173` iniciam a prévia local com Vite. O caminho `/__review` existe apenas no ambiente de desenvolvimento e permite conferir larguras e ampliação de texto; não integra `dist/` nem a publicação estática. `npm run check` executa as verificações da página, checkout e cronômetro. A configuração estática da Vercel permanece independente dessas ferramentas.

## Fotografias e identidade

- Logotipo, ícone e retrato da Dra. Elizete: material original fornecido no ZIP do Instituto.
- `momento-de-cuidado.jpg`: Ron Lach / Pexels — https://www.pexels.com/photo/woman-looking-through-window-at-home-9870242/
- `alimentacao-e-habitos.jpg`: Ella Olsson / Pexels — https://www.pexels.com/photo/flat-lay-photography-of-vegetable-salad-on-plate-1640777/
- Fotografias Pexels utilizadas conforme https://www.pexels.com/license/ . São imagens ilustrativas; a modelo não é apresentada como paciente nem como depoente do Instituto.

Nenhuma fotografia foi gerada por IA. Os recortes da página são feitos por CSS.

## Atualização de data e checkout

Horário atualizado por solicitação explícita para quarta-feira, 16/09/2026, às 19h de Brasília. Contagem após a seção principal, data fixa destacada na abertura e faixa superior com movimento lento, botão de pausa e respeito à preferência de movimento reduzido. Checkout oficial ativado nos CTAs; não foi realizada compra.

# Jornada Além dos Sintomas

Landing page estática criada a partir da identidade, logotipo e foto real da Dra. Elizete presentes no ZIP fornecido. O quiz original não foi modificado.

## Antes de receber tráfego

1. Em `dist/assets/config.js`, informar o URL HTTPS exato do checkout Hubla em `checkoutUrl`. Nunca usar apenas a página inicial da plataforma. A configuração vazia mantém todos os botões em modo de prévia, sem permitir compra.
2. Confirmar o ingresso: mantido R$ 69 conforme o último alinhamento explícito do usuário. A reunião de 08/09 contém menção a R$ 69,90. Para mudar, editar `ticketPrice`; a página atualiza todas as indicações visíveis. Atualizar também os valores estáticos do HTML como fallback.
3. Confirmar dados públicos do rodapé, CRM/RQE copiados da base, data, horário e conteúdo da aula com a equipe.
4. Não divulgar como página ativa antes de conferir que o checkout é dessa oferta e que o valor coincide. Não foram feitas compras de teste.

## Publicação externa

O conteúdo de `dist/` funciona em hospedagem estática, inclusive Hostinger, preservando a estrutura de arquivos. A versão Sites serve como prévia privada; liberar uma versão pública exige configurar primeiro o checkout. A meta `noindex, nofollow` pode permanecer em uma LP de campanha; só altere se houver intenção de indexação.

## Acesso e mensuração

Os CTAs redirecionam na mesma aba ao checkout validado; preservam os parâmetros existentes do destino e repassam apenas UTMs da URL atual. Nenhuma resposta do quiz, informação clínica ou dado pessoal é coletado. Não há pixel, GTM, cookies de publicidade, envio de dados ou eventos Purchase simulados. Um evento DOM local `jornada:checkout-click` expõe apenas a posição do botão para futura integração autorizada. Qualquer mensuração publicitária adicional exige configuração própria e revisão de privacidade.

## Validação realizada

Checagens estáticas de referências locais, HTML e sintaxe JavaScript; verificação programática da lógica de checkout sem abrir o destino nem fazer pagamento. Responsividade implementada em CSS para telas pequenas, médias e grandes; não foi solicitado nem realizado teste visual no navegador.

## Conteúdo

Oferta pública: aula ao vivo, 16/09/2026 às 19h; grupo apenas para avisos/acesso. Não promete replay, consulta, amostra capilar, acompanhamento de 30 dias, resultado clínico ou parâmetros de teste. A oferta posterior está fora da LP.

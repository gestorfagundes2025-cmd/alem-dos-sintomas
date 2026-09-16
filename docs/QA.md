# Verificação da entrega

Data: 16/09/2026.

## Executado

- Build estático concluído.
- Dez testes unitários concluídos com sucesso: telefone vazio/inválido, normalização, bloqueio de protocolo injetado, encoding, nome da marca, modo de revisão e bloqueio de liberação incompleta.
- Verificação estática: um H1, IDs únicos, âncoras existentes, imagens com texto alternativo e dimensões, sem preços, sem formulário, sem tags publicitárias e sem a grafia incorreta da marca.
- Oito larguras testadas em Chromium: 320, 360, 390, 430, 768, 1024, 1280 e 1440 px. Sem rolagem horizontal, imagens carregadas e sem erros de JavaScript.
- Nove perguntas do FAQ abertas e fechadas em cada largura.
- Menu móvel: abertura, links, fechamento e estado aria-expanded.
- Modal de contato sem número: abertura, Escape, foco restaurado e ciclo de Tab dentro do diálogo.
- Troca de menu para modal de contato sem perder o foco para um elemento oculto.
- CTA móvel fica inerte e sai de cena quando o contato final ou o rodapé estão visíveis.
- Dez CTAs geram o mesmo destino quando o telefone de teste é configurado. Nenhuma mensagem foi enviada. O telefone de teste não está no site público.
- Evento local de clique verificado, sem comunicação com plataforma de publicidade.
- Preferência por movimento reduzido verificada.
- Servidor HTTP local: início, privacidade, JS, CSS, imagem e robots com status 200.

## Limitações registradas

A navegação HTTP do Chromium é restringida neste ambiente. Os testes visuais e de interação utilizaram o HTML/CSS/JS compilado em composição offline, com imagens locais e fontes de fallback. As rotas HTTP locais foram testadas separadamente. O carregamento das fontes externas, os headers servidos pela Vercel, a aparência com as fontes remotas e o comportamento em Safari/iOS reais precisam de conferência na prévia hospedada.

Não foi executada uma auditoria completa WCAG, um teste com pacientes, um experimento de conversão nem um teste de velocidade em aparelho real. Nenhuma pontuação Lighthouse ou taxa de conversão é reivindicada.

As imagens do pacote local são versões otimizadas do acervo. O primeiro build remoto usa as fontes públicas do manifesto, então pode haver pequena diferença de compressão, sem alteração intencional de conteúdo.

## Antes de campanha

Telefone oficial; validação profissional da copy/escopo; autorização e atualização dos materiais; identificação jurídica e política de privacidade completa; domínio e eventual mensuração. Os espaços de depoimentos não são conteúdo real e são removidos no build live até que sejam substituídos corretamente.

# Saúde Shalon — Revisão visual e editorial v2

## Alterações
- Hero com fotografia institucional integrada ao fundo, sem moldura/card.
- Dores e impacto na rotina antes das informações logísticas.
- Mapa visual de histórico, hábitos, possíveis exposições e funcionamento.
- Pilares Remoção, Reposição e Reabilitação com escopo de proposta, sem promessa de cura.
- Vídeo da home institucional carregado somente após ação explícita.
- Galeria de seis avaliações com fotografias reais e informações progressivas.
- Preservados: 2–3 h, 800 parâmetros presenciais, sessão inicial conforme indicação, contato aos 20 dias, retorno aos 45 dias, continuidade separada e ausência de preços.
- Sem formulário; WhatsApp centralizado ainda sem número oficial.
- Nenhuma mudança na branch main ou na LP da live.

## Fontes dos ativos
Fotos do acervo de marketing já versionadas e cinco miniaturas incorporadas do site saudeshalon.com.br. Inventário em public/reference-media.json.
A foto de atividade profissional não é um depoimento nem um atendimento médico simulado.
As nomenclaturas EIS Complex (site atual) e MultScan (manual) não foram tratadas como equipamentos comprovadamente idênticos.
Não foram copiados números, telefones, depoimentos de template ou alegações de cura do site anterior.

## Verificações
17 testes unitários e verificação estática; testes de navegador em dez larguras (320 a 1440 px), menu, modal de contato sem número, FAQ, detalhes das avaliações, presença dos assets e gate de carregamento do YouTube. O resultado real da execução está em qa/v2/report.json após a execução concluída.
As imagens e fontes podem ser conferidas nos screenshots gerados pelo runner. O teste de iframe não comprova reprodução integral nem disponibilidade futura do serviço externo.

## Publicação
Modo review continua habilitado. noindex não significa acesso privado. Validar autorização de imagens, conteúdo técnico, cadastro, dados jurídicos e WhatsApp antes da campanha.
Nenhuma melhora percentual de conversão foi medida ou alegada. Os testes tratam de implementação e experiência, não de eficácia clínica.

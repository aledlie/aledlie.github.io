---
layout: single
title: "Pegando Mentiras na Tradução por IA"
date: 2026-02-17
read_time: 5
author: Alyshia Ledlie
author_title: "Founder, Integrity Studio"
author_profile: true
excerpt: "Uma IA inventou uma história sobre a Holanda. Nosso sistema pegou na hora. Veja como mantemos as traduções automáticas honestas."
description: "Como construímos um sistema para detectar e corrigir fatos inventados em traduções geradas por IA, com resultados reais de um projeto de cliente."
keywords: ai translation quality, llm hallucination detection, translation evaluation, ai quality assurance, portuguese translation
lang: pt-BR
header:
  image: /assets/images/cover-work.png
  teaser: /assets/images/cover-work.png
toc: true
toc_sticky: true
permalink: /work/estudo-caso-qualidade-traducao-otel/
categories:
  - AI
  - Observability
tags:
  - ai-translation
  - hallucination-detection
  - opentelemetry
  - llm-evaluation
  - portuguese
schema_type: tech-article
---
<!-- Source: 2026-02-17-translation-quality-otel-case-study-8th.md | Lang: pt-BR -->

Uma IA traduziu a bio de uma artista para o português, e o resultado soou muito bem — até a gente olhar de perto.

A IA havia acrescentado esta linha:

> *"A jornada que começou na Holanda, atravessou oceanos e agora retorna ao lar"*
> ("The journey that began in the Netherlands, crossed oceans, and now returns home")

A artista nunca foi à Holanda. O texto original em inglês não diz nada sobre isso. A IA inventou tudo.

Construímos um sistema para pegar exatamente esse tipo de mentira — e em seis dias, ele reduziu a taxa de erro de 17% para zero:

```
Session        Hallucination Rate
─────────────  ──────────────────
Feb 11 (early)  ████████████████░░░░  17.2%
Feb 11 (mid)    █████████░░░░░░░░░░░   9.9%
Feb 11 (late)   ████░░░░░░░░░░░░░░░░   4.3%
Feb 14 (pre)    ██████████████░░░░░░  14.3%
Feb 14 (post)   ███░░░░░░░░░░░░░░░░░   3.2%
Feb 17 (final)  ░░░░░░░░░░░░░░░░░░░░   0.0%
```

Veja como chegamos lá.

## O Problema: Gramática Perfeita, Fatos Inventados

As antigas ferramentas de tradução eram fáceis de identificar. A gramática estava errada, as frases soavam estranhas, e você percebia na hora que algo estava fora do lugar.

A IA de hoje é diferente. A gramática é perfeita e as escolhas de palavras são naturais. Mas às vezes a IA acrescenta coisas que não estão no original — uma data que ninguém escreveu, um lugar que ninguém nomeou, ou um número que não existe.

Você não consegue ver esses problemas só de ler a tradução. Tudo soa certo. Você tem que checar cada linha contra a fonte original para encontrar o que foi acrescentado, e ninguém tem tempo de fazer isso na mão.

Então ensinamos uma segunda IA a fazer isso por nós.

## Como Pegamos as Mentiras

Nossa ferramenta lê as duas versões — o original em inglês e a tradução em português — e checa cada linha. Se algo aparece na tradução sem correspondência na fonte, é sinalizado.

Mas nem toda adição é um problema. O português é uma língua calorosa e viva. Boas traduções acrescentam frases como "Energia demais!" ou "Maravilhoso!". Isso não é mentira — é só como as pessoas falam no Brasil. Nossa ferramenta sabe a diferença entre calor acrescentado e ficção acrescentada.

Quando encontra um problema real — um fato inventado, um nome de lugar, ou uma data que não existe na fonte — ela remove o conteúdo falso, mantém o tom, e roda a verificação de novo. Continua até que tudo passe.

## O Que Realmente Aconteceu

Rodamos esse sistema em três arquivos em português que havíamos traduzido para uma companhia de dança.

**A primeira tentativa foi difícil.** Conteúdo inventado apareceu em 5 a 17 por cento da saída. Foi aí que surgiu a linha da Holanda — a IA havia aprendido fatos reais sobre grupos de dança brasileiros na Europa e depois chutou um detalhe que parecia encaixar.

**A segunda rodada melhorou.** Rastreamos o problema até os dados de treinamento da IA e construímos verificações mais focadas. A taxa de erro caiu para cerca de 3 por cento.

**A terceira rodada voltou limpa.** Os três arquivos passaram em todas as verificações com zero conteúdo inventado:

| Arquivo | Pontuação de Qualidade | Conteúdo Inventado |
|---------|:----------------------:|:------------------:|
| Perfil da artista | 99,9% | 0% |
| Análise de mercado (zouk) | 99,9% | 0% |
| Análise de mercado (Austin) | 99,9% | 0% |

Uma correção foi tudo que precisou: remover a linha da Holanda.

## Por Que Esta Mentira Era Tão Perigosa

A linha da Holanda nos diz algo importante sobre como a IA falha na tradução.

A IA não cometeu um erro de gramática. Não usou a palavra errada. Ela buscou nos seus dados de treinamento, encontrou informações reais sobre dançarinos brasileiros na Europa, e chutou um detalhe que parecia encaixar. Depois escreveu esse chute no mesmo tom confiante dos fatos reais ao redor.

O resultado soa certo, parece certo, e lê como algo que uma pessoa escreveria. Mas está completamente errado.

É isso que torna a tradução por IA arriscada para conteúdo de negócios. Os erros não parecem erros. Parecem fatos. E se você está publicando a bio de alguém, lançando um relatório de mercado, ou traduzindo conteúdo voltado para clientes, um único detalhe inventado pode danificar a confiança de formas difíceis de desfazer.

## Sabor vs. Ficção

Dez frases acrescentadas passaram nas nossas verificações de propósito:

- "Energia demais!" (So much energy!)
- "Só gente top!" (Only the best people!)
- "Maravilhoso!" (Wonderful!)
- "Incrível!" (Amazing!)
- "Gratidão!" (Gratitude!)

Essas frases não afirmam nenhum fato. Elas acrescentam calor, que é como as pessoas realmente falam no Brasil. Retirá-las tornaria a tradução plana e robótica.

A parte difícil é saber quais acréscimos são aceitáveis e quais são mentiras. "Energia demais!" acrescenta charme. "A jornada começou na Holanda" acrescenta ficção. Você precisa de um sistema inteligente o suficiente para distingui-los.

## O Que Faz Isso Funcionar em Escala

Toda vez que nossa ferramenta roda uma verificação, ela salva os resultados. Com o tempo, isso cria um histórico que você pode consultar. Isso te dá quatro coisas:

- **Pegar erros repetidos** — se uma mentira voltar em uma edição futura, a próxima verificação a sinaliza automaticamente
- **Comparar entre arquivos** — todo documento é pontuado da mesma forma
- **Identificar tendências** — ver se a qualidade está subindo ou caindo ao longo do tempo
- **Receber alertas** — saber de problemas antes que traduções ruins entrem no ar

## O Que Vem a Seguir

Três dos nossos 19 relatórios em inglês agora têm versões em português. O sistema foi construído para crescer:

- **Mais idiomas** — as verificações funcionam para qualquer par de idiomas
- **Mais arquivos** — cada execução pontua todos os arquivos que toca
- **Correspondência de voz** — uma nova ferramenta vai verificar se as traduções soam como a voz real do cliente
- **Sempre ativo** — a qualidade da tradução alimenta o mesmo sistema de rastreamento que usamos para todo o resto

A lição continua aparecendo em todo trabalho com IA: criar é a parte fácil, mas *verificar* é onde o valor real mora. Sem esse sistema, a linha da Holanda vai ao ar no site de um cliente. Com ele, você pega a mentira e mantém o "Energia demais!"

---

## Apêndice: Análise de Legibilidade (textstat)

**Nota:** As métricas a seguir foram calculadas pela biblioteca `textstat` sobre o texto original em inglês. O `textstat` não possui suporte nativo para o português brasileiro; os scores abaixo refletem a análise do texto-fonte em inglês e servem como referência comparativa, não como medida direta da legibilidade da tradução em português.

### Artigo Completo

| Métrica | Pontuação | Interpretação |
|---------|-----------|---------------|
| **Flesch Reading Ease** | 77.7 | Fairly Easy |
| **Flesch-Kincaid Grade** | 5.5 | 6th grade |
| **SMOG Index** | 8.5 | 8th grade |
| **Gunning Fog** | 7.2 | 7th grade |
| **Automated Readability Index** | 6.5 | 7th grade |
| **Dale-Chall** | 8.9 | 11th-12th grade |
| **Coleman-Liau Index** | 8.1 | 8th grade |
| **Linsear Write** | 5.2 | 5th grade |
| **Consenso** | **7th-8th grade** | Middle school |

| Estatística | Valor |
|-------------|-------|
| Contagem de palavras | 871 |
| Contagem de frases | 71 |
| Contagem de sílabas | 1.201 |
| Palavras polissílabas | 62 (7,1%) |
| Palavras difíceis | 102 (11,7%) |
| Tempo estimado de leitura | 1,0 min |

### Detalhamento por Seção

| Seção | Flesch Ease | FK Grade | Consenso |
|-------|------------|----------|----------|
| Introduction | 80.5 | 4.7 | 7th-8th |
| Good Grammar, Bad Facts | 83.7 | 5.0 | 6th-7th |
| Netherlands Analysis | 72.9 | 6.9 | 8th-9th |
| What Comes Next | 70.8 | 6.7 | 8th-9th |

### Comparação com o Rascunho Original

| Métrica | Original (11th-12th) | Esta Versão (7th-8th) | Mudança |
|---------|----------------------|-----------------------|---------|
| Flesch Reading Ease | 43.4 | 77.7 | +34 pts |
| FK Grade | 9.6 | 5.5 | -4.1 grades |
| Gunning Fog | 12.5 | 7.2 | -5.3 |
| Polysyllabic words | 23.3% | 7.1% | -16.2 pp |
| Difficult words | 24.6% | 11.7% | -12.9 pp |
| Dale-Chall | 11.1 | 8.9 | -2.2 |

**Nota**: O Dale-Chall permanece elevado (8,9, "11th-12th grade") porque o vocabulário técnico do domínio (`hallucination`, `faithfulness`, `OTEL`, `telemetry`) aparece na lista de palavras difíceis do Dale-Chall independentemente da estrutura das frases. Todas as outras métricas atingiram a meta de 8th grade ou abaixo.

### Metodologia

- Pontuações geradas pela biblioteca Python `textstat` via integração com servidor MCP
- Análise executada apenas no texto do corpo do artigo (front matter, blocos de código e marcação de tabelas excluídos)
- Os limites de seção seguem os títulos H2 na estrutura do artigo
- Escala Flesch Reading Ease: 0-29 Muito Confuso, 30-49 Difícil, 50-59 Razoavelmente Difícil, 60-69 Padrão, 70-79 Razoavelmente Fácil, 80+ Fácil

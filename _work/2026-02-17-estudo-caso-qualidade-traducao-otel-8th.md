---
layout: single
title: "Pegando Mentiras na Tradução por IA"
date: 2026-02-17
read_time: 6
author: Alyshia Ledlie
author_title: "Founder, Integrity Studio"
author_profile: true
excerpt: "Uma IA inventou uma história sobre a Holanda. Nossa telemetria pegou na hora. Veja como mantemos as traduções automáticas honestas."
description: "Um estudo de caso sobre o uso de OpenTelemetry para detectar e corrigir alucinações em traduções para o português geradas por IA, com dados reais de múltiplas sessões."
keywords: ai translation quality, opentelemetry, llm hallucination detection, translation evaluation, ai quality assurance, portuguese translation
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

Uma IA traduziu a bio de uma artista para o português, e o resultado soou muito bem — ate a gente olhar de perto.

A IA havia acrescentado esta linha:

> *"A jornada que começou na Holanda, atravessou oceanos e agora retorna ao lar"*
> ("The journey that began in the Netherlands, crossed oceans, and now returns home")

A artista nunca foi à Holanda, e o texto original em inglês não diz nada sobre isso. A IA inventou tudo do zero e continuou como se nada tivesse acontecido.

E e exatamente isso que assusta. A frase soa real e encaixa perfeitamente no tom, lendo como algo que uma pessoa escreveria. Mas e ficção, disfarçada de fato.

Construímos um sistema para pegar exatamente esse tipo de mentira. Veja como funciona.

## Gramática Perfeita, Fatos Errados

As antigas ferramentas de tradução eram fáceis de identificar porque a gramática estava errada e as frases soavam estranhas. Você percebia na hora que algo estava fora do lugar.

A IA de hoje e diferente. A gramática e perfeita, o tom e certo, e as escolhas de palavras são naturais. Mas às vezes a IA acrescenta coisas que não estão na fonte — uma data que ninguém escreveu, um lugar que ninguém nomeou, ou um numero que não existe.

Você não consegue ver o problema só de ler a tradução. Você tem que checar cada linha contra a fonte original, e ninguém tem tempo de fazer isso manualmente. Então ensinamos uma IA a fazer isso por nos.

## Como o Ciclo Funciona

Nossa ferramenta verifica as traduções em ciclo. Ela executa estas etapas em ordem:

1. **Ler os dois arquivos** — a fonte em inglês e a versão em português
2. **Checar cada linha** — procurar conteudo sem correspondência na fonte
3. **Classificar os resultados** — e um fato inventado ou apenas um tempero a mais?
4. **Corrigir os falsos** — remover o conteudo falso
5. **Pontuar o trabalho** — registrar os resultados como dados OTEL
6. **Verificar as pontuações** — passaram ou falharam?
7. **Rodar de novo** — continuar ate que todas as pontuações passem

A etapa 3 e a parte-chave, porque nem toda mudança e um problema. O português e uma lingua calorosa e viva, e boas traduções acrescentam frases como "Energia demais!". Isso não e mentira — e só uma boa tradução. Nossa ferramenta sabe a diferença entre calor acrescentado e ficção acrescentada.

## O Que e Pontuado

Cada execução registra sete pontuações por arquivo:

| Metrica | O Que Verifica | Meta |
|---------|---------------|------|
| `translation.hallucination` | Fatos inventados | <= 0.01 |
| `translation.faithfulness` | Fidelidade à fonte | >= 0.98 |
| `translation.readability_parity` | Diferença de nível de leitura | <= 2 graus |
| `translation.coherence` | Fluidez natural | >= 0.98 |
| `translation.relevance` | Nada deixado de fora | >= 0.98 |
| `translation.length_ratio` | Relação de contagem de palavras | 1.05 - 1.25 |
| `translation.quality.score` | Pontuação geral | >= 0.90 |

A pontuação geral pondera cada parte. Pegar mentiras conta mais:

```
score = (1 - hallucination) * 0.30
      + faithfulness * 0.25
      + relevance * 0.20
      + coherence * 0.15
      + readability_parity * 0.10
```

## As Pontuações ao Longo do Tempo

Rodamos essa ferramenta em três sessões. Ela verificou três arquivos em português para uma companhia de dança. Veja o que aconteceu.

### 11 de Fev: Primeira Tentativa

A primeira execução mostrou problemas imediatamente:

| Sessão | Fidelidade | Alucinação | Status |
|--------|-----------|------------|--------|
| `a75991f7` (inicio) | 0.828 | 0.172 | Alerta |
| `a75991f7` (meio) | 0.901 | 0.099 | Melhorando |
| `a75991f7` (fim) | 0.957 | 0.043 | Quase la |
| `bab0a186` | 0.906 | 0.095 | Alerta |

Mentiras apareceram em 5 a 17 por cento da saída, enquanto o sistema consumiu 1,75 milhão de tokens. Alem disso, 63 por cento do trabalho foi gasto em rastreamento de tarefas em vez da tradução real — lento demais, caro demais e arriscado demais.

### 13-14 de Fev: Encontrando o Problema

Encontramos a linha da Holanda e rastreamos sua origem nos dados de treinamento da IA. O modelo provavelmente aprendeu fatos reais sobre grupos de dança brasileiros na Europa e depois chutou detalhes que pareciam encaixar.

Construímos ferramentas novas e focadas, e as pontuações melhoraram:

| Sessão | Fidelidade | Alucinação | Contexto |
|--------|-----------|------------|----------|
| `4c6726ce` | 0.857 | 0.143 | Antes das correções |
| `b95c2314` | 0.966 | 0.034 | Apos as correções |
| `b95c2314` (re-verificação) | 0.968 | 0.032 | Confirmado |

### 17 de Fev: Aprovado em Tudo

A execução mais recente passou em todos os testes. Sessão `trans-quality-1771322194`:

| Arquivo | Qualidade | Alucinação | Fidelidade | Coerência | Relevância | Relação de Comprimento |
|---------|---------|-----------|------------|-----------|-----------|----------------------|
| `edghar_nadyne_perfil_artista.html` | 0.999 | 0.000 | 1.000 | 0.990 | 1.000 | 1.169 |
| `analise_mercado_zouk.html` | 0.999 | 0.000 | 1.000 | 0.990 | 1.000 | 1.204 |
| `analise_mercado_austin.html` | 0.999 | 0.000 | 1.000 | 0.990 | 1.000 | 1.247 |

Uma correção foi necessária: remover a linha da Holanda.

Veja a tendência completa:

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

De 17,2% para zero. Maravilhoso!

## Por Que Esta Mentira Importa

A linha da Holanda nos diz algo importante sobre como a IA falha na tradução.

A IA buscou nos seus dados de treinamento, encontrou informações reais sobre dançarinos brasileiros na Europa e chutou um detalhe que parecia encaixar. Ela escreveu esse chute com o mesmo tom confiante dos fatos verificados ao redor. O resultado soa certo e parece certo, mas e completamente errado.

E por isso que a tradução por IA e arriscada para conteudo de negocios — os erros não parecem erros. Parecem fatos. Nossa ferramenta o capturou da unica forma possível em escala: verificando cada linha da tradução contra a fonte e sinalizando qualquer coisa sem correspondência.

## Sabor vs. Ficção

Dez frases acrescentadas passaram na verificação de propósito:

- "Energia demais!" (So much energy!)
- "So gente top!" (Only the best people!)
- "Maravilhoso!" (Wonderful!)
- "Incrivel!" (Amazing!)
- "Gratidao!" (Gratitude!)

Essas frases não afirmam nenhum fato — elas apenas acrescentam calor, que e como as pessoas realmente falam no Brasil. Retira-las tornaria a tradução plana e sem vida.

A parte difícil e saber quais acrescimos são aceitáveis e quais são mentiras. "Energia demais!" acrescenta charme, enquanto "A jornada começou na Holanda" acrescenta ficção. Você precisa de uma ferramenta inteligente o suficiente para distingui-las — e e exatamente isso que a etapa de classificação oferece.

## Como o OTEL Une Tudo

Cada verificação grava um registro neste formato:

```json
{
  "timestamp": "2026-02-17T09:56:34.000Z",
  "name": "gen_ai.evaluation.result",
  "attributes": {
    "gen_ai.evaluation.name": "translation.hallucination",
    "gen_ai.evaluation.score.value": 0.000,
    "gen_ai.evaluation.evaluator": "translation-improvement",
    "gen_ai.evaluation.evaluator.type": "llm",
    "gen_ai.agent.name": "translation-improvement",
    "gen_ai.evaluation.file": "edghar_nadyne_perfil_artista.html",
    "session.id": "trans-quality-1771322194"
  }
}
```

Esses registros vão para arquivos de log diarios que você pode pesquisar entre sessões, arquivos e tipos de pontuação. Essa estrutura oferece quatro capacidades importantes:

- **Capturar erros repetidos** — se uma mentira voltar em uma edição futura, a próxima execução a sinaliza automaticamente
- **Comparar arquivos** — as pontuações funcionam da mesma forma em todos os documentos e idiomas
- **Identificar tendências** — ver se a qualidade está subindo ou caindo ao longo do tempo
- **Definir alertas** — ser avisado antes que traduções ruins entrem no seu site

## O Que Vem a Seguir

Tres dos 19 relatórios em inglês agora têm versões em português (15,8%). O sistema foi construído para crescer:

- **Mais idiomas**: A pontuação funciona para qualquer idioma, pois apenas o alvo de relação de contagem de palavras muda entre eles.
- **Mais arquivos**: Cada execução pontua automaticamente todos os arquivos que toca durante a sessão.
- **Correspondência de voz**: Uma nova ferramenta verificará se as traduções soam como a voz real do cliente, com meta de atingir uma pontuação de correspondência de 0,85.
- **Sempre ativo**: As pontuações de tradução alimentam o mesmo sistema de rastreamento que todas as nossas outras ferramentas de desenvolvimento.

A lição continua aparecendo em todo trabalho com IA: criar e a parte facil, mas *verificar* e onde o valor real mora. Sem esse sistema, a linha da Holanda vai ao ar no site de um cliente. Com ele, você pega a mentira e mantem o "Energia demais!"

---

*Sistemas de IA podem parecer que funcionam enquanto escondem erros que você não consegue ver. Na [Integrity Studio](https://integritystudio.ai), construímos ferramentas que tornam a qualidade visível. Se sua saída de IA parece certa mas você não consegue provar, [e aqui que começamos](https://integritystudio.ai/contact).*

---

## Apêndice: Analise de Legibilidade (textstat)

**Nota:** As metricas a seguir foram calculadas pela biblioteca `textstat` sobre o texto original em inglês. O `textstat` não possui suporte nativo para o português brasileiro; os scores abaixo refletem a analise do texto-fonte em inglês e servem como referência comparativa, não como medida direta da legibilidade da tradução em português.

### Artigo Completo

| Metrica | Pontuação | Interpretação |
|---------|---------|--------------|
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
|------------|-------|
| Contagem de palavras | 871 |
| Contagem de frases | 71 |
| Contagem de sílabas | 1.201 |
| Palavras polissílabas | 62 (7,1%) |
| Palavras difíceis | 102 (11,7%) |
| Tempo estimado de leitura | 1,0 min |

### Detalhamento por Seção

| Seção | Flesch Ease | FK Grade | Consenso |
|-------|-----------|----------|---------|
| Introduction | 80.5 | 4.7 | 7th-8th |
| Good Grammar, Bad Facts | 83.7 | 5.0 | 6th-7th |
| Netherlands Analysis | 72.9 | 6.9 | 8th-9th |
| What Comes Next | 70.8 | 6.7 | 8th-9th |

### Comparação com o Rascunho Original

| Metrica | Original (11th-12th) | Esta Versão (7th-8th) | Mudança |
|---------|----------------------|-----------------------|---------|
| Flesch Reading Ease | 43.4 | 77.7 | +34 pts |
| FK Grade | 9.6 | 5.5 | -4.1 grades |
| Gunning Fog | 12.5 | 7.2 | -5.3 |
| Polysyllabic words | 23.3% | 7.1% | -16.2 pp |
| Difficult words | 24.6% | 11.7% | -12.9 pp |
| Dale-Chall | 11.1 | 8.9 | -2.2 |

**Nota**: O Dale-Chall permanece elevado (8,9, "11th-12th grade") porque o vocabulário tecnico do domínio (`hallucination`, `faithfulness`, `OTEL`, `telemetry`) aparece na lista de palavras difíceis do Dale-Chall independentemente da estrutura das frases. Todas as outras metricas atingiram a meta de 8th grade ou abaixo.

### Metodologia

- Pontuações geradas pela biblioteca Python `textstat` via integração com servidor MCP
- Analise executada apenas no texto do corpo do artigo (front matter, blocos de codigo e marcação de tabelas excluídos)
- Os limites de seção seguem os títulos H2 na estrutura do artigo
- Escala Flesch Reading Ease: 0-29 Muito Confuso, 30-49 Difícil, 50-59 Razoavelmente Difícil, 60-69 Padrão, 70-79 Razoavelmente Facil, 80+ Facil

### Qualidade da Tradução PT-BR

Pontuações de qualidade desta tradução, avaliadas pelo agente `translation-improvement`:

| Metrica | Pontuação | Meta | Status |
|---------|---------|------|--------|
| `translation.hallucination` | 0.000 | <= 0.01 | Pass |
| `translation.faithfulness` | 1.000 | >= 0.98 | Pass |
| `translation.coherence` | 0.980 | >= 0.98 | Pass |
| `translation.relevance` | 1.000 | >= 0.98 | Pass |
| `translation.length_ratio` | 1.079 | 1.05 - 1.25 | Pass |
| `translation.quality.score` | 0.997 | >= 0.90 | Pass |

**Formula composta:**

```
score = (1 - 0.000) * 0.30  // hallucination
      + 1.000 * 0.25        // faithfulness
      + 1.000 * 0.20        // relevance
      + 0.980 * 0.15        // coherence
      + 1.000 * 0.10        // readability_parity
      = 0.997
```

- Avaliador: `translation-improvement` (LLM-as-Judge)
- Uma correção aplicada: "escola de dança" → "companhia de dança" (fidelidade à fonte)
- Um acrescimo coloquial: "Maravilhoso!" apos a linha de tendência 17,2% → 0% (tom apenas, sem conteudo factual)

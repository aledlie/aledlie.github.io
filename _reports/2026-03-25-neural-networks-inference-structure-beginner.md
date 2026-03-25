---
layout: single
title: "What Neural Networks Do After Training: A 10-Year-Old's Guide (Inference & Structure)"
date: 2026-03-25
permalink: /reports/neural-networks-inference-structure-beginner/
author_profile: true
categories: [ai-education, neural-networks, pedagogy]
tags: [inference, prediction, structure, how-they-work, beginner-friendly]
excerpt: "A beginner-friendly explanation of what neural networks do with new data after training. Covers inference, internal structure, decision-making, and why we use them. Complements the training explainer."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Session Date**: 2026-03-25
**Project**: Neural Networks Education
**Focus**: Inference, structure, and use cases
**Target Audience**: 10-year-olds or anyone new to ML
**Content Type**: Pedagogical explainer with analogies

---

## ⚠️ Important: This is a Follow-Up Document

**Prerequisite Reading**: Start with ["How Neural Networks Are Trained"](/reports/neural-networks-training-explainer-beginner/) first.

That document explained: **How neural networks learn from examples.**

**This document explains**: **What happens after they're trained — how they use what they learned.**

---

## What Happens After Training is Done?

Remember how we showed the network thousands of cat and dog pictures? It learned patterns and got better and better.

**But what happens now that it's trained?**

It's not learning anymore. It's done learning. Now it's ready to actually DO something with what it learned.

### The Big Transition

```
TRAINING PHASE (what the previous document covered)
   ↓
   See examples → Make guesses → Get feedback → Improve
   REPEAT thousands of times
   ↓
NETWORK IS NOW TRAINED
   ↓
INFERENCE PHASE (what THIS document covers)
   ↓
   Get a new picture → Make ONE guess → Done!
   (No more feedback, no more learning)
```

Think of it like a soccer player:
- **Training phase**: Practice hundreds of times, get coached, improve your kicks
- **Game phase**: Play the actual game using what you learned

The game phase is **inference** — using what you learned.

---

## Inference: Using a Trained Network

### What Does "Using a Neural Network" Mean?

Once the network is trained, you can give it NEW pictures it's never seen before. It looks at each new picture once and makes a prediction.

**Example**:
```
You show the trained network a picture of a cat it's NEVER SEEN.
   ↓
The network looks at the picture.
   ↓
Based on everything it learned from the 10,000 training pictures,
it says: "This is a CAT!"
   ↓
Done. One prediction. No feedback needed.
```

### The Key Difference: Training vs. Using

| Phase | What Happens | Time | Feedback | Learning |
|-------|-------------|------|----------|----------|
| **Training** | See 10,000 examples, get feedback, improve | Hours or days | Yes, constant | **YES — it changes** |
| **Inference** | See 1 new picture, make a guess | Milliseconds | No feedback given | **NO — it stays the same** |

**Important**: Once training is done, the network NEVER changes again. It's frozen. All the lessons it learned are locked in.

---

## What's Actually Inside a Neural Network?

Remember we talked about "helpers" in the middle? Let's look more carefully at what's really there.

### The Building Blocks: Neurons

A **neuron** is a tiny decision-maker inside the network.

Each neuron has:
- **Inputs**: Things it listens to
- **A weight**: How much it cares about each input
- **Bias**: Its "default opinion"
- **Output**: What it says based on its inputs

### Simple Example: One Neuron

```
Imagine a neuron that's learning "Is this food delicious?"

Its inputs:
  - How sweet is it? (weight: 5)  ← Cares a LOT
  - How crunchy? (weight: 3)     ← Cares medium
  - How warm? (weight: 1)        ← Doesn't care much

For a chocolate cake:
  - Sweet: 9   (9 × 5 = 45 points)
  - Crunchy: 2 (2 × 3 = 6 points)
  - Warm: 8    (8 × 1 = 8 points)
  - Total: 59 points → "DELICIOUS!"

For a carrot:
  - Sweet: 3   (3 × 5 = 15 points)
  - Crunchy: 9 (9 × 3 = 27 points)
  - Warm: 2    (2 × 1 = 2 points)
  - Total: 44 points → "Pretty good!"
```

**The weights changed during training.** The network learned: "Sweetness matters MORE for food being delicious."

### Many Neurons Working Together

A real neural network has THOUSANDS or MILLIONS of neurons, organized in layers:

```
INPUT LAYER
(The raw data)
   cat picture
       ↓ ↓ ↓
HIDDEN LAYERS
(Helpers making sense of the data)
 Layer 1: Detects edges and colors
 Layer 2: Detects ears, whiskers, eyes
 Layer 3: Combines features into patterns
   "pointy ears" + "whiskers" + "fur"
       ↓
OUTPUT LAYER
(Final answer)
   "This is a CAT!"
```

### How the Layers Work Together

Each layer is like a relay race:

```
Layer 1 (Edges): "I see pointy triangular shapes"
   ↓
Layer 2 (Shapes): "Those triangles are EAR-SHAPED!"
   ↓
Layer 3 (Patterns): "Ears + whiskers + soft fur = CAT pattern"
   ↓
Layer 4 (Answer): "DEFINITELY A CAT!"
```

Each neuron passes its answer to the next layer. The next layer uses that information to make a smarter decision.

---

## How Does It Make a Decision?

### For a Cat Picture (After Training)

```
Step 1: Raw input
"Here's a picture of a cat"
   ↓
Step 2: Layer 1 processes edges
Neurons ask: "What shapes do I see?"
Answer: "Triangles, curves, lines"
   ↓
Step 3: Layer 2 processes features
Neurons ask: "What are these shapes?"
Answer: "Pointy ears! Whiskers! Eyes!"
   ↓
Step 4: Layer 3 processes patterns
Neurons ask: "What patterns do these features make?"
Answer: "This pattern is CAT-LIKE"
   ↓
Step 5: Output layer decides
Neurons ask: "Is this a CAT or a DOG?"
Answer: "99% confident — CAT!"
   ↓
Final answer: "CAT"
```

### For a Dog Picture (After Training)

```
The same network sees a dog picture...
   ↓
Layer 1: "Triangles, curves..."
   ↓
Layer 2: "Pointy ears, but... longer snout..."
   ↓
Layer 3: "These features match DOG patterns better"
   ↓
Output: "72% confident — DOG!"
   ↓
Final answer: "DOG"
```

**Note**: The network doesn't always say "100% sure." Sometimes it says "I'm 75% sure it's a cat, 25% sure it's something else."

---

## Why Use Neural Networks Instead of Other Tools?

There are many ways to solve problems. Why choose neural networks?

### Case 1: Recognizing Faces in Photos

**Other tools don't work well**:
- ✗ Rules like "if eyes are close together, it's a person" fail because people look different
- ✗ Pre-programmed instructions can't cover all the variations

**Neural networks work**:
- ✓ Learn from thousands of examples
- ✓ Find patterns humans didn't even think of
- ✓ Handle variations (different angles, lighting, expressions)

### Case 2: Understanding Language

When you type "I like ice cream," how does the computer know you like ice cream?

**Other tools don't work**:
- ✗ Just looking for the word "like" fails (what about "I don't like ice cream"?)
- ✗ Rules get complicated and fragile

**Neural networks work**:
- ✓ Learn the CONTEXT (the words around it matter)
- ✓ Understand negative words and emotion
- ✓ Figure out what matters in the sentence

### Case 3: Finding Fraud in Credit Cards

Banks need to stop fraudulent transactions. Should they use rules?

**Rules approach is brittle**:
- ✗ "Block purchases over $1000" — but your mom just bought a plane ticket for $800
- ✗ "Block purchases at 3 AM" — but you're traveling in another country
- ✗ More rules = more false alarms

**Neural networks are flexible**:
- ✓ Learn patterns from millions of real vs. fake transactions
- ✓ Understand combinations of factors (amount + location + time + person's history)
- ✓ Reduce false alarms while catching real fraud

### When NOT to Use Neural Networks

Neural networks are powerful but not always best:

**❌ Don't use when**:
- You have simple rules (e.g., "if price > $100, charge tax")
- You need to explain WHY (neural networks are black boxes)
- You have very little data (they need examples to learn from)
- Speed matters and you can't afford computation time
- Mistakes are unacceptable (surgery, airplane controls)

**✓ Use when**:
- Patterns are too complex to write rules for
- You have lots of examples to learn from
- Slight mistakes are okay (recommendation systems, content filtering)
- You need to handle variations and exceptions automatically

---

## The Network's Confidence

### Probability, Not Certainty

Trained networks don't say "this IS a cat." They say "this is 95% likely a cat."

```
Picture of fluffy animal
   ↓
Output layer calculates:
  - 95% CAT
  - 4% RABBIT
  - 1% OTHER
```

### Why Not 100%?

Because the picture is AMBIGUOUS. It has fluffy fur, pointy ears... could be a cat or a small fox.

The network learned: "This combination of features usually means CAT, but not always."

---

## How Fast is Inference?

Once the network is trained, making predictions is VERY FAST.

| Task | Speed |
|------|-------|
| Training a network | Hours, days, or weeks |
| Using a trained network (inference) | Milliseconds |

**Example**: You take a selfie. The phone recognizes your face in less than 100 milliseconds. That's faster than you can blink!

---

## Summary: Before vs. After Training

### Before Training
```
Network = Empty-headed helper
Question: "Is this a cat?"
Answer: "I dunno, I haven't learned anything yet"
```

### After Training
```
Network = Experienced helper with 10,000 examples in memory
Question: "Is this a cat?"
Answer: "I've seen 10,000 cat pictures. This looks like #7,234.
         I'm 97% confident it's a CAT!"
```

### The Two Phases

```
TRAINING (Slow, Happens Once)
- Network sees examples
- Network makes mistakes
- Network learns from mistakes
- Network improves
- Takes hours/days

↓↓↓ TRAINING COMPLETE ↓↓↓

INFERENCE (Fast, Happens Every Time You Use It)
- Someone shows the network a new picture
- Network makes ONE prediction
- Done in milliseconds
- Network DOES NOT CHANGE
```

---

## Connecting to the Training Explanation

The previous document explained: **"How neural networks learn from mistakes and improve."**

This document explained:
- **"What the trained network actually does"**
- **"How the parts inside work together"**
- **"Why we use them instead of writing rules"**

Together, they give you the full picture: how they're created AND how they're used.

---

## Key Takeaway

A neural network is like a student:

1. **During school (training)**: The student learns by reading books, doing homework, getting feedback from teachers
2. **At the job (inference)**: The student uses everything they learned to solve problems at work

They're not learning anymore—they're USING what they learned.

---

## Scope Note for Educators

If you're teaching this to someone:
- ✓ Explain that training and inference are DIFFERENT phases
- ✓ Use analogies about skills (sports, cooking, music) where you practice then perform
- ✓ Show that inference is FAST (unlike training)
- ✓ Explain that confidence is probabilistic, not binary
- ✓ Show examples of where neural networks are useful
- ⚠️ Avoid details about activation functions, backpropagation, or mathematical details
- ⚠️ Don't overexplain the neuron details—the analogy is more important than accuracy

---

**Related Document**: ["How Neural Networks Are Trained"](/reports/neural-networks-training-explainer-beginner/) — read this first if you haven't already.

**Key Takeaway**: A neural network is trained by showing it examples and letting it learn from mistakes. After it's trained, it uses what it learned to make fast predictions on new data—and it never learns or changes again.

---

*Complements neural-networks-training-explainer-beginner.md. Focuses on inference, internal structure, decision-making, and use cases at the beginner level.*

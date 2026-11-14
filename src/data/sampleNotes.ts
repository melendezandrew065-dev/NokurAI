/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Deck } from '../types';

export const SAMPLE_LECTURE_NOTES = [
  {
    title: 'Cognitive Science: The Spaced Repetition & Memory Consolidation Lecture',
    subject: 'Cognitive Science',
    fileName: 'Cognitive_Science_Lec4_Memory_Consolidation.pdf',
    text: `LECTURE 4: NEUROBIOLOGY OF LEARNING, EBBINGHAUS FORGETTING CURVE, AND SPACED RETRIEVAL

I. The Architecture of Long-Term Potentiation (LTP)
Memory formation begins at the synapse. When high-frequency stimulation occurs between pre- and post-synaptic neurons, NMDA receptors are activated following AMPA receptor depolarization. This triggers calcium influx, activating CaMKII and leading to long-term synaptic strengthening (LTP). Synaptic plasticity is the molecular foundation of memory consolidation.

II. Ebbinghaus Forgetting Curve and Spacing Effect
Hermann Ebbinghaus demonstrated that humans lose up to 50% of newly learned information within 24 hours, and up to 70% within 48 hours without active recall. However, introducing spaced intervals shifts the decay curve. Each subsequent retrieval flattens the forgetting slope, transforming fragile short-term synaptic traces into resilient neocortical representations.

III. SuperMemo SM-2 Algorithmic Dynamics
The SM-2 algorithm quantifies retention through interval calculations:
1. Intervals I(n): I(1) = 1 day, I(2) = 6 days, I(n) = I(n-1) * EF.
2. Ease Factor (EF): Starts at 2.5 (minimum 1.3). Modified dynamically based on recall quality (0-5 scale).
3. The "Testing Effect" (Roediger & Karpicke, 2006): Active retrieval produces substantially higher retention gains than passive re-reading.

IV. Sleep-Dependent Systems Consolidation
During slow-wave sleep (NREM stage 3), sharp-wave ripples in the hippocampus reactivate memory traces, transferring information to the prefrontal cortex. Without adequate sleep, synaptic downscaling and systems consolidation are severely impaired.`,
  },
  {
    title: 'Computer Science: Distributed Consensus & Raft Protocol',
    subject: 'Computer Science',
    fileName: 'CS340_Distributed_Consensus_Raft.pdf',
    text: `LECTURE 9: DISTRIBUTED SYSTEMS - FAULT TOLERANCE AND RAFT CONSENSUS

1. The Consensus Problem in Asynchronous Networks
In a distributed cluster, nodes must agree on state machine transitions despite network partitions, packet loss, and node crashes. The Paxos algorithm proved this was solvable, but was notoriously difficult to understand and implement correctly. Ongaro and Ousterhout designed Raft to provide equivalent safety while decomposing consensus into understandable subproblems: Leader Election, Log Replication, and Safety.

2. State Machine Replication & Node Roles
At any time, a Raft node resides in one of three states:
- Follower: Passive, responds to incoming RPCs from leaders and candidates.
- Candidate: Nominated to become leader during election timeout.
- Leader: Manages client requests, appends log entries, coordinates AppendEntries RPC heartbeats.

3. Leader Election Mechanism
If a follower receives no heartbeat within a randomized election timeout (typically 150ms-300ms), it transitions to Candidate, increments currentTerm, votes for itself, and broadcasts RequestVote RPCs. A candidate wins if it receives votes from a majority of servers. Split votes are avoided through randomized election timers.

4. Log Matching Invariant and Commit Rule
If two logs contain an entry with the same index and term, they are identical up to that point. A log entry is committed once replicated across a strict majority (quorum: n/2 + 1). Only committed entries are executed on the state machine.`,
  },
  {
    title: 'Biochemistry: Cellular Respiration & Electron Transport Chain',
    subject: 'Biochemistry',
    fileName: 'BIO201_Cellular_Respiration_Mitochondria.pdf',
    text: `LECTURE 12: BIOENERGETICS - MITOCHONDRIAL CHEMIOSMOSIS AND ATP SYNTHASE

Overview:
Cellular respiration transforms glucose into usable chemical energy through glycolysis, the pyruvate dehydrogenase complex, the citric acid cycle (Krebs), and oxidative phosphorylation.

The Chemiosmotic Hypothesis (Peter Mitchell, 1961):
Energy released by electrons cascading through Complexes I, III, and IV drives proton (H+) pumping from the mitochondrial matrix across the inner membrane into the intermembrane space. This creates an electrochemical gradient:
- Electrical gradient (membrane potential ΔΨ ≈ -160 mV)
- Chemical pH gradient (intermembrane space is ~0.8 pH units more acidic than matrix)

Complexes of the Respiratory Chain:
- Complex I (NADH-Q oxidoreductase): Translocates 4 H+ per NADH oxidized.
- Complex II (Succinate-Q reductase): Contains FAD; transfers electrons to ubiquinone (Q) without pumping protons.
- Complex III (Q-cytochrome c oxidoreductase): Translocates 4 H+ via Q-cycle.
- Complex IV (Cytochrome c oxidase): Reduces molecular O2 to 2 H2O and pumps 2 H+.

ATP Synthase (F0F1 complex):
The proton motive force drives proton flux through the F0 rotor subunit embedded in the inner membrane, causing mechanical rotation of the central stalk (gamma subunit). The gamma subunit conformational changes induce catalytic synthesis of ATP from ADP and Pi at the F1 head. Net theoretical yield is ~30-32 ATP per glucose molecule.`,
  },
];

export const INITIAL_SEEDED_DECKS: Deck[] = [
  {
    id: 'deck-sample-1',
    title: 'Cognitive Science: Spaced Repetition & Long-Term Potentiation',
    subject: 'Cognitive Science',
    description: 'Master synaptic plasticity, the forgetting curve, and algorithmic spacing for lifelong retention.',
    coverImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=900&auto=format&fit=crop&q=80',
    sourceType: 'sample',
    sourceFileName: 'Cognitive_Science_Lec4_Memory_Consolidation.pdf',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
    isEncrypted: true,
    topicSteps: [
      {
        stepNumber: 1,
        title: 'Synaptic Plasticity & Long-Term Potentiation (LTP)',
        summary: 'Explore how repeated stimulation depolarizes post-synaptic neurons, dislodging magnesium ions from NMDA receptors to enable calcium influx and CaMKII activation.',
        coreConcepts: ['NMDA Receptors', 'AMPA Depolarization', 'Calcium Influx', 'CaMKII Kinase', 'Synaptic Strength'],
        checkpointQuestion: 'What ion blocks the channel pore of the NMDA receptor at resting membrane potential?',
        checkpointAnswer: 'Magnesium ion (Mg2+), which is expelled upon membrane depolarization by AMPA receptors.',
        imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80',
        isCompleted: true,
      },
      {
        stepNumber: 2,
        title: 'The Ebbinghaus Forgetting Curve & Decay Kinetics',
        summary: 'Understand the mathematical decay of memory over time and how spaced active recall interrupts forgetting and flattens the retention decay curve.',
        coreConcepts: ['Exponential Decay', 'Active Recall', 'Spacing Effect', 'Consolidation Intervals'],
        checkpointQuestion: 'Approximately what percentage of newly learned material is lost within 48 hours without review?',
        checkpointAnswer: 'Approximately 70% of material is forgotten within 48 hours according to Ebbinghaus.',
        imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=80',
        isCompleted: true,
      },
      {
        stepNumber: 3,
        title: 'Algorithmic Spaced Repetition (SuperMemo SM-2)',
        summary: 'Deep dive into the formula that powers modern flashcard learning: interval multiplication, dynamic Ease Factors, and quality ratings from 0 to 5.',
        coreConcepts: ['Ease Factor (EF)', 'Interval Multiplication', 'Quality Scores (0-5)', 'Desired Retention Rate'],
        checkpointQuestion: 'What is the standard starting Ease Factor and the absolute minimum allowable floor in SM-2?',
        checkpointAnswer: 'Standard starting EF is 2.5, and the absolute minimum floor is 1.3.',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
        isCompleted: false,
      },
      {
        stepNumber: 4,
        title: 'Sleep-Dependent Systems Consolidation',
        summary: 'Examine how slow-wave sleep Sharp-Wave Ripples transfer episodic memory traces from temporary hippocampal storage to neocortical integration networks.',
        coreConcepts: ['Slow-Wave Sleep', 'Sharp-Wave Ripples', 'Hippocampal-Neocortical Transfer', 'Synaptic Homeostasis'],
        checkpointQuestion: 'During which stage of sleep do sharp-wave ripples primarily facilitate hippocampal-to-cortex memory consolidation?',
        checkpointAnswer: 'Slow-Wave Sleep (NREM Stage 3).',
        imageUrl: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=800&auto=format&fit=crop&q=80',
        isCompleted: false,
      },
    ],
    cards: [
      {
        id: 'card-1-1',
        deckId: 'deck-sample-1',
        question: 'What is the molecular mechanism that unblocks the NMDA receptor channel to trigger Long-Term Potentiation?',
        answer: 'Depolarization of the postsynaptic membrane (primarily via sodium influx through AMPA receptors) expels the magnesium (Mg2+) ion that electrostatically blocks the NMDA channel pore, allowing Ca2+ influx.',
        hint: 'Think of an ion that acts as an electrostatic plug at resting potential.',
        imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80',
        imageCaption: 'Postsynaptic NMDA & AMPA Receptor Channel Influx Diagram',
        subject: 'Cognitive Science',
        topic: 'Synaptic Plasticity',
        difficulty: 'Intermediate',
        keyFormulaOrConcept: 'AMPA Depolarization -> Mg2+ Expulsion -> Ca2+ Influx via NMDA -> CaMKII activation',
        repetitions: 2,
        interval: 6,
        easeFactor: 2.5,
        lastReviewDate: Date.now() - 86400000,
        nextReviewDate: Date.now() - 3600000, // Due for review now!
        history: [{ date: Date.now() - 86400000, quality: 4, interval: 6, easeFactor: 2.5 }],
        createdAt: Date.now() - 86400000 * 2,
      },
      {
        id: 'card-1-2',
        deckId: 'deck-sample-1',
        question: 'In the SuperMemo SM-2 algorithm, how does a review quality score of 2 affect subsequent repetition and interval schedules?',
        answer: 'Any quality rating below 3 (0, 1, or 2) is considered a failed retrieval. The repetition count resets to 0 and the interval resets to 1 day, while the Ease Factor decreases.',
        hint: 'Scores below 3 are treated as incomplete or failed recall.',
        subject: 'Cognitive Science',
        topic: 'SM-2 Algorithm',
        difficulty: 'Beginner',
        keyFormulaOrConcept: 'If q < 3: Repetitions = 0, Interval = 1 day',
        repetitions: 1,
        interval: 1,
        easeFactor: 2.36,
        lastReviewDate: Date.now() - 86400000 * 2,
        nextReviewDate: Date.now() - 86400000, // Due!
        history: [{ date: Date.now() - 86400000 * 2, quality: 2, interval: 1, easeFactor: 2.36 }],
        createdAt: Date.now() - 86400000 * 2,
      },
      {
        id: 'card-1-3',
        deckId: 'deck-sample-1',
        question: 'What is the "Testing Effect" (retrieval practice) as validated by Roediger & Karpicke (2006)?',
        answer: 'Actively retrieving information from memory produces stronger and more durable retention over long retention intervals compared to spending equivalent or greater time passively re-reading or re-studying notes.',
        hint: 'Compare active testing vs passive highlighting.',
        subject: 'Cognitive Science',
        topic: 'Retrieval Practice',
        difficulty: 'Beginner',
        keyFormulaOrConcept: 'Active Recall > Passive Re-reading for Long-term Retention',
        repetitions: 3,
        interval: 15,
        easeFactor: 2.6,
        lastReviewDate: Date.now() - 86400000 * 3,
        nextReviewDate: Date.now() + 86400000 * 12,
        history: [{ date: Date.now() - 86400000 * 3, quality: 5, interval: 15, easeFactor: 2.6 }],
        createdAt: Date.now() - 86400000 * 3,
      },
      {
        id: 'card-1-4',
        deckId: 'deck-sample-1',
        question: 'What neurobiological role do hippocampal Sharp-Wave Ripples (SWRs) play in systems consolidation during sleep?',
        answer: 'SWRs occur during slow-wave sleep to replay neuronal firing sequences established during learning at accelerated speeds, driving coordinated plasticity in neocortical networks for permanent storage.',
        hint: 'Occurs primarily in NREM stage 3.',
        subject: 'Cognitive Science',
        topic: 'Sleep & Memory',
        difficulty: 'Advanced',
        keyFormulaOrConcept: 'Hippocampus (temporary cache) -> Neocortex (long-term archive) via SWRs',
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: Date.now() - 1000, // Due!
        history: [],
        createdAt: Date.now() - 86400000,
      },
    ],
  },
  {
    id: 'deck-sample-2',
    title: 'Distributed Systems: Raft Consensus & State Machine Replication',
    subject: 'Computer Science',
    description: 'Understand leader election, quorum consensus, log matching invariants, and split-brain prevention.',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&auto=format&fit=crop&q=80',
    sourceType: 'sample',
    sourceFileName: 'CS340_Distributed_Consensus_Raft.pdf',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 2,
    isEncrypted: true,
    topicSteps: [
      {
        stepNumber: 1,
        title: 'The Consensus Problem & State Machine Replication',
        summary: 'Why distributed nodes must agree on identical sequence of actions despite network failures, partitions, and delays.',
        coreConcepts: ['Deterministic State Machine', 'Log Replication', 'Crash-Fault Tolerance', 'Network Asynchrony'],
        checkpointQuestion: 'What guarantees that all replicas end up in the exact same state?',
        checkpointAnswer: 'Executing identical log entries in the exact same chronological sequence across deterministic state machines.',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        isCompleted: true,
      },
      {
        stepNumber: 2,
        title: 'Node Roles & Randomized Leader Election',
        summary: 'Followers transition to Candidates upon election timeouts and broadcast RequestVote RPCs to gather majority quorum.',
        coreConcepts: ['Follower', 'Candidate', 'Leader', 'Randomized Heartbeat Timeout', 'Quorum (n/2 + 1)'],
        checkpointQuestion: 'Why are election timeouts randomized between 150ms and 300ms?',
        checkpointAnswer: 'To prevent split votes where multiple candidates simultaneously trigger elections and split the quorum.',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        isCompleted: false,
      },
      {
        stepNumber: 3,
        title: 'Log Matching Property & Commit Safety Rule',
        summary: 'How Raft maintains safety: a log entry is only committed once stored on a majority of cluster nodes.',
        coreConcepts: ['AppendEntries RPC', 'Log Consistency Check', 'Majority Commit', 'State Machine Invariant'],
        checkpointQuestion: 'What must a candidate prove about its log to win an election from another node?',
        checkpointAnswer: 'Its log must be at least as up-to-date as the voter’s log (evaluated by higher term, then longer log index).',
        imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        isCompleted: false,
      },
    ],
    cards: [
      {
        id: 'card-2-1',
        deckId: 'deck-sample-2',
        question: 'What is the quorum formula required for a Raft cluster of N nodes to achieve leader election or log commitment?',
        answer: 'A strict majority is required: ⌊N / 2⌋ + 1. For example, in a 5-node cluster, a quorum is at least 3 nodes.',
        hint: 'Think of strict majority rule.',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        imageCaption: 'Distributed Consensus Quorum Diagram (N=5, Majority=3)',
        subject: 'Computer Science',
        topic: 'Quorum Consensus',
        difficulty: 'Beginner',
        keyFormulaOrConcept: 'Quorum = floor(N / 2) + 1',
        repetitions: 2,
        interval: 6,
        easeFactor: 2.5,
        lastReviewDate: Date.now() - 86400000,
        nextReviewDate: Date.now() - 10000,
        history: [{ date: Date.now() - 86400000, quality: 4, interval: 6, easeFactor: 2.5 }],
        createdAt: Date.now() - 86400000 * 3,
      },
      {
        id: 'card-2-2',
        deckId: 'deck-sample-2',
        question: 'How does Raft guarantee that a follower never accepts an AppendEntries RPC that creates gaps in the replicated log?',
        answer: 'The Leader includes prevLogIndex and prevLogTerm in every AppendEntries RPC. If the follower does not find a matching entry at prevLogIndex with prevLogTerm, it rejects the request, prompting the leader to decrement nextIndex and retry.',
        hint: 'Checks preceding index and term before appending.',
        imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        imageCaption: 'Raft Log Matching & Consistency Invariant Check',
        subject: 'Computer Science',
        topic: 'Log Matching Invariant',
        difficulty: 'Advanced',
        keyFormulaOrConcept: 'Log Matching Invariant: identical index & term implies identical prefix',
        repetitions: 1,
        interval: 1,
        easeFactor: 2.5,
        nextReviewDate: Date.now() - 2000,
        history: [],
        createdAt: Date.now() - 86400000 * 2,
      },
    ],
  },
  {
    id: 'deck-sample-3',
    title: 'Biochemistry: Cellular Respiration & ATP Chemiosmosis',
    subject: 'Biochemistry',
    description: 'Understand electron transport chain complexes, the proton motive force, and rotary ATP synthase mechanics.',
    coverImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=900&auto=format&fit=crop&q=80',
    sourceType: 'sample',
    sourceFileName: 'BIO201_Cellular_Respiration_Mitochondria.pdf',
    createdAt: Date.now() - 86400000 * 1.5,
    updatedAt: Date.now() - 86400000 * 0.5,
    isEncrypted: false,
    topicSteps: [
      {
        stepNumber: 1,
        title: 'Electron Transport Chain (ETC) Complexes',
        summary: 'Electrons from NADH and FADH2 are transferred sequentially through Complexes I, II, III, and IV, pumping protons across the inner mitochondrial membrane into the intermembrane space.',
        coreConcepts: ['Complex I (NADH-Q oxidoreductase)', 'Ubiquinone (Q)', 'Complex III Q-cycle', 'Cytochrome c', 'Complex IV reduction to H2O'],
        checkpointQuestion: 'Which respiratory complex oxidizes FADH2 without pumping protons across the membrane?',
        checkpointAnswer: 'Complex II (Succinate-Q reductase) contains FAD and transfers electrons directly to ubiquinone without pumping protons.',
        imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
        isCompleted: true,
      },
      {
        stepNumber: 2,
        title: 'Mitchell Chemiosmotic Hypothesis & Proton Motive Force',
        summary: 'Proton accumulation in the intermembrane space creates an electrochemical gradient composed of both a pH gradient (chemical) and a membrane voltage potential (electrical).',
        coreConcepts: ['Proton Motive Force (PMF)', 'Electrochemical Gradient', 'Inner Mitochondrial Membrane', 'Matrix pH'],
        checkpointQuestion: 'What are the two thermodynamic components that constitute the proton motive force?',
        checkpointAnswer: 'The chemical gradient (ΔpH) and the electrical membrane potential (ΔΨ).',
        imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80',
        isCompleted: true,
      },
      {
        stepNumber: 3,
        title: 'Rotary Mechanism of ATP Synthase',
        summary: 'Protons return to the matrix through the c-ring of F0, driving physical mechanical rotation of the central gamma stalk within the catalytic alpha3-beta3 hexamer of F1, synthesizing ATP.',
        coreConcepts: ['F0 Rotor', 'F1 Catalytic Head', 'Gamma Subunit Rotation', 'Binding Change Mechanism (Boyer)'],
        checkpointQuestion: 'Approximately how many ATP molecules are synthesized per glucose molecule via complete aerobic respiration?',
        checkpointAnswer: 'Approximately 30 to 32 ATP per glucose molecule.',
        imageUrl: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=800&auto=format&fit=crop&q=80',
        isCompleted: false,
      },
    ],
    cards: [
      {
        id: 'card-3-1',
        deckId: 'deck-sample-3',
        question: 'Which enzyme complex in the electron transport chain uses copper and heme a3 centers to reduce molecular oxygen into water?',
        answer: 'Complex IV (Cytochrome c oxidase) catalyzes the 4-electron reduction of O2 to 2 H2O while pumping 2 protons.',
        hint: 'The terminal electron acceptor complex.',
        imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
        imageCaption: 'Complex IV Cytochrome c Oxidase Electron Transfer',
        subject: 'Biochemistry',
        topic: 'Respiratory Chain Complexes',
        difficulty: 'Intermediate',
        keyFormulaOrConcept: 'O2 + 4 H+ + 4 e- -> 2 H2O',
        repetitions: 1,
        interval: 1,
        easeFactor: 2.5,
        nextReviewDate: Date.now() - 5000,
        history: [],
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'card-3-2',
        deckId: 'deck-sample-3',
        question: 'According to Paul Boyer’s binding-change mechanism, what causes the conformational transitions (Open, Loose, Tight) in ATP Synthase?',
        answer: 'The 360-degree rotation of the asymmetric central gamma subunit within the stationary alpha-beta hexamer of F1.',
        hint: 'Think of mechanical rotational catalysis driven by proton flux.',
        imageUrl: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=800&auto=format&fit=crop&q=80',
        imageCaption: 'Rotary Binding Change Mechanism in ATP Synthase',
        subject: 'Biochemistry',
        topic: 'ATP Synthase Rotary Catalysis',
        difficulty: 'Advanced',
        keyFormulaOrConcept: 'ADP + Pi -> ATP via F0F1 rotational catalysis',
        repetitions: 2,
        interval: 6,
        easeFactor: 2.6,
        nextReviewDate: Date.now() - 1000,
        history: [{ date: Date.now() - 86400000, quality: 5, interval: 6, easeFactor: 2.6 }],
        createdAt: Date.now() - 86400000 * 2,
      },
      {
        id: 'card-3-3',
        deckId: 'deck-sample-3',
        question: 'What is the mobile lipid-soluble electron carrier that transfers electrons from Complex I and Complex II to Complex III?',
        answer: 'Ubiquinone (Coenzyme Q / CoQ), which accepts two electrons and two protons to form ubiquinol (QH2).',
        hint: 'Also known as Coenzyme Q10.',
        imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80',
        imageCaption: 'Ubiquinone Q-Cycle Shuttle Mechanism',
        subject: 'Biochemistry',
        topic: 'Coenzyme Q Electron Shuttling',
        difficulty: 'Beginner',
        keyFormulaOrConcept: 'Q + 2e- + 2H+ <-> QH2 (Ubiquinol)',
        repetitions: 3,
        interval: 15,
        easeFactor: 2.5,
        nextReviewDate: Date.now() + 86400000 * 5,
        history: [{ date: Date.now() - 86400000 * 10, quality: 4, interval: 6, easeFactor: 2.5 }],
        createdAt: Date.now() - 86400000 * 20,
      },
    ],
  },
];

# Principles of Distributed Consensus and Fault-Tolerant State Machines
Author: Systems Architecture Research Group (Open CC BY 4.0 Technical Specification)

## 1. The Distributed State Machine Replication Problem
State machine replication (SMR) provides high availability and partition tolerance for mission-critical distributed services by coordinating identical state transitions across independent physical replicas. In an asynchronous network susceptible to arbitrary message delays and packet drops, deterministic consensus algorithms guarantee safety (linearizable read/write order) and liveness (eventual progress).

## 2. The Raft Consensus Protocol
Raft decomposes distributed consensus into three distinct sub-problems: leader election, log replication, and commitment safety.
- **Leader Election:** Replicas operate in one of three roles: Leader, Follower, or Candidate. If a follower detects election timeout elapsed (typically 150ms to 300ms randomized interval) without receiving heartbeat messages, it transitions to Candidate, increments its term counter, and requests votes.
- **Quorum Requirement:** A candidate requires strict majority approval: $Q = \lfloor N/2 \rfloor + 1$ votes out of $N$ participating cluster nodes.
- **Log Matching Property:** If two separate replica logs contain an entry with identical index and term, the logs are identical in all preceding entries up to that index.

## 3. Byzantine Fault Tolerance (BFT)
In adversarial peer-to-peer environments where malicious or compromised nodes may exhibit arbitrary behavior (sending contradictory votes, colluding, or intentionally withholding network packets), classical crash-fault tolerant algorithms fail. 
- **The Byzantine Node Bound:** To tolerate $f$ Byzantine traitor nodes, a system requires at least $3f + 1$ total nodes ($N \ge 3f + 1$).
- **Quorum Intersection:** Any two quorums of size $2f + 1$ must share at least $f + 1$ overlapping members, ensuring at least one honest, uncompromised node is present in both decisions to guarantee non-equivocation.

## 4. Multi-Paxos Invariants
Multi-Paxos optimizes basic Paxos by amortizing Phase 1 (Prepare/Promise) across multiple log instances. A stable proposer serves as the distinguished leader. When leadership remains uncontested, Multi-Paxos executes Phase 2 (Accept/Accepted) in a single round-trip latency ($1 \times \text{RTT}$), achieving optimal consensus throughput under standard network conditions.


"""
Benchmark Dataset for Calibrated Evaluation of NexusRAG.
Defines in-domain answerable queries with ground-truth facts, and out-of-domain unanswerable queries.
"""
from typing import List, Dict, Any
from pydantic import BaseModel

class BenchmarkQuery(BaseModel):
    id: str
    query: str
    expected_answerable: bool
    target_document_filename: str
    key_facts: List[str]
    description: str

BENCHMARK_QUERIES: List[BenchmarkQuery] = [
    # In-Domain Clean Energy Queries
    BenchmarkQuery(
        id="q1_clean_energy",
        query="What was the average field efficiency of commercial monocrystalline silicon solar modules in 2024?",
        expected_answerable=True,
        target_document_filename="clean_energy_report_2024.txt",
        key_facts=["22.8%", "monocrystalline", "efficiency"],
        description="Extracts specific numeric efficiency statistic from PV report"
    ),
    BenchmarkQuery(
        id="q2_clean_energy",
        query="Why did lithium iron phosphate LFP batteries gain 82% market share over NMC?",
        expected_answerable=True,
        target_document_filename="clean_energy_report_2024.txt",
        key_facts=["82%", "thermal runaway safety", "cycle lifetime", "cobalt"],
        description="Evaluates technical synthesis of battery chemistry rationale"
    ),
    BenchmarkQuery(
        id="q3_distributed_systems",
        query="How many total nodes are required to tolerate f Byzantine traitor nodes in a fault-tolerant system?",
        expected_answerable=True,
        target_document_filename="distributed_systems_consensus_brief.md",
        key_facts=["3f + 1", "Byzantine", "nodes"],
        description="Evaluates extraction of mathematical Byzantine fault bound"
    ),
    BenchmarkQuery(
        id="q4_distributed_systems",
        query="What is the randomized election timeout interval used by Raft followers?",
        expected_answerable=True,
        target_document_filename="distributed_systems_consensus_brief.md",
        key_facts=["150ms", "300ms", "election timeout"],
        description="Evaluates distributed consensus parameter retrieval"
    ),
    BenchmarkQuery(
        id="q5_governance",
        query="What supermajority voting threshold is required for material corporate mergers under the governance charter?",
        expected_answerable=True,
        target_document_filename="corporate_governance_report.txt",
        key_facts=["75%", "supermajority", "merger"],
        description="Evaluates corporate governance voting threshold extraction"
    ),
    BenchmarkQuery(
        id="q6_governance",
        query="What are the maximum recovery time objective RTO and recovery point objective RPO for disaster recovery?",
        expected_answerable=True,
        target_document_filename="corporate_governance_report.txt",
        key_facts=["4 hours", "15 minutes", "RTO", "RPO"],
        description="Evaluates business continuity metrics retrieval"
    ),

    # Out-of-Domain Adversarial / Unanswerable Queries (Must Abstain)
    BenchmarkQuery(
        id="q7_adversarial_warp",
        query="What antimatter fuel ratio is required to initiate faster-than-light warp propulsion?",
        expected_answerable=False,
        target_document_filename="none",
        key_facts=[],
        description="Science fiction query with zero supporting context; must trigger calibrated abstention"
    ),
    BenchmarkQuery(
        id="q8_adversarial_recipe",
        query="What is the traditional fermentation recipe for authentic sourdough rye bread?",
        expected_answerable=False,
        target_document_filename="none",
        key_facts=[],
        description="Culinary query unrelated to indexed corpus; must trigger calibrated abstention"
    ),
    BenchmarkQuery(
        id="q9_adversarial_sports",
        query="Who scored the winning goal in the 1994 FIFA World Cup semifinal match?",
        expected_answerable=False,
        target_document_filename="none",
        key_facts=[],
        description="Historical sports trivia query with zero corpus context; must trigger calibrated abstention"
    ),
    BenchmarkQuery(
        id="q10_adversarial_quantum",
        query="How do tachyon particles bypass quantum chromodynamic confinement in particle accelerators?",
        expected_answerable=False,
        target_document_filename="none",
        key_facts=[],
        description="Pseudoscience physics query; must trigger calibrated abstention"
    ),
]


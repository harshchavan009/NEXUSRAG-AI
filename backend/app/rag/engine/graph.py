"""
Assembly of the LangGraph State Machine for NexusRAG.
Defines nodes, sequential transitions, conditional routing, and compilation.
"""
from typing import Literal
from langgraph.graph import StateGraph, START, END

from backend.app.config import settings
from backend.app.rag.engine.state import RAGGraphState
from backend.app.rag.engine.nodes import (
    validate_input_node,
    rewrite_query_node,
    retrieve_node,
    rerank_node,
    check_evidence_node,
    abstain_node,
    generate_node,
    validate_citations_node,
    validate_groundedness_node,
    finalise_node
)

def route_evidence_sufficiency(state: RAGGraphState) -> Literal["generate", "abstain"]:
    """Conditional router based on evidence sufficiency score."""
    if state.get("evidence_is_sufficient", False):
        return "generate"
    return "abstain"

def route_groundedness_verification(state: RAGGraphState) -> Literal["generate", "finalise"]:
    """Conditional router with bounded retry on low groundedness score."""
    score = state.get("groundedness_score", 1.0)
    retry_count = state.get("retry_count", 0)

    if score < settings.GROUNDEDNESS_THRESHOLD and retry_count < settings.MAX_RETRIES:
        return "generate"
    return "finalise"

def build_rag_graph():
    """Builds and compiles the 9-node LangGraph state machine."""
    workflow = StateGraph(RAGGraphState)

    # Add all 10 nodes (9 operational nodes + finalise)
    workflow.add_node("validate_input", validate_input_node)
    workflow.add_node("rewrite_query", rewrite_query_node)
    workflow.add_node("retrieve", retrieve_node)
    workflow.add_node("rerank", rerank_node)
    workflow.add_node("check_evidence", check_evidence_node)
    workflow.add_node("abstain", abstain_node)
    workflow.add_node("generate", generate_node)
    workflow.add_node("validate_citations", validate_citations_node)
    workflow.add_node("validate_groundedness", validate_groundedness_node)
    workflow.add_node("finalise", finalise_node)

    # Edge transitions
    workflow.add_edge(START, "validate_input")
    workflow.add_edge("validate_input", "rewrite_query")
    workflow.add_edge("rewrite_query", "retrieve")
    workflow.add_edge("retrieve", "rerank")
    workflow.add_edge("rerank", "check_evidence")

    # Sufficiency Gate
    workflow.add_conditional_edges(
        "check_evidence",
        route_evidence_sufficiency,
        {
            "generate": "generate",
            "abstain": "abstain"
        }
    )

    # Abstention flows directly to finalise
    workflow.add_edge("abstain", "finalise")

    # Generation flows to verification
    workflow.add_edge("generate", "validate_citations")
    workflow.add_edge("validate_citations", "validate_groundedness")

    # Groundedness verification with bounded retry
    workflow.add_conditional_edges(
        "validate_groundedness",
        route_groundedness_verification,
        {
            "generate": "generate",
            "finalise": "finalise"
        }
    )

    workflow.add_edge("finalise", END)

    return workflow.compile()

# Singleton compiled graph instance
rag_graph = build_rag_graph()

"""
Rebel Alliance Tactical Infrastructure - Architecture Diagram
Generated for rebel-ops demo application
Date: 2026-01-20

Prerequisites:
- pip install diagrams
- Graphviz installed (apt-get install graphviz)

Generate PNG: python architecture-diagram.py
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.generic.compute import Rack
from diagrams.generic.device import Mobile
from diagrams.generic.network import Firewall
from diagrams.generic.storage import Storage
from diagrams.onprem.analytics import Spark
from diagrams.onprem.monitoring import Grafana

# Diagram configuration
graph_attr = {
    "fontsize": "24",
    "bgcolor": "white",
    "pad": "0.5",
    "splines": "ortho",
    "nodesep": "0.8",
    "ranksep": "1.0"
}

node_attr = {
    "fontsize": "14",
    "height": "1.5",
    "width": "2.0"
}

edge_attr = {
    "fontsize": "12"
}

with Diagram(
    "🌟 Rebel Alliance Command Center",
    show=False,
    direction="TB",
    filename="rebel-ops-architecture",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr
):
    # External users/clients
    rebels = Mobile("🚀 Rebel Operatives\n(X-Wing Pilots)")

    with Cluster("🌟 Rebel Alliance Command Center\n(Azure Static Web Apps)"):
        with Cluster("🎮 Tactical Interface"):
            webapp = Rack(
                "⚫ Death Star 3D Hologram\n📋 Mission Control Dashboard\n(React + Vite + Three.js)")

        with Cluster("⚡ Intelligence Network\n(Managed Functions)"):
            api_missions = Firewall("🎯 Mission Briefings\n/api/missions")
            api_intel = Firewall("🔍 Classified Intel\n/api/intelligence")
            api_reports = Firewall("📡 Field Reports\n/api/reports")

    with Cluster("🛡️ Rebel Intelligence HQ\n(Monitoring & Analytics)"):
        insights = Grafana("🛰️ Battle Station Monitor\n(Application Insights)")
        logs = Storage("📊 Mission Archives\n(Log Analytics)")

    # Define connections
    rebels >> Edge(label="🚀 Secure Hyperspace Link",
                   color="#4169E1", style="bold") >> webapp

    webapp >> Edge(label="⚡ Data Stream", color="#32CD32",
                   style="dashed") >> api_missions
    webapp >> Edge(color="#32CD32", style="dashed") >> api_intel
    webapp >> Edge(color="#32CD32", style="dashed") >> api_reports

    api_missions >> Edge(label="📡 Telemetry Feed",
                         color="#FF8C00", style="dotted") >> insights
    api_intel >> Edge(color="#FF8C00", style="dotted") >> insights
    api_reports >> Edge(color="#FF8C00", style="dotted") >> insights
    webapp >> Edge(color="#FF8C00", style="dotted") >> insights

    insights >> Edge(label="💾 Archive", color="#9370DB") >> logs

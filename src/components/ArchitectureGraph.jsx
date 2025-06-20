import { useEffect, useState, useRef } from 'react';
import Cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import CytoscapeComponent from 'react-cytoscapejs';
import axios from 'axios';

Cytoscape.use(dagre);

export default function ArchitectureGraph({ repoId }) {
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!repoId) return;

    async function fetchGraph() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/docs/architecture/${encodeURIComponent(repoId)}`
        );
        const jsonUrl = res.data.jsonUrl;
        const graphRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}${jsonUrl}`);
        setElements(graphRes.data.elements || []);
      } catch (err) {
        console.error('Error loading architecture graph:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchGraph();
  }, [repoId]);

  // This makes sure layout runs AFTER elements load
  useEffect(() => {
    if (cyRef.current && elements.length) {
      const cy = cyRef.current;
      const layout = cy.layout({
        name: 'dagre',
        rankDir: 'LR',
        nodeSep: 80,
        edgeSep: 40,
        rankSep: 120,
        fit: true,
        padding: 50,
        animate: true,
      });
      layout.run();

      // Fit view after layout
      cy.ready(() => {
        cy.fit();
      });
    }
  }, [elements]);

  if (loading) return <p className="text-gray-300">Loading graph...</p>;
  if (!elements.length) return <p className="text-gray-300">No graph data available.</p>;

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <CytoscapeComponent
        cy={(cy) => {
          cyRef.current = cy;
        }}
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        zoomingEnabled={true}
        userZoomingEnabled={true}
        userPanningEnabled={true}
        minZoom={0.2}
        maxZoom={2}
        boxSelectionEnabled={false}
        stylesheet={[
          {
            selector: 'node',
            style: {
              shape: 'roundrectangle',
              'background-color': '#1F2937',
              'border-color': '#4B5563',
              'border-width': 0,
              label: 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
              color: '#D1D5DB',
              'font-size': 12,
              'font-weight': '500',
              'text-wrap': 'wrap',
              'text-max-width': 100,
              padding: '6px',
              width: 'label',
              height: 'label',
            },
          },
          {
            selector: 'edge',
            style: {
              width: 1.5,
              'line-style': 'dotted',
              'line-color': '#6B7280',
              'target-arrow-color': '#6B7280',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              label: 'data(relationship)',
              color: '#9CA3AF',
              'font-size': 10,
              'text-rotation': 'autorotate',
              'text-margin-y': -10,
              'text-background-color': '#111827',
              'text-background-opacity': 1,
              'text-background-padding': 2,
            },
          },
        ]}
      />
    </div>
  );
}

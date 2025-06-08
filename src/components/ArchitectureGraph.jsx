import { useEffect, useState } from 'react';
import Cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import CytoscapeComponent from 'react-cytoscapejs';
import axios from 'axios';

Cytoscape.use(dagre);

export default function ArchitectureGraph({ repoId }) {
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading graph...</p>;
  if (!elements.length) return <p>No graph data available.</p>;

  return (
    <CytoscapeComponent
      elements={elements}
      style={{ width: '100%', height: '600px' }}
      layout={{
        name: 'dagre',
        rankDir: 'LR',     // Left to Right for horizontal flow
        nodeSep: 60,
        edgeSep: 30,
        rankSep: 100,
        animate: true,
        animationDuration: 1000,
        fit: true,
      }}
      zoom={1}
      minZoom={0.5}
      maxZoom={2}
      pan={{ x: 0, y: 0 }}
      stylesheet={[
        {
          selector: 'node.module',
          style: {
            'background-color': '#E3F2FD',
            'border-width': 2,
            'border-color': '#2196F3',
            label: 'data(label)',
            'text-valign': 'top',
            'text-halign': 'center',
            color: '#0D47A1',
            'font-weight': 'bold',
            'font-size': 14,
            'text-outline-width': 0,
            padding: '10px',
            shape: 'roundrectangle',
          },
        },
        {
          selector: 'node',
          style: {
            'background-color': 'data(backgroundColor)',
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            color: '#222',
            'font-size': 11,
            'text-wrap': 'wrap',
            'text-max-width': 100,
            'text-outline-width': 1,
            'text-outline-color': '#fff',
            shape: 'ellipse',
            width: 'label',
            height: 'label',
            padding: '6px 12px',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': 'data(color)',
            'target-arrow-color': 'data(color)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            opacity: 0.8,
            label: 'data(relationship)',
            'font-size': 9,
            'text-rotation': 'autorotate',
            color: '#555',
            'text-margin-y': -10,
          },
        },
        {
          selector: 'edge:hover',
          style: {
            'line-color': '#FF5722',
            'target-arrow-color': '#FF5722',
            width: 4,
            opacity: 1,
          },
        },
      ]}
      userZoomingEnabled={true}
      userPanningEnabled={true}
      boxSelectionEnabled={true}
    />
  );
}

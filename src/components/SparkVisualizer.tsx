import React from 'react';
import * as d3 from 'd3';
import { SparkNode } from '../types';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface SparkVisualizerProps {
  nodes: SparkNode[];
}

export const SparkVisualizer: React.FC<SparkVisualizerProps> = ({ nodes }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink().id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const links: any[] = [];
    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        links.push({ source: node.id, target: targetId });
      });
    });

    const link = svg.append("g")
      .attr("stroke", "rgba(255, 255, 255, 0.1)")
      .selectAll("line")
      .data(links)
      .join("line");

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append("circle")
      .attr("r", 6)
      .attr("fill", d => (d as any).type === 'entity' ? "#A855F7" : "#FFFFFF")
      .attr("stroke", "#050505")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dx", 12)
      .attr("dy", 4)
      .text(d => (d as any).label)
      .attr("fill", "rgba(255, 255, 255, 0.6)")
      .attr("font-size", "10px")
      .attr("font-family", "Montserrat, sans-serif")
      .attr("text-transform", "uppercase")
      .attr("letter-spacing", "1px");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d as any).source.x)
        .attr("y1", d => (d as any).source.y)
        .attr("x2", d => (d as any).target.x)
        .attr("y2", d => (d as any).target.y);

      node
        .attr("transform", d => `translate(${(d as any).x},${(d as any).y})`);
    });

    return () => simulation.stop();
  }, [nodes, isExpanded]);

  return (
    <motion.div 
      layout
      className={isExpanded ? "fixed inset-4 z-50 bg-brutal-black/95 border border-white/20 rounded-2xl overflow-hidden" : "h-64 bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden relative"}
    >
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse" />
        <span className="text-sm font-display tracking-widest text-white/60">
          Neural Spark Visualizer
        </span>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button className="p-1.5 hover:text-neon-blue transition-colors text-white/40">
          <RefreshCw size={14} />
        </button>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 hover:text-neon-blue transition-colors text-white/40"
        >
          {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {!isExpanded && nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
          Awaiting Neural Mapping...
        </div>
      )}
    </motion.div>
  );
};

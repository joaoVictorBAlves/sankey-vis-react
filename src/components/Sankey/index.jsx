import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { drawSankey } from "./utils/renderer";

const Sankey = ({
  width,
  height,
  nodes,
  links,
  k,
  reductorK,
  reductorQ,
  gapA,
  gapQ,
  gapK,
  apearingLinks,
  nodeOrderBy,
  nodeOrder,
  orderingLinks,
}) => {
  const ref = useRef();
  const containerRef = useRef();
  const [measuredWidth, setMeasuredWidth] = useState(null);

  // Medir a largura real do container pai
  useEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      const rect = containerRef.current.getBoundingClientRect();
      setMeasuredWidth(rect.width);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const effectiveWidth = measuredWidth ?? width;

  useEffect(() => {
    if (nodes.length === 0 || links.length === 0 || effectiveWidth <= 0) return;

    drawSankey(
      ref,
      effectiveWidth,
      height,
      nodes,
      links,
      k,
      reductorK,
      reductorQ,
      gapA,
      gapQ,
      gapK,
      apearingLinks,
      nodeOrderBy,
      nodeOrder,
      orderingLinks,
    );
  }, [
    effectiveWidth,
    height,
    nodes,
    links,
    k,
    reductorK,
    reductorQ,
    gapA,
    gapQ,
    gapK,
    apearingLinks,
    nodeOrderBy,
    nodeOrder,
    orderingLinks,
  ]);

  return (
    <div ref={containerRef} style={{ width: "100%", overflow: "hidden" }}>
      <svg
        id="sankey"
        width={effectiveWidth}
        height={height}
        ref={ref}
        style={{ display: "block" }}
      />
    </div>
  );
};

Sankey.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  nodes: PropTypes.array.isRequired,
  links: PropTypes.array.isRequired,
  k: PropTypes.number.isRequired,
  reductorK: PropTypes.number.isRequired,
  reductorQ: PropTypes.number.isRequired,
  gapA: PropTypes.number.isRequired,
  gapQ: PropTypes.number.isRequired,
  gapK: PropTypes.number.isRequired,
  apearingLinks: PropTypes.array.isRequired,
  nodeOrderBy: PropTypes.number.isRequired,
  nodeOrder: PropTypes.string.isRequired,
  orderingLinks: PropTypes.number.isRequired,
};

export default Sankey;

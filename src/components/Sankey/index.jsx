import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { drawSankey } from "./hooks/utils";

const SankeyChart = ({
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
  orderLinks,
}) => {
  const ref = useRef();

  useEffect(() => {
    drawSankey(
      ref,
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
      orderLinks
    );
  }, [
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
    orderLinks,
  ]);

  return (
    <svg
      width={width}
      height={height}
      ref={ref}
      style={{ margin: "20px auto" }}
    ></svg>
  );
};

SankeyChart.propTypes = {
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
  nodeOrderBy: PropTypes.string.isRequired,
  nodeOrder: PropTypes.array.isRequired,
  orderLinks: PropTypes.bool.isRequired,
};

export default SankeyChart;

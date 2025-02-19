import React, { useEffect, useRef } from "react";
import { drawSankey } from "./hooks/utils";

const SankeyChart = ({ 
    width, height, nodes, links, k, reductorK, reductorQ, gapA, gapQ, gapK, apearingLinks, nodeOrderBy, nodeOrder 
}) => {
    const ref = useRef();

    useEffect(() => {
        drawSankey(ref, width, height, nodes, links,  k, reductorK, reductorQ, gapA, gapQ, gapK, apearingLinks, nodeOrderBy, nodeOrder);
        console.log("K", k);
        console.log("reductorK", reductorK);
        console.log("reductorQ", reductorQ);
        console.log("gapA", gapA);
        console.log("gapQ", gapQ);
        console.log("gapK", gapK);
        console.log("apearingLinks", apearingLinks);
        console.log("nodeOrderBy", nodeOrderBy);
        console.log("nodeOrder", nodeOrder);
    }, [width, height, nodes, links, k, reductorK, reductorQ, gapA, gapQ, gapK, apearingLinks, nodeOrderBy, nodeOrder]);

    return <svg width={width} height={height} ref={ref} style={{ margin: "20px auto" }}></svg>;
};

export default SankeyChart;

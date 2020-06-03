// var math = require('./test');
// window.pubsub = require('../vendor/pubsub.js')
const _ = require("./libs/underscore/underscore")
const SVG = require('./libs/svg.js/svg');
const SCALE = 1/5;

module.exports = {
  SVG: SVG,
  getNodeById(id){
    return {
      id: "id",
      ownerId: "user-id",
      nodes: [
        {x: 1, y: 1},
        {x: 1, y: 2},
        {x: 1, y: 3},
        {x: 1, y: 4},
        {x: 2, y: 1},
        {x: 2, y: 2},
        {x: 2, y: 3},
        {x: 2, y: 4},
        {x: 3, y: 1},
        {x: 3, y: 2},
        {x: 3, y: 3},
        {x: 3, y: 4},
        {x: 4, y: 1},
        {x: 4, y: 2},
        {x: 4, y: 3},
        {x: 4, y: 4},
        {x: 0, y: 0},
        {x: 0, y: 5},
        {x: 5, y: 0},
        {x: 5, y: 5},
      ],
      edges: [
        // [0, 1, 0.1],
        // [2, 3, 0.1],
        // [4, 5, 0.1],
        // [6, 7, 0.1],
        // [8, 9, 0.1],
        // [10, 11, 0.1],
        // [12, 13, 0.1],
        // [14, 15, 0.1],

        // [0, 4, 0.1],
        // [1, 5, 0.1],
        // [2, 6, 0.1],
        // [3, 7, 0.1],
        // [8, 12, 0.1],
        // [9, 13, 0.1],
        // [10, 14, 0.1],
        // [11, 15, 0.1],

        [1, 2, 0.1],
        [7, 11, 0.1],
        [13, 14, 0.1],
        [4, 8, 0.1],
        [16, 0, 0.1],
        [17, 3, 0.1],
        [18, 12, 0.1],
        [19, 15, 0.1],
        [5, 10, 0.1],
        [6, 9, 0.1]
      ],
      children: [
        { id: "1", x: 1, y: 1 , r: 0, nids: [0]},
        { id: "1", x: 3, y: 1 , r: 0, nids: [0]},
        { id: "1", x: 1, y: 3 , r: 0, nids: [0]},
        { id: "1", x: 3, y: 3 , r: 0, nids: [0]}
        // { id: "1", x: -1, y: 0 , r: 0, s: 0.3}
      ],
      type: "",
      weight: 1,
    };
  },
  generate(id, svg, level){
    svg.clear();
    const node = this.getNodeById(id);

    _.each(node.edges, (edge) => {
      const n1 = node.nodes[edge[0]]
      const n2 = node.nodes[edge[1]]

      svg.line(n1.x, n1.y, n2.x, n2.y).stroke({ width: edge[2], color: new SVG.Color("#0000000").morph("#000000ff").at(level/4)})
    })
    // svg.rect(1,1).fill({color:"#F00"});

    if(level<=0){
      return;
    }

    _.each(node.children, (hash) => {
      const sub_svg = svg.group().translate(hash.x, hash.y).scale(SCALE);
      return this.generate(hash.id, sub_svg, level-1);
    });

    return {
      node: node,
      svg: svg,
    }
  }
};
window.main = module.exports;
var svg=main.SVG("main").group().translate(100,100).scale(100);
main.generate(1,svg,3);


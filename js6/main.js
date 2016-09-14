// var math = require('./test');
// window.pubsub = require('../vendor/pubsub.js')
const SVG = require('svg.js/svg');

module.exports = {
  SVG: SVG,
  getNodeById(id){
    return {
      id: "id",
      ownerId: "user-id",
      node: [
        {x: 1, y: 0}
      ],
      edges: [
        [0, 1, 1.2],
      ]
      children: [
        { id: "1", x: 1, y: 0 , r: 0, s: 0.9, nids: [0]}
        // { id: "1", x: -1, y: 0 , r: 0, s: 0.3}
      ],
      type: "",
      weight: 1,
    };
  },
  generate(id, svg, weight){
    svg.clear();
    const node = this.getNodeById(id);
    if(node.weight > weight){
      return null;
    }

    svg.rect(1,1).fill({color:"#F00"});

    const children = node.children.map((hash) => {
      const sub_svg = svg.group().translate(hash.x, hash.y).scale(hash.s);
      return this.generate(hash.id, sub_svg, weight * hash.s);
    });

    return {
      node: node,
      childen: children,
      svg: svg,
    }
  }
};
window.main = module.exports;
svg=main.SVG("main").group().translate(100,100).scale(20);
main.generate(1,svg,10);


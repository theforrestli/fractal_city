// var math = require('./test');
// window.pubsub = require('../vendor/pubsub.js')
const SVG = require('svg.js/svg');

module.exports = {
  SVG: SVG,
  getNodeById(id){
    return {
      children: [
        { id: "1", x: 1, y: 0 , r: 0, s: 0.9 }
        // { id: "1", x: -1, y: 0 , r: 0, s: 0.3}
      ],
      type: "",
      weight: 1,
      data: {},
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
      children: children,
      svg: svg,
    }
  }
};
window.main = module.exports;


require('./example');
store = require('main.js');
console.log("1");
let verifyNode = (id, store) => {
  node = store.getNodeById(id);
  _.each(node.children, (child) => {
    cnode = store.getNodeById(child.id);
    expect(cnode.parentId).to.equal(id);
  });
}

describe("Sample test", () => {
  it("", () => {
    // {
    //   children_id: [],
    //   depth: 1
    // }
  });
});


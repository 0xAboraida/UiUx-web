
async function test() {
  const bookId = '9';
  const pageId = 34;
  
  const treeUrl = `https://api.turath.io/book-tree?book=${bookId}`;
  console.log('Fetching tree:', treeUrl);
  const treeRes = await fetch(treeUrl);
  const treeText = await treeRes.text();
  let treeData = [];
  try {
    treeData = JSON.parse(treeText.trim() ? treeText : '[]');
  } catch (e) {
    console.error("Failed to parse tree", e);
  }
  
  let targetNode = null;
  
  function findNode(nodes) {
      for (const node of nodes) {
          if (node.page === pageId) {
              targetNode = node;
          }
          if (node.items && node.items.length) {
              findNode(node.items);
          }
      }
  }
  findNode(treeData);
  
  console.log('Target Node:', targetNode);
  
  // also fetch the page
  const pageUrl = `https://api.turath.io/book?book=${bookId}&page=${pageId}`;
  console.log('Fetching page:', pageUrl);
  const pageRes = await fetch(pageUrl);
  const pageText = await pageRes.text();
  console.log('Page content length:', pageText.length);
  console.log('Page content preview:', pageText.slice(0, 1000));
}
test();

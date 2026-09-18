const fixRegex = (text) => {
  let t = text;
  t = t.replace(/(\S)\s*(?=(?:\*\*|__)[\d\u0660-\u0669]+[-.])/g, '$1\n\n');
  t = t.replace(/(\S)\s*(?=(?:\*\*|__)[^*_]+?:\*\*)/g, '$1\n\n');
  t = t.replace(/(\S)\s*(?=(?:\*\*|__)[^*_]+?(?:\*\*|__):)/g, '$1\n\n');
  return t;
};

let test1 = `القبول. 3. **الجمع بين الأدلة:**`;
let test2 = `* **الإمامة والائتمام:**`;

console.log("TEST1 before:", test1);
test1 = test1.replace(/(^|[^\w\d\u0660-\u0669])([\d\u0660-\u0669]+[-.]\s*)(?:\*\*|__)(.+?)(?:\*\*|__)/g, '$1**$2$3**');
console.log("TEST1 after rule1:", test1);
console.log("TEST1 final:", fixRegex(test1));

console.log("\nTEST2 before:", test2);
console.log("TEST2 final:", fixRegex(test2));

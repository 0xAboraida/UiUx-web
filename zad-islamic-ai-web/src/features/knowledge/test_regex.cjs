const t = 'الفعل.\n\n<span data-type="title">[فصل]</span>\n\n(1017)';
const res = t.replace(/(<\/span>|<\/h[1-6]>)\s*[\r\n]+/gi, '$1\n');
console.log('Result:', JSON.stringify(res));

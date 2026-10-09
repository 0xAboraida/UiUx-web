import { sliceChapterPages } from './src/api/turathApi.ts';

const page34 = {
    pg: 34,
    text: `<!-- TURATH_PAGE_START pg="34" -->
<span data-type="title" id="toc-28" data-level="2">بَابُ المَسْحِ عَلَى الخُفَّيْنِ</span>

يَجُوزُ يَوْمًا وَلَيْلَةً...
<!-- TURATH_PAGE_END pg="34" -->`
};
const page35 = {
    pg: 35,
    text: `<!-- TURATH_PAGE_START pg="35" -->
<span data-type="title" id="toc-29" data-level="2">بَابُ الغُسْلِ</span>

وَمُ...
<!-- TURATH_PAGE_END pg="35" -->`
};

console.log("Slicing...");
const res = sliceChapterPages([page34, page35], {
    chapterTitle: "باب المسح على الخفين",
    nextChapterTitle: "باب الغسل"
});
console.log(JSON.stringify(res, null, 2));

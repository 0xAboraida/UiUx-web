import { fetchTurathChapterText } from './src/api/turathApi.ts';

async function test() {
  console.log("=== Testing Chapter 1: باب فروض الوضوء (Page 33) ===");
  const res1 = await fetchTurathChapterText(9, 33, 34, {
      chapterTitle: "باب فروض الوضوء",
      nextChapterTitle: "باب المسح على الخفين"
  }); 
  console.log('Result length:', res1?.text?.length);
  console.log('Result text end:\n', res1?.text?.slice(-1000));
  
  console.log("\n=== Testing Chapter 2: باب المسح على الخفين (Page 34) ===");
  const res2 = await fetchTurathChapterText(9, 34, 35, {
      chapterTitle: "باب المسح على الخفين",
      nextChapterTitle: "باب الغسل"
  }); 
  console.log('Result length:', res2?.text?.length);
  console.log('Result text start:\n', res2?.text?.slice(0, 1000));
}
test();

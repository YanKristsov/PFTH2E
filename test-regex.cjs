// Test regex directly
const testHtml1 = '<img class="action action-1" src="/PFTH2E/art/PF_action_1.webp" style="height:1em" alt="одиночное действие">';
const result1 = testHtml1.replace(/alt="[^"]*одиночное[^"]*"/gi, 'alt="PF_action_1"');
console.log('Test 1:', result1);

const testHtml2 = '<img class="action action-2" src="/PFTH2E/art/PF_action_2.webp" style="height:1em" alt="активность из 2-х действий">';
const result2 = testHtml2.replace(/alt="[^"]*2-х[^"]*"/gi, 'alt="PF_action_2"');
console.log('Test 2:', result2);

const testHtml3 = '<img class="action action-3" src="/PFTH2E/art/PF_action_3.webp" style="height:1em" alt="активность из 3-х действий">';
const result3 = testHtml3.replace(/alt="[^"]*3-х[^"]*"/gi, 'alt="PF_action_3"');
console.log('Test 3:', result3);

// Also test with style="height:1em" still present
const testHtml4 = '<img class="action action-1" src="/PFTH2E/art/PF_action_1.webp" style="height:1em" alt="одиночное действие">';
const result4 = testHtml4
  .replace(/alt="[^"]*одиночное[^"]*"/gi, 'alt="PF_action_1"')
  .replace(/\s+style="height:\s*1em"/gi, '');
console.log('Test 4:', result4);

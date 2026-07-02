const fs = require('fs');
let content = fs.readFileSync('resources/js/Pages/Dashboard.jsx', 'utf8');

// Replace dark mode stone to zinc
content = content.replace(/dark:bg-stone-900/g, 'dark:bg-zinc-950');
content = content.replace(/dark:bg-stone-800/g, 'dark:bg-zinc-900');
content = content.replace(/dark:bg-stone-950/g, 'dark:bg-zinc-950');
content = content.replace(/dark:border-stone-800/g, 'dark:border-zinc-800');
content = content.replace(/dark:text-stone-400/g, 'dark:text-zinc-400');
content = content.replace(/dark:text-stone-300/g, 'dark:text-zinc-300');
content = content.replace(/dark:text-stone-200/g, 'dark:text-zinc-200');

// Fix specific text clashing (like when backgrounds are zinc-900)
content = content.replace(/text-stone-800 dark:text-stone-200/g, 'text-zinc-800 dark:text-zinc-100');
content = content.replace(/text-stone-900 dark:text-white/g, 'text-zinc-900 dark:text-white');
content = content.replace(/text-stone-800/g, 'text-zinc-800 dark:text-white');
content = content.replace(/text-stone-700/g, 'text-zinc-700 dark:text-zinc-200');
content = content.replace(/text-stone-600/g, 'text-zinc-600 dark:text-zinc-300');
content = content.replace(/text-stone-500/g, 'text-zinc-500 dark:text-zinc-400');

content = content.replace(/bg-stone-900/g, 'bg-zinc-900 dark:bg-zinc-950');
content = content.replace(/bg-stone-800/g, 'bg-zinc-800 dark:bg-zinc-900');
content = content.replace(/border-stone-200/g, 'border-zinc-200 dark:border-zinc-800');
content = content.replace(/border-stone-100/g, 'border-zinc-100 dark:border-zinc-800');
content = content.replace(/bg-stone-50/g, 'bg-zinc-50 dark:bg-zinc-900');
content = content.replace(/bg-stone-100/g, 'bg-zinc-100 dark:bg-zinc-800');

// Replace primary indigos to gojek green
content = content.replace(/indigo-600/g, 'gojek-600');
content = content.replace(/indigo-500/g, 'gojek-500');
content = content.replace(/indigo-700/g, 'gojek-700');
content = content.replace(/indigo-100/g, 'gojek-100');
content = content.replace(/indigo-50/g, 'gojek-50');
content = content.replace(/indigo-900/g, 'gojek-900');

// Re-map emerald to gojek for UI actions if they were previously emerald.
// Actually, floating profit and net realized are 'emerald-700'. We can leave them as emerald because they represent profit (green).
// Gojek green as the primary theme color replaces indigo.

fs.writeFileSync('resources/js/Pages/Dashboard.jsx', content);
console.log("Replaced colors successfully.");

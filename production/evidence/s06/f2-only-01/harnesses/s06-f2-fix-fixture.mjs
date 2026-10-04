import fs from 'node:fs';
const edit=(f,fn)=>fs.writeFileSync(f,fn(fs.readFileSync(f,'utf8')));
edit('production/tests/browser/s06-debug-hover.spec.ts',s=>s.replaceAll('documentJSON(page)','doc(page)'));
edit('production/src/ui/floating.ts',s=>s.replace('  const observer = new ResizeObserver(position);\n  observer.observe(content);\n  if (trigger) observer.observe(trigger);','  let observer: ResizeObserver;\n  try {\n    observer = new ResizeObserver(position);\n    observer.observe(content);\n    if (trigger) observer.observe(trigger);\n  } catch (error) {\n    cleanups.forEach((cleanup) => cleanup());\n    surface.remove();\n    throw error;\n  }'));
edit('.verification/s06-f2-checks.mjs',s=>s.replace('checks-final-01','checks-final-02'));

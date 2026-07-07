const fs = require('fs');
const jsdom = require('jsdom');
const html = fs.readFileSync('./www/index.html', 'utf8');
const vc = new jsdom.VirtualConsole();
vc.on('jsdomError', e => { 
  if(!e.message.includes('localStorage') && !e.message.includes('implemented')) 
    console.error('JS ERROR:', e); 
});
vc.on('error', e => console.error('ERR:', e));
const dom = new jsdom.JSDOM(html, { 
  runScripts: 'dangerously', 
  resources: 'usable', 
  virtualConsole: vc, 
  url: 'http://localhost' 
});
dom.window.addEventListener('load', () => { 
  console.log('Loaded.'); 
  setTimeout(() => { 
    try { 
      console.log('Active page before:', dom.window.document.querySelector('.page.active')?.id);
      console.log('Clicking study nav...'); 
      dom.window.document.querySelector('li[data-page="study"]').click(); 
      console.log('Active page after:', dom.window.document.querySelector('.page.active')?.id);
    } catch(err) { 
      console.error('Click failed:', err); 
    } 
  }, 2000); 
});

'use strict';
window.PlazaPages={
 route:document.body?.dataset.page||'',
 url(id='',options={}){const name=!id?'index.html':id.startsWith('group/')?'category-'+id.slice(6)+'.html':id+'.html',url=new URL(name,location.href);for(const [key,value]of Object.entries(options))if(value!==undefined&&value!==null&&value!==''&&!(key==='variant'&&Number(value)===0))url.searchParams.set(key,String(value));return url.href},
 spec(){const p=new URLSearchParams(location.search),example=p.get('example')||'default',match=/^element-(\d+)-([a-z0-9-]+)$/.exec(example);return {key:example,target:match?match[1]:null,state:match?match[2]:/^[a-z0-9-]+$/.test(example)?example:'default',variant:Math.max(0,Number(p.get('variant'))||0),viewport:p.get('viewport'),theme:['light','dark'].includes(p.get('theme'))?p.get('theme'):null}},
 cacheKey(ctrl){return 'plaza-pages:'+document.body.dataset.build+':'+ctrl.c.id+':'+ctrl.select.value+':'+ctrl.mobile+':'+ctrl.theme},
 read(ctrl){try{return JSON.parse(sessionStorage.getItem(this.cacheKey(ctrl))||'null')}catch{return null}},
 save(ctrl,catalog){try{sessionStorage.setItem(this.cacheKey(ctrl),JSON.stringify(catalog))}catch{}}
};

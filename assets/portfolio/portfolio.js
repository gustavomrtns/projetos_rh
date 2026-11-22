(function(){
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const projects=[...document.querySelectorAll('.project-card')];
  const projectLinks=[...document.querySelectorAll('.project-index a')];
  if(!reduced&&'IntersectionObserver' in window){
    const reveal=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target);}});
    },{threshold:.04,rootMargin:'0px 0px -25px 0px'});
    document.querySelectorAll('[data-reveal]').forEach(node=>{node.classList.add('will-reveal');reveal.observe(node);});
    document.querySelectorAll('.project-index a').forEach(link=>link.addEventListener('click',()=>{
      const target=document.getElementById(link.hash.slice(1));if(target)target.classList.add('is-visible');
    }));
  }
  if('IntersectionObserver' in window){
    const watched=new Map();
    const active=new IntersectionObserver(entries=>{
      entries.forEach(entry=>watched.set(entry.target.id,entry.intersectionRatio));
      const visible=projects.filter(node=>(watched.get(node.id)||0)>0).sort((a,b)=>(watched.get(b.id)||0)-(watched.get(a.id)||0))[0];
      projectLinks.forEach(link=>{if(visible&&link.hash==='#'+visible.id)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});
    },{threshold:[0,.1,.25,.5,.75],rootMargin:'-90px 0px -10% 0px'});
    projects.forEach(node=>active.observe(node));
  }
})();

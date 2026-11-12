import React, {useEffect, useRef, useState} from 'react';
import {MessageCircle, X, SendHorizontal, Sparkles} from 'lucide-react';

const money=n=>'R '+n.toLocaleString('en-ZA');
let nextId=1;
const msg=(from,text,extra={})=>({id:nextId++,from,text,...extra});

const QUICK=[
 {label:'Style me',value:'Can you style me?'},
 {label:'Size help',value:'I need size help'},
 {label:'Delivery',value:'Tell me about delivery'},
 {label:'Returns',value:'What is your returns policy?'},
];

function replyFor(raw, products){
 const t=raw.toLowerCase();
 const pick=(pred,n=3)=>products.filter(pred).slice(0,n);
 const byCategory=cat=>products.filter(p=>p.category===cat).slice(0,3);
 const tagged=pick(p=>p.tag==='NEW'||p.tag==='TRENDING'||p.tag==='BESTSELLER',3);

 if(/(size|sizing|fit|ukuran)/.test(t))
  return {text:'MOVA runs in UK sizing, from UK 4 to 11. Choose the size you usually wear in sneakers — and if you fall between sizes, we suggest sizing up, especially for the trail silhouettes. Full fit notes per style arrive at launch.',products:[products.find(p=>p.id===1)],actions:[{label:'Open the size guide',kind:'sizeGuide'}]};
 if(/(deliver|shipping|ship|courier)/.test(t))
  return {text:'Delivery is still being confirmed ahead of launch — this is a concept preview, so no orders ship yet. Launch cities and timelines will be announced first to newsletter subscribers.',actions:[{label:'Join the newsletter',kind:'newsletter'}]};
 if(/(return|exchange|refund)/.test(t))
  return {text:'Returns & exchanges will be confirmed before launch. For now, checkout is a demo and no payment is taken — so there is nothing to send back yet.',actions:[{label:'Read delivery details',kind:'go:delivery'}]};
 if(/(pay|checkout|order|buy|card|eft)/.test(t))
  return {text:'Checkout in this preview is a demo — your bag is saved on this device, but no order is placed and no payment is taken. Real checkout arrives at launch.',actions:[{label:'View my bag',kind:'bag'}]};
 if(/(discount|promo|code|sale|voucher)/.test(t))
  return {text:'No discount codes exist yet — MOVA has not launched. The surest way to catch launch-day offers is the newsletter at the bottom of the page.',actions:[{label:'Join the newsletter',kind:'newsletter'}]};
 if(/(contact|human|agent|person|support)/.test(t))
  return {text:'If you would like a human, the contact page is the place — the form is not connected yet, but every note left there is read. Our story page is also worth a look.',actions:[{label:'Contact us',kind:'go:contact'},{label:'Our story',kind:'go:story'}]};
 if(/(story|about|brand|mova)/.test(t))
  return {text:'MOVA is a South African–inspired concept built on the idea that good shoes carry you further — inspired by the energy, creativity and rhythm of the country.',actions:[{label:'Read our story',kind:'go:story'}]};
 if(/(trail|outdoor|hike|hiking|mountain)/.test(t))
  return {text:'For time outdoors, the trail line is your friend — cushioned, durable and built for the long way there. These are the ones I would start with:',products:byCategory('Outdoor')};
 if(/(run|running|jog|road)/.test(t))
  return {text:'For miles on the road, our running silhouettes balance cushion and snap. Three strong places to start:',products:byCategory('Running')};
 if(/(court|tennis|classic|smart)/.test(t))
  return {text:'Court classics never miss — clean lines, easy pairing with everything. Take a look:',products:pick(p=>/court|terrace|low/i.test(p.name),3)};
 if(/(budget|cheap|under|affordable|2[,.\s]?0?00)/.test(t))
  return {text:'Great feet do not need a big spend. These come in under R 2,000 and still carry the full MOVA fit:',products:pick(p=>p.price<2000,3)};
 if(/(new|drop|latest|arrival)/.test(t))
  return {text:'Fresh off the (concept) shelf — these are the latest drops people are talking about:',products:pick(p=>p.tag==='NEW',3)};
 if(/(black)/.test(t))
  return {text:'A clean triple-black never goes wrong. Consider these:',products:pick(p=>/black/i.test(p.desc),3)};
 if(/(best|popular|recommend|style|wear|outfit|look)/.test(t))
  return {text:'Here is the stylist edit — versatile pairs that go from Monday meetings to Saturday long way home:',products:tagged};
 if(/(care|clean|wash|maintain)/.test(t))
  return {text:'Keep them fresh with a soft damp cloth and mild soap, air-dry away from direct sun, and brush suede with a crepe brush. Avoid the washing machine — your soles will thank you.'};
 return {text:'I can help with sizing, delivery, returns, checkout or finding your next pair — try one of the buttons below, or ask me something like “show me running shoes”.',products:tagged};
}

export default function StylistChat({products,openProduct,go,onSizeGuide,onOpenBag}){
 const [open,setOpen]=useState(false),[nudged,setNudged]=useState(false),[typing,setTyping]=useState(false);
 const [messages,setMessages]=useState(()=>[msg('bot','Hey, I’m your MOVA stylist — here to help with fit, styling and everything before launch. What are you after today?',{actions:[{label:'Style me',kind:'user:Style me please'},{label:'Size help',kind:'user:What size should I get?'},{label:'Delivery',kind:'user:Tell me about delivery'}]})]);
 const [draft,setDraft]=useState('');
 const bodyRef=useRef(null),inputRef=useRef(null),timer=useRef(null);

 useEffect(()=>{if(bodyRef.current)bodyRef.current.scrollTop=bodyRef.current.scrollHeight},[messages,typing,open]);
 useEffect(()=>{if(open&&inputRef.current)inputRef.current.focus()},[open]);
 useEffect(()=>{const onKey=e=>{if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[]);
 useEffect(()=>{const t=setTimeout(()=>setNudged(true),3500);return()=>clearTimeout(t)},[]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);

 const send=(text)=>{
  const value=text.trim(); if(!value||typing)return;
  setMessages(m=>[...m,msg('user',value)]); setDraft(''); setTyping(true);
  const reply=replyFor(value,products);
  clearTimeout(timer.current);
  timer.current=setTimeout(()=>{setMessages(m=>[...m,msg('bot',reply.text,{products:reply.products,actions:reply.actions})]);setTyping(false);},650+Math.min(750,reply.text.length*2));
 };
 const handleAction=(a,closeAfter)=>{
  if(a.kind==='sizeGuide'){onSizeGuide();}
  else if(a.kind==='newsletter'){document.getElementById('footer-email')?.scrollIntoView({behavior:'smooth',block:'center'});document.getElementById('footer-email')?.focus({preventScroll:true});}
  else if(a.kind==='bag'){onOpenBag();}
  else if(a.kind.startsWith('go:')){go(a.kind.slice(3));}
  else if(a.kind.startsWith('user:')){send(a.kind.slice(5));return;}
  if(closeAfter)setOpen(false);
 };
 return <>
  {!open&&nudged&&<div className="chat-nudge" role="status"><p>Sizing or styling questions? I’m here to help.</p><button aria-label="Dismiss message" onClick={()=>setNudged(false)}><X size={14}/></button></div>}
  <button className={`stylist-fab ${open?'is-open':''}`} onClick={()=>{setOpen(o=>!o);setNudged(false)}} aria-label={open?'Close MOVA stylist chat':'Open MOVA stylist chat'} aria-expanded={open}><MessageCircle size={23} className="fab-icon fab-icon-open"/><X size={23} className="fab-icon fab-icon-close"/><span className="fab-label">Stylist</span></button>
  {open&&<div className="chat-panel" role="dialog" aria-modal="false" aria-label="MOVA stylist chat">
   <div className="chat-head"><div className="chat-avatar" aria-hidden="true">m</div><div className="chat-head-text"><strong>MOVA Stylist</strong><span><i/>Online — preview assistant</span></div><button className="icon" aria-label="Close chat" onClick={()=>setOpen(false)}><X size={18}/></button></div>
   <div className="chat-body" ref={bodyRef} aria-live="polite">{messages.map(m=><div key={m.id} className={`chat-msg ${m.from}`}><p>{m.text}</p>{m.products?.length>0&&<div className="chat-products">{m.products.filter(Boolean).map(p=><button key={p.id} className="chat-product" onClick={()=>{openProduct(p);setOpen(false)}}><img src={'/images/'+p.img} alt={p.name} loading="lazy"/><span><strong>{p.name}</strong><small>{money(p.price)}</small></span></button>)}</div>}{m.actions?.length>0&&<div className="chat-actions">{m.actions.map(a=><button key={a.label} onClick={()=>handleAction(a,a.kind.startsWith('go:'))}>{a.label}</button>)}</div>}</div>)}{typing&&<div className="chat-msg bot"><div className="chat-typing" aria-label="Stylist is typing"><span/><span/><span/></div></div>}</div>
   <div className="chat-quick" aria-label="Suggested questions">{QUICK.map(q=><button key={q.label} onClick={()=>send(q.value)}>{q.label}</button>)}</div>
   <form className="chat-input" onSubmit={e=>{e.preventDefault();send(draft)}}><input ref={inputRef} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Ask about fit, delivery, styling…" aria-label="Message the MOVA stylist" maxLength={220}/><button type="submit" aria-label="Send message" disabled={!draft.trim()||typing}><SendHorizontal size={17}/></button></form>
   <p className="chat-note"><Sparkles size={11}/> Preview assistant — answers reflect launch-day details, not live policies.</p>
  </div>}
 </>;
}

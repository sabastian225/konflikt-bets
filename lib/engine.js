export const leagues={NBA:{sport:'basketball',slug:'nba',stats:{Points:['PTS'],Assists:['AST'],Rebounds:['REB']}},NFL:{sport:'football',slug:'nfl',stats:{'Passing Yards':['YDS','PASS YDS'],'Rushing Yards':['YDS','RUSH YDS'],'Receiving Yards':['YDS','REC YDS'],Receptions:['REC']}}};
export async function json(url){const r=await fetch(url,{next:{revalidate:900},headers:{'User-Agent':'Mozilla/5.0'}});if(!r.ok)throw Error(`Source HTTP ${r.status}`);return r.json()}
export function analyze(values,minGames=10,seasonPct=90,recentPct=100){
 const nums=values.filter(Number.isFinite);
 if(nums.length<minGames||nums.length<5)return null;
 const ordered=[...new Set(nums)].sort((a,b)=>b-a);
 for(const threshold of ordered){
  if(threshold<=0)continue;
  const hits=nums.filter(v=>v>=threshold).length;
  const lastFive=nums.slice(-5);
  const recentHits=lastFive.filter(v=>v>=threshold).length;
  const hitRate=hits/nums.length;
  const recentRate=recentHits/5;
  if(hitRate*100+1e-8>=seasonPct&&recentRate*100+1e-8>=recentPct){
   const score=hitRate*0.65+recentRate*0.35;
   return {threshold,hitRate,hits,games:nums.length,lastFive,recentHits,recentRate,average:nums.reduce((a,b)=>a+b,0)/nums.length,grade:score>=.95?'A':score>=.85?'B':score>=.75?'C':score>=.65?'D':'F'};
  }
 }
 return null;
}
export function extractGamelog(data,league){const labels=data?.labels||[];const groups=data?.seasonTypes||[];const events=data?.events||{};const out=[];for(const group of groups){if(Number(group.type?.id??group.type)!==2 && !String(group.displayName||group.name||'').toLowerCase().includes('regular'))continue;for(const cat of group.categories||[]){const names=cat.labels||cat.names||labels;for(const entry of cat.events||[]){const id=String(entry.eventId||entry.id||'');const ev=events[id]||{};const raw=entry.stats||[];const values={};names.forEach((name,i)=>{const n=raw[i]===null||raw[i]===''?NaN:Number(raw[i]);if(Number.isFinite(n))values[String(name).toUpperCase()]=n});out.push({date:ev.gameDate||ev.date||entry.date||'',id,category:cat.displayName||cat.name||'',values})}}}return out.sort((a,b)=>new Date(a.date)-new Date(b.date))}
export function statValue(row,stat){const v=row.values;const cat=row.category.toLowerCase();if(stat==='Points')return v.PTS??v.POINTS;if(stat==='Assists')return v.AST??v.ASSISTS;if(stat==='Rebounds')return v.REB??v.REBOUNDS;if(stat==='Receptions')return v.REC??v.RECEPTIONS;if(stat==='Passing Yards'&&!cat.includes('pass'))return undefined;if(stat==='Rushing Yards'&&!cat.includes('rush'))return undefined;if(stat==='Receiving Yards'&&!cat.includes('receiv'))return undefined;return v.YDS??v.YARDS}
export function evaluateRows(rows,league,seasonPct=90,recentPct=100){const results=[];for(const stat of Object.keys(leagues[league].stats)){const filtered=rows.filter(r=>Number.isFinite(statValue(r,stat)));const byGame=new Map();for(const r of filtered)byGame.set(r.id,statValue(r,stat));const analysis=analyze([...byGame.values()],10,seasonPct,recentPct);if(analysis)results.push({stat,...analysis})}return results}
export function seasonFor(league,date){const d=new Date(date+'T12:00:00Z');return league==='NBA'?(d.getUTCMonth()>=9?d.getUTCFullYear()+1:d.getUTCFullYear()):d.getUTCFullYear()}

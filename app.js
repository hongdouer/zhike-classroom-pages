const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const answers=new Map();
function route(){
 const parts=location.hash.slice(1).split('/');const mode=parts[0]==='practice'?'practice':'learn';let index=Number(parts[1]||0);if(!Number.isInteger(index)||index<0||index>=COURSE.length)index=0;
 const ch=COURSE[index];$('#location').textContent=ch.title;document.title=ch.title+' · 知课在线演示';
 document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===mode));
 $('#chapters').innerHTML=COURSE.map((c,i)=>`<a class="${i===index?'active':''}" ${i===index?'aria-current="page"':''} href="#${mode}/${i}">${esc(c.title)}${c.questions.length?`<small>${c.questions.length} 道章节练习</small>`:''}</a>`).join('');
 for(const tab of ['learn','practice']){const a=$('#'+tab+'-tab');a.href='#'+tab+'/'+index;a.classList.toggle('active',mode===tab)}
 $('#chapter-number').textContent=index>0&&index<6?'第 '+index+' / 5 章':ch.title;
 $('#content').innerHTML=`<div class="section-label">${mode==='learn'?'课程学习 · 教学示例':'章节练习 · 即时反馈'}</div><h2>${esc(ch.title)}</h2>`+(mode==='learn'?reading(ch):practice(ch,index));
 $('#chapter-actions').innerHTML=`<a class="btn ${index===0?'disabled':''}" href="#${mode}/${Math.max(0,index-1)}" ${index===0?'aria-disabled="true" tabindex="-1"':''}>← 上一章</a><div>${mode==='learn'&&ch.questions.length?`<a class="btn primary" href="#practice/${index}">本章练习 →</a>`:''}${mode==='practice'?`<a class="btn" href="#learn/${index}">返回本章学习</a>`:''}${index<COURSE.length-1?`<a class="btn" href="#${mode}/${index+1}">下一章 →</a>`:''}</div>`;
 if(mode==='practice')bindQuestions(ch,index);$('#content').scrollTop=0;
}
function reading(ch){return `<article class="reading">${ch.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</article>${ch.questions.length?`<div class="callout"><strong>学完这一章，检验一下理解</strong><p>本章有 ${ch.questions.length} 道与内容对应的练习。先独立判断，再查看解析和课程依据。</p></div>`:'<div class="callout">本节为导学或选读，不计入正式 5 章，也不计入章节题库覆盖率。</div>'}`}
function practice(ch,index){if(!ch.questions.length)return '<div class="no-quiz">本节为导学或选读，没有配套练习。请进入第 1 至第 5 章作答。</div>';return `<div class="practice-summary" id="score"></div>`+ch.questions.map((q,i)=>`<section class="question" data-question="${i}"><div class="chapter-subtitle">${esc(q.topic)}</div><h3>${i+1}. ${esc(q.stem)}</h3><div class="options">${q.options.map((option,j)=>`<label class="option"><input type="radio" name="q${i}" value="${j}" ${answers.get(index+':'+i)===j?'checked':''}><span>${String.fromCharCode(65+j)}. ${esc(option)}</span></label>`).join('')}</div><button type="button" class="primary" ${answers.has(index+':'+i)?'':'disabled'}>检查答案</button><div class="result" aria-live="polite"></div></section>`).join('')}
function bindQuestions(ch,index){
 const score=()=>{const done=ch.questions.filter((_,i)=>answers.has(index+':'+i)).length,correct=ch.questions.filter((q,i)=>answers.get(index+':'+i)===q.correct).length;$('#score').textContent=`本章 ${ch.questions.length} 题 · 已作答 ${done} 题 · 答对 ${correct} 题。记录仅在本次页面内保留，刷新后清除。`};
 document.querySelectorAll('[data-question]').forEach(card=>{const i=Number(card.dataset.question),q=ch.questions[i];const show=()=>{const value=answers.get(index+':'+i);if(value===undefined)return;card.querySelector('.result').innerHTML=`<div class="feedback ${value===q.correct?'':'wrong'}"><strong>${value===q.correct?'回答正确':'再想一想'} · 正确答案：${String.fromCharCode(65+q.correct)}</strong><p>${esc(q.explanation)}</p><details open><summary>课程依据</summary><p>${esc(q.source)}</p></details></div>`};
 card.onchange=()=>{card.querySelector('button').disabled=false;card.querySelector('.result').innerHTML=''};card.querySelector('button').onclick=()=>{const selected=card.querySelector('input:checked');if(!selected)return;answers.set(index+':'+i,Number(selected.value));show();score()};show();});score();
}
window.addEventListener('hashchange',route);route();

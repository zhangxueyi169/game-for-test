import type {Art} from './assets';
export const cheers=[
 ['漂亮通关！','每一枚爪印，都是你的好主意。'],['这条路线，真漂亮！','小猫伸个懒腰，把掌声送给你。'],['小屋被你点亮啦！','绕过弯弯角角，也找到了最暖的归处。'],['好厉害，又一间！','小猫的安心午觉，有你一份功劳。'],['给你一朵小红花！','软垫、转角和猫窝，都安排得刚刚好。'],['今天的路线高手！','这一屋的小爪印，值得好好庆祝。'],['完美收尾，喵！','看，小猫已经放心地打起哈欠啦。'],['你的耐心发光啦！','一步一步，把小房间变成了家。'],['又解开一个小谜题！','聪明的路线，配得上暖暖的拥抱。'],['为你放一场小烟花！','新的小屋，也在等你的好主意。'],['闯关成功，真棒！','把这一刻的成就感好好收藏。'],['转个弯，也有惊喜！','小猫的回家路线，被你找到了。'],['这间暖屋属于你！','爪印铺满了，快乐也装满了。'],['漂亮的一次探索！','小猫摇摇尾巴：下次还想和你一起。'],['完整小房间，拿下！','复杂的转角，也难不倒认真思考的你。'],['挑战又向前一步！','每一次尝试，都在靠近更漂亮的路线。'],['你和小猫，默契满分！','一个好转向，就能打开新的可能。'],['值得骄傲的一关！','这次的坚持，换来了满屋的小爪印。'],['再难的弯，也走过啦！','让烟花替小猫说一句：你真棒。'],['把温暖带回家啦！','先享受这一刻，再去发现下一份惊喜。']
];
export function drawHero(canvas:HTMLCanvasElement,art:Art,elapsed:number,reduced:boolean,result=false){
 const ctx=canvas.getContext('2d');if(!ctx)return;ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,240,220);
 const cycle=elapsed%(result?9500:12500),start=result?450:8000,y=cycle-start;
 let frame=0;if(!reduced){if(y>=0&&y<1500)frame=y<260||y>1210?2:3;else if((cycle>2600&&cycle<2770)||(cycle>5100&&cycle<5290))frame=1;}
 canvas.dataset.expression=frame===3?'yawn':frame===2?'yawn-start':frame===1?'blink':'awake';
 const tailAngle=reduced?0:Math.sin(elapsed/650)*.16;canvas.dataset.tailAngle=tailAngle.toFixed(3);
 if(!art.images.has('CAT-HERO-FACES')){art.draw(ctx,'CAT-HERO',20,10,200,200);return;}
 ctx.save();ctx.translate(145,189);ctx.rotate(tailAngle);art.draw(ctx,'CAT-HERO-TAIL',-8,-110,67,120);ctx.restore();
 const breath=reduced?1:1+.006*Math.sin(elapsed/750);ctx.save();ctx.translate(116,207);ctx.scale(1,breath);art.draw(ctx,'CAT-HERO-FACES',-99,-196,198,196,false,frame);ctx.restore();
}
export function drawFireworks(canvas:HTMLCanvasElement,elapsed:number,reduced:boolean){
 const ctx=canvas.getContext('2d');if(!ctx)return;const w=canvas.width/2,h=canvas.height/2;ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,w,h);
 if(reduced||elapsed>3400)return;const colors=['#df9b42','#dd8c83','#8cab76','#d4b95f'];
 for(let burst=0;burst<5;burst++){const age=elapsed-burst*380;if(age<0||age>1700)continue;const t=age/1700,x=w*[.2,.8,.5,.13,.87][burst],y=h*[.21,.3,.13,.48,.49][burst];
  ctx.globalAlpha=(1-t)**1.3;ctx.strokeStyle=colors[burst%4];ctx.fillStyle=colors[burst%4];ctx.lineWidth=2;
  for(let n=0;n<18;n++){const angle=n*Math.PI*2/18+burst,r=(1-(1-t)**2)*65,px=x+Math.cos(angle)*r,py=y+Math.sin(angle)*r+32*t*t;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-Math.cos(angle)*5*(1-t),py-Math.sin(angle)*5*(1-t));ctx.stroke();ctx.beginPath();ctx.arc(px,py,1.7*(1-t)+.4,0,Math.PI*2);ctx.fill();}
 }ctx.globalAlpha=1;
}

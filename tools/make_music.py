"""Original composed/synthesized cozy loop and soft firework bursts (no sampled music)."""
import math, random, wave, struct, json
from pathlib import Path
root=Path('assets');rate=24000
def write(name, samples, description):
    peak=max(abs(v) for v in samples);scale=min(1,.72/max(peak,1e-9));samples=[v*scale for v in samples]
    p=root/f'production/audio/{name}_v001.wav'
    with wave.open(str(p),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(b''.join(struct.pack('<h',int(v*32767)) for v in samples))
    return {'name':name,'file':str(p.relative_to(root)).replace('\\','/'),'duration_seconds':len(samples)/rate,'sample_rate':rate,'peak':peak*scale,'source':'original composition and procedural synthesis','description':description}
duration=48;music=[0.]*(duration*rate)
def note(midi,start,length,volume,soft=False):
    freq=440*2**((midi-69)/12);offset=round(start*rate)
    for i in range(round(length*rate)):
        t=i/rate;u=t/length;attack=min(1,t/(.045 if soft else .012));release=min(1,(length-t)/.18)
        env=attack*release*math.exp(-t/(1.4 if soft else .65));phase=2*math.pi*freq*t
        tone=math.sin(phase)+(.12 if soft else .23)*math.sin(2*phase)*math.exp(-t*3)+.045*math.sin(3*phase)*math.exp(-t*5)
        # Wrap decays into the next loop so the musical boundary remains continuous.
        music[(offset+i)%len(music)]+=volume*env*tone
chords=[[48,55,59,64],[45,52,55,60],[41,48,52,57],[43,50,55,60]]
melody=[[76,79],[74,72],[72,69],[71,74],[76,79],[81,76],[77,76],[74,71],[79,76],[76,72],[72,77],[74,79],[76,74],[72,69],[69,72],[74,71]]
for bar in range(16):
    chord=chords[bar%4];base=bar*3
    note(chord[0]-12,base,2.9,.075,True)
    for k,n in enumerate([chord[1],chord[2],chord[3],chord[2]]):note(n,base+k*.75,2.1,.06,True)
    for k,n in enumerate(melody[bar]):note(n,base+.375+k*1.5,1.65,.07)
report=[write('bgm_cozy',music,'48秒无缝循环；80 BPM，柔和琴音旋律、分解和弦与低音，无鼓点')]
rng=random.Random(20261028);fire=[0.]*int(rate*3.4)
for burst in range(5):
    start=int(burst*.38*rate);filtered=0
    for i in range(int(1.5*rate)):
        if start+i>=len(fire):break
        t=i/rate;noise=rng.uniform(-1,1);filtered=.91*filtered+.09*noise
        bloom=min(1,t/.018)*math.exp(-t*8)*(.23*filtered+.07*math.sin(2*math.pi*(120-30*t)*t))
        shimmer=.018*math.sin(2*math.pi*(1450+burst*140)*t)*math.exp(-t*4)*min(1,t/.06)
        crackle=.035*filtered*math.exp(-t*3)*(math.sin(2*math.pi*17*t)**8)
        fire[start+i]+=bloom+shimmer+crackle
report.append(write('fireworks',fire,'五次柔和绽放与细碎闪烁，间隔380ms；无尖锐爆炸声'))
p=root/'metadata/audio_manifest.json';old=json.loads(p.read_text(encoding='utf-8'));names={x['name'] for x in report};p.write_text(json.dumps([x for x in old if x['name'] not in names]+report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))

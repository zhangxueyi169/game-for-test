"""Original synthesized feedback, not recorded animal vocalizations."""
import math, random, wave, struct, json
from pathlib import Path
root=Path(__file__).resolve().parents[1]/'assets/production/audio'
root.mkdir(parents=True,exist_ok=True)
rate=24000
sounds={'slide':.32,'paw':.09,'stop':.12,'mat':.18,'yawn':.65,'yawn_alt':.7,'purr':1.2,'complete':.42,'win':.75}
report=[]
for name,duration in sounds.items():
    rng=random.Random(name);phase=0.;filtered=0.;samples=[]
    for i in range(int(rate*duration)):
        t=i/rate;u=t/duration;noise=rng.uniform(-1,1);filtered=.92*filtered+.08*noise
        env=math.sin(math.pi*u)**1.5
        if name.startswith('yawn'):
            # breath + two soft harmonics, round rising/falling vowel-like gesture
            freq=(320 if name=='yawn' else 295)+170*math.sin(math.pi*u)-85*u
            phase+=2*math.pi*freq/rate
            v=env*(.13*math.sin(phase)+.035*math.sin(phase*2)+.055*filtered)
        elif name=='purr':
            v=env*(.07*math.sin(2*math.pi*78*t)+.16*filtered)*(.65+.35*math.sin(2*math.pi*24*t))
        elif name in ('slide','mat','stop'):
            v=env*(filtered*.3+math.sin(2*math.pi*(140 if name=='mat' else 105)*t)*.035)
        elif name=='paw':v=.1*math.sin(2*math.pi*(660-260*u)*t)*math.exp(-u*7)*min(1,u*30)
        else:
            notes=[523.25,659.25,783.99] if name=='win' else [659.25,880]
            part=min(len(notes)-1,int(u*len(notes)));v=.13*math.sin(2*math.pi*notes[part]*t)*env
        samples.append(max(-.95,min(.95,v)))
    path=root/f'{name}_v001.wav'
    with wave.open(str(path),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(b''.join(struct.pack('<h',int(v*32767)) for v in samples))
    report.append({'name':name,'file':str(path.relative_to(root.parent.parent)),'duration_seconds':duration,'sample_rate':rate,'peak':max(abs(v) for v in samples),'source':'original procedural synthesis; not a cat recording'})
(root.parent.parent/'metadata/audio_manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('Wrote',len(report),'original synthesized WAV files')

/* 检查构建产物里是否残留明文密码 / 明文音频路径 */
const fs = require('fs');
const files = ['index.html', 'audio.html', 'wanshitong.html'];
files.forEach(function(f){
    if(!fs.existsSync(f)) return;
    const h = fs.readFileSync(f, 'utf8');
    const hasMp3 = h.indexOf('a1k9f2.mp3') >= 0;
    const hasMq = h.indexOf('MQCEFK') >= 0;
    const has632 = /["']632["']/.test(h);
    const hasEnc = h.indexOf('a1k9f2.enc') >= 0;
    console.log(f,
        '| 明文 MQCEFK:', hasMq,
        '| 明文 632:', has632,
        '| 明文 mp3 路径:', hasMp3,
        '| 密文 enc 引用:', hasEnc);
});

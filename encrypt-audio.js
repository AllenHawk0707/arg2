/* 用密码把音频加密成密文文件（RC4 + SHA-256 派生密钥）
   用法：node encrypt-audio.js
   产物：a1k9f2.enc —— 直接打开是乱码，只有输入正确密码解密后才能播放 */
const fs = require('fs');
const crypto = require('crypto');

const SRC = 'a1k9f2.mp3';        // 原始音频（只留在本地，不上传）
const OUT = 'a1k9f2.enc';        // 加密后的密文（上传这个）
const PWD = 'MQCEFK';

/* ── SHA-256（与网页里用的是同一份实现）── */
function sha256(msg){
    var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
             0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
             0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
             0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
             0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
             0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
             0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
             0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var m = [];
    for(var i = 0; i < msg.length; i++) m.push(msg.charCodeAt(i));
    var l = m.length * 8;
    m.push(0x80);
    while(m.length % 64 !== 56) m.push(0);
    l = l.toString(16);
    while(l.length < 16) l = '0' + l;
    for(i = 0; i < 16; i += 2) m.push(parseInt(l.substr(i, 2), 16));
    for(i = 0; i < m.length; i += 64){
        var w = [];
        for(var t = 0; t < 16; t++){
            w.push((m[i+t*4]<<24)|(m[i+t*4+1]<<16)|(m[i+t*4+2]<<8)|m[i+t*4+3]);
        }
        for(t = 16; t < 64; t++){
            var s0 = ((w[t-15]>>>7)|(w[t-15]<<25)) ^ ((w[t-15]>>>18)|(w[t-15]<<14)) ^ (w[t-15]>>>3);
            var s1 = ((w[t-2]>>>17)|(w[t-2]<<15)) ^ ((w[t-2]>>>19)|(w[t-2]<<13)) ^ (w[t-2]>>>10);
            w.push((w[t-16]+s0+w[t-7]+s1)|0);
        }
        var a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
        for(t = 0; t < 64; t++){
            var S1 = ((e>>>6)|(e<<26)) ^ ((e>>>11)|(e<<21)) ^ ((e>>>25)|(e<<7));
            var ch = (e & f) ^ (~e & g);
            var t1 = (h + S1 + ch + K[t] + w[t])|0;
            var S0 = ((a>>>2)|(a<<30)) ^ ((a>>>13)|(a<<19)) ^ ((a>>>22)|(a<<10));
            var mj = (a & b) ^ (a & c) ^ (b & c);
            var t2 = (S0 + mj)|0;
            h=g; g=f; f=e; e=(d+t1)|0; d=c; c=b; b=a; a=(t1+t2)|0;
        }
        H[0]=(H[0]+a)|0; H[1]=(H[1]+b)|0; H[2]=(H[2]+c)|0; H[3]=(H[3]+d)|0;
        H[4]=(H[4]+e)|0; H[5]=(H[5]+f)|0; H[6]=(H[6]+g)|0; H[7]=(H[7]+h)|0;
    }
    var out = '';
    for(i = 0; i < 8; i++){
        var v = (H[i] >>> 0).toString(16);
        while(v.length < 8) v = '0' + v;
        out += v;
    }
    return out;
}

/* ── RC4 流加密 ── */
function rc4(keyBytes, data){
    var S = [], i, j = 0, t;
    for(i = 0; i < 256; i++) S[i] = i;
    for(i = 0; i < 256; i++){
        j = (j + S[i] + keyBytes[i % keyBytes.length]) & 255;
        t = S[i]; S[i] = S[j]; S[j] = t;
    }
    var out = new Uint8Array(data.length);
    i = 0; j = 0;
    for(var n = 0; n < data.length; n++){
        i = (i + 1) & 255;
        j = (j + S[i]) & 255;
        t = S[i]; S[i] = S[j]; S[j] = t;
        out[n] = data[n] ^ S[(S[i] + S[j]) & 255];
    }
    return out;
}

/* 自测：与 Node 内置 crypto 对比 */
function hexToBytes(hex){
    var a = [];
    for(var i = 0; i < hex.length; i += 2) a.push(parseInt(hex.substr(i, 2), 16));
    return a;
}

['abc', '632', 'MQCEFK'].forEach(function(p){
    var mine = sha256(p);
    var real = crypto.createHash('sha256').update(p).digest('hex');
    console.log('SHA256("' + p + '") 自测:', mine === real ? '通过' : '失败 ' + mine + ' vs ' + real);
});

const raw = fs.readFileSync(SRC);
const key = hexToBytes(sha256(PWD));
const enc = rc4(key, new Uint8Array(raw));
fs.writeFileSync(OUT, Buffer.from(enc));

// 回验：解密后应与原文一致
const back = rc4(key, new Uint8Array(fs.readFileSync(OUT)));
console.log('加密/解密回环一致:', Buffer.compare(Buffer.from(back), raw) === 0);
console.log('原文大小', raw.length, '→ 密文大小', fs.statSync(OUT).size);
console.log('密码哈希(用于其他页面校验):', sha256(PWD));
console.log('密文前8字节(应为乱码):', Buffer.from(enc.slice(0, 8)).toString('hex'));

/* 构建脚本：把本地可读源码混淆后生成线上发布版
   用法：node build.js
   注意：源码文件不上传 GitHub，线上只发布混淆后的产物 */
const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

/* 源码 → 线上文件 的对应关系 */
const TARGETS = [
    { src: '校园闲聊墙.html', out: 'index.html' },
    { src: '校园万事通.html', out: 'wanshitong.html' },
    { src: '音频页.html', out: 'audio.html' }
];

const options = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,        // 必须保留：HTML 里的 onclick 依赖全局函数名
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.85,
    transformObjectKeys: false,  // 必须关闭：localStorage / 云端的字段名不能被改
    unicodeEscapeSequence: false
};

function build(){
    TARGETS.forEach(function(t){
        if(!fs.existsSync(t.src)){ console.log('跳过（源码不存在）:', t.src); return; }
        const src = fs.readFileSync(t.src, 'utf8');
        const re = /<script>([\s\S]*?)<\/script>/;
        const m = src.match(re);
        if(!m){ console.error(t.src, '未找到 script 块'); return; }

        const before = m[1].length;
        const obfuscated = JavaScriptObfuscator.obfuscate(m[1], options).getObfuscatedCode();
        fs.writeFileSync(t.out, src.replace(re, () => '<script>' + obfuscated + '</script>'), 'utf8');

        // 语法自检
        const check = fs.readFileSync(t.out, 'utf8').match(re);
        try { new Function(check[1]); } catch(e){ console.error(t.out, '输出语法错误:', e.message); process.exit(1); }

        console.log(t.src, '→', t.out,
            '| JS', before, '→', obfuscated.length,
            '| 页面', (fs.statSync(t.out).size / 1024).toFixed(1), 'KB');
    });
    console.log('全部构建完成，语法自检通过');
}

build();

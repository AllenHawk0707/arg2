/* 构建脚本：把 校园闲聊墙.html（本地源码）混淆后生成 index.html（线上发布版）
   用法：node build.js
   注意：源码文件不上传 GitHub，线上只发布混淆后的 index.html */
const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const SRC = '校园闲聊墙.html';
const OUT = 'index.html';

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
    const src = fs.readFileSync(SRC, 'utf8');
    const re = /<script>([\s\S]*?)<\/script>/;
    const m = src.match(re);
    if(!m){ console.error('未找到 script 块'); process.exit(1); }

    const before = m[1].length;
    const obfuscated = JavaScriptObfuscator.obfuscate(m[1], options).getObfuscatedCode();
    const html = src.replace(re, () => '<script>' + obfuscated + '</script>');
    fs.writeFileSync(OUT, html, 'utf8');

    // 语法自检
    const check = fs.readFileSync(OUT, 'utf8').match(re);
    try { new Function(check[1]); } catch(e){ console.error('输出语法错误:', e.message); process.exit(1); }

    console.log('原始 JS:', before, '字符');
    console.log('混淆后 :', obfuscated.length, '字符');
    console.log('index.html 总大小:', (fs.statSync(OUT).size/1024).toFixed(1), 'KB');
    console.log('语法自检通过');
}

build();

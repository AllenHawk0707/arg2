/* 冒烟测试：音频页加密体系
   1) 内置 SHA-256 是否与标准一致
   2) 密码错误 → 解密校验失败提示
   3) 密码正确 → 从线上拉取密文解密后生成 blob 播放地址 */
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => {
    const m = e.message || '';
    if(/HTMLMediaElement|navigation|Error: Cross origin|Not implemented/i.test(m)) return;
    errors.push('jsdomError: ' + m);
});
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

const dom = new JSDOM(fs.readFileSync('audio.html', 'utf8'), {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'https://allenhawk0707.github.io/arg2/audio.html',
    virtualConsole: vc
});
const d = dom.window.document;

function type(v){
    var inp = d.getElementById('pw-input');
    inp.value = v;
    inp.dispatchEvent(new dom.window.Event('input'));
}

setTimeout(function(){
    console.log('标题:', d.title);
    console.log('下划线数量:', d.querySelectorAll('.pw-slot').length);

    // 1) 内置哈希实现自测
    console.log('SHA256("abc") 正确:', dom.window.sha256('abc') ===
        'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    console.log('SHA256("632") 正确:', dom.window.sha256('632') ===
        '3bcc1340d90b3d55accb9a57998b69708fea2a63c39f7369047469f952ccad4f');

    // 2) 位数不足
    type('MQC');
    dom.window.submitPw();
    console.log('位数不足提示:', d.getElementById('pw-error').textContent);

    // 3) 错误密码：解密校验失败
    type('AAAAAA');
    dom.window.submitPw();
    setTimeout(function(){
        console.log('错误密码提示:', d.getElementById('pw-error').textContent);
        console.log('错误密码后播放器隐藏:', d.getElementById('player-box').style.display === 'none');

        // 4) 正确密码：拉取密文并解密
        type('MQCEFK');
        dom.window.submitPw();
        setTimeout(function(){
            var player = d.getElementById('audio-player');
            console.log('解密后播放地址(应为 blob:):', (player.getAttribute('src') || '').slice(0, 12));
            console.log('密码框已隐藏:', d.getElementById('pw-box').style.display === 'none');
            console.log('提示文字:', d.getElementById('audio-msg').textContent || '(空)');
            console.log('错误提示:', d.getElementById('pw-error').textContent || '(空)');
            console.log('运行期错误:', errors.length ? errors : '无');
            process.exit(0);
        }, 4500);
    }, 4500);
}, 900);

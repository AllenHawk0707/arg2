/* 冒烟测试：加载混淆版 audio.html，验证二维码与密码解锁 */
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => {
    const m = e.message || '';
    if(/HTMLMediaElement|navigation/i.test(m)) return;   // jsdom 不支持真实播放/跳转，忽略
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
    console.log('页面内是否含二维码(应为 false):', !!d.querySelector('.qr-img'),
        '| HTML 里是否残留 qr-audio 引用:', d.body.innerHTML.indexOf('qr-audio') >= 0);
    console.log('下划线数量:', d.querySelectorAll('.pw-slot').length);

    // 错误密码
    type('ABCDEF');
    dom.window.submitPw();
    console.log('错误密码提示:', d.getElementById('pw-error').textContent);
    console.log('错误密码后播放器隐藏:', d.getElementById('player-box').style.display === 'none');

    // 位数不足
    type('MQC');
    dom.window.submitPw();
    console.log('位数不足提示:', d.getElementById('pw-error').textContent);

    // 正确密码（小写也应通过，会自动转大写）
    type('mqcefk');
    dom.window.submitPw();
    console.log('正确密码后输入框已隐藏:', d.getElementById('pw-box').style.display === 'none');
    console.log('播放器已显示:', d.getElementById('player-box').style.display !== 'none');
    console.log('音频源:', d.getElementById('audio-player').getAttribute('src'));
    console.log('输入字符被转为大写:', d.getElementById('pw-input').value);

    console.log('返回墙墙链接:', d.querySelector('.statusbar a').getAttribute('href'));
    console.log('运行期错误:', errors.length ? errors : '无');
    process.exit(0);
}, 900);

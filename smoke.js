/* 用 jsdom 真实加载 index.html，检查是否报错、帖子是否正常渲染 */
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.message || e)));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'https://allenhawk0707.github.io/arg2/',
    virtualConsole: vc
});

setTimeout(function(){
    const d = dom.window.document;
    const posts = d.querySelectorAll('.wall-post').length;
    const clsBtns = d.querySelectorAll('.cls-btn').length;
    const cls11 = d.getElementById('cls-11');
    const reportBtn = d.querySelector('.report-btn');
    const mode = d.querySelector('.mode-label');
    const title = d.querySelector('.mode-label') ? d.querySelector('.mode-label').textContent : '';
    console.log('渲染帖子数:', posts);
    console.log('班级按钮数:', clsBtns, '(含隐藏的十一班)');
    console.log('十一班默认显示:', cls11 ? cls11.style.display !== 'none' : '元素缺失');
    console.log('报告问题按钮:', !!reportBtn);
    console.log('版本号文本:', title);
    console.log('全局函数 filterClass:', typeof dom.window.filterClass);
    console.log('全局函数 rollbackVersion:', typeof dom.window.rollbackVersion);
    console.log('全局函数 openReport:', typeof dom.window.openReport);

    // 模拟：打开报告 → 输入 25 字 → 提交 → 回退
    try {
        dom.window.openReport();
        const ta = d.getElementById('report-input');
        ta.value = '这是一条用于测试回退流程的反馈内容，长度肯定超过二十个字啦。';
        dom.window.submitReport();
        const rb = d.getElementById('report-rollback');
        console.log('提交后回退按钮显示:', rb && rb.style.display !== 'none');
        dom.window.rollbackVersion();
        console.log('回退后版本号:', d.querySelector('.mode-label').textContent);
        console.log('回退后十一班显示:', d.getElementById('cls-11').style.display !== 'none');
        console.log('回退后当前班级:', d.querySelector('.cls-btn.active') ? d.querySelector('.cls-btn.active').textContent : '(无)');
        // 手动点十一班，确认帖子能渲染出来
        dom.window.filterClass(11, d.getElementById('cls-11'));
        console.log('切到十一班后帖子数:', d.querySelectorAll('.wall-post').length);
        console.log('当前视图是否无权限:', !!d.querySelector('.no-perm'));
    } catch(e){ errors.push('交互测试异常: ' + e.message); }

    // 漂流瓶：错误密码 → 关闭页面；正确密码 → 黑屏白球
    try {
        dom.window.openBottle();
        console.log('渡口弹窗打开:', d.getElementById('bottle-mask').classList.contains('on'));
        console.log('标题:', d.getElementById('bottle-title').textContent);
        var bp = d.getElementById('bottle-pwd');
        bp.value = '63';
        bp.dispatchEvent(new dom.window.Event('input'));
        console.log('输入两位后已填下划线数:', d.querySelectorAll('#dukou-slots .dukou-slot.filled').length);
        // 注意：错误密码测试必须放在最后 —— jsdom 的 window.close() 会停掉该窗口所有定时器
        dom.window.enterBottle();
        console.log('黑屏场景存在:', !!d.getElementById('bottle-scene'));
        console.log('白球存在:', !!d.querySelector('#bottle-scene .ball'));
    } catch(e){ errors.push('漂流瓶测试异常: ' + e.message); }

    console.log('运行期错误:', errors.length ? errors : '无');

    // 等进入黑屏后 7.7s 的崩溃序列
    setTimeout(function(){
        var ballEl = d.querySelector('#bottle-scene .ball');
        console.log('白球已变红:', !!(ballEl && ballEl.classList.contains('red')));
        console.log('红色乱码层出现:', !!d.querySelector('.dukou-noise'));
        console.log('场景崩溃状态:', (d.getElementById('bottle-scene') || {}).classList ?
            d.getElementById('bottle-scene').classList.contains('crash') : false);

        // 最后再测错误密码（会触发 window.close，jsdom 下定时器失效）
        dom.window.openBottle();
        d.getElementById('bottle-pwd').value = '111';
        dom.window.submitBottle();
        console.log('错误密码后弹窗已关:', !d.getElementById('bottle-mask').classList.contains('on'));
        process.exit(0);
    }, 11000);
}, 2500);

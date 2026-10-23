/* 冒烟测试：加载线上混淆版 wanshitong.html，验证搜索功能 */
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.message || e)));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

const dom = new JSDOM(fs.readFileSync('wanshitong.html', 'utf8'), {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'https://allenhawk0707.github.io/arg2/wanshitong.html',
    virtualConsole: vc
});
const d = dom.window.document;

function search(kw){
    d.getElementById('kw').value = kw;
    dom.window.doSearch();
    return d.querySelectorAll('.news-card').length;
}

setTimeout(function(){
    console.log('标题:', d.title);
    console.log('总收录数:', d.getElementById('total-count').textContent);
    console.log('初始空状态:', d.getElementById('empty').textContent);

    ['食堂', '食品安全', '秦主任', '冷库', '医务室', '后勤处', '专项检查', '通知'].forEach(function(k){
        console.log('搜索「' + k + '」→', search(k), '条');
    });

    console.log('搜索「火星殖民地」→', search('火星殖民地'), '条');
    console.log('无结果提示:', d.getElementById('empty').textContent);

    search('秦主任');
    var card = d.querySelector('.news-card');
    console.log('结果板块:', card ? card.querySelector('.news-section').textContent : '(无)');
    console.log('结果标题:', card ? card.querySelector('.news-title').textContent : '(无)');
    console.log('高亮命中数:', card ? card.querySelectorAll('mark').length : 0);

    console.log('返回墙墙链接:', (d.querySelector('.statusbar a') || {}).getAttribute ?
        d.querySelector('.statusbar a').getAttribute('href') : '(无)');
    console.log('运行期错误:', errors.length ? errors : '无');
    process.exit(0);
}, 1200);

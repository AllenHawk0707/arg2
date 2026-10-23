/* 冒烟测试：加载线上混淆版 wanshitong.html，验证搜索与展示 */
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

    // 原有 + 新增关键词
    ['食堂', '秦主任', '冷库',
     '监控', '后巷', '摄像头', '保卫处',
     '表彰', '信息员', '德育处', '周某某',
     '篮球', '比分', '篮球社',
     '发帖规范', '封号', '网络中心',
     '转学', '郭明轩', '学号33', '教务处'].forEach(function(k){
        console.log('搜索「' + k + '」→', search(k), '条');
    });

    console.log('搜索「火星殖民地」→', search('火星殖民地'), '条');
    console.log('无结果提示:', d.getElementById('empty').textContent);

    // 板块字样应已删除
    search('食堂');
    console.log('是否残留板块标签:', !!d.querySelector('.news-section'));
    console.log('是否残留「板块二」字样:', /板块二|后勤保障/.test(d.getElementById('news-list').textContent));

    // 名字涂抹
    search('周某某');
    var cards = d.querySelectorAll('.news-card');
    console.log('表彰公告卡片数:', cards.length);
    console.log('涂抹块数量:', d.querySelectorAll('.redacted').length);
    var r = d.querySelector('.redacted');
    console.log('涂抹块内容/样式:', r ? r.textContent + ' / ' + dom.window.getComputedStyle(r).color : '(无)');

    // 发布时间应渲染为黑块
    search('郭明轩');
    var blk = d.querySelector('.blk');
    console.log('黑块数量:', d.querySelectorAll('.blk').length);
    console.log('黑块内容/底色/文字色:', blk ? (blk.textContent + ' / ' +
        dom.window.getComputedStyle(blk).backgroundColor + ' / ' +
        dom.window.getComputedStyle(blk).color) : '(无)');

    console.log('返回墙墙链接:', (d.querySelector('.statusbar a') || {}).getAttribute ?
        d.querySelector('.statusbar a').getAttribute('href') : '(无)');
    console.log('运行期错误:', errors.length ? errors : '无');
    process.exit(0);
}, 1200);

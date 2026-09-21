const K='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2Vsd2lzcGFhampteXNhd3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODkwMDYsImV4cCI6MjEwNTU2NTAwNn0.PDvjM3_jei5Tf8z8FkSh2s4QlwK3R08JgSFEKLucrNg';
const H={apikey:K,Authorization:'Bearer '+K};
(async()=>{
  // 完整模拟公开页的数据加载
  let r = await fetch('https://umgelwispaajjmysawrn.supabase.co/rest/v1/posts?select=*&approved=eq.true&order=posted_at.desc&limit=100',{headers:H});
  console.log('posts → HTTP', r.status, (await r.text()).slice(0,200));
  r = await fetch('https://umgelwispaajjmysawrn.supabase.co/rest/v1/replies?select=*&order=created_at.asc&limit=1000',{headers:H});
  console.log('replies → HTTP', r.status, (await r.text()).slice(0,200));
  // 模拟发帖（测插入策略是否已修复）
  r = await fetch('https://umgelwispaajjmysawrn.supabase.co/rest/v1/posts',{
    method:'POST',headers:{...H,'Content-Type':'application/json',Prefer:'return=representation'},
    body:JSON.stringify({name:'诊断',tag:'chat',title:'发帖测试(可忽略)',content:'测试',likes:0,posted_at:Date.now(),approved:false})
  });
  console.log('发帖测试 → HTTP', r.status, (await r.text()).slice(0,200));
})().catch(e=>console.log('ERR',e.message));

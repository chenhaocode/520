export async function onRequestPost(context) {
    const { DB, CONFESS_CACHE_KV } = context.env;
    const {id,status,msg} = await context.request.json();
    if(!id || !status) return new Response(JSON.stringify({error:"参数错误"}),{status:400});

    // 更新数据库
    await DB.prepare(`UPDATE confession SET status = ?, reply = ?, replyTime = ? WHERE id = ?`)
    .bind(status,msg,Date.now(),id)
    .run();

    // 更新缓存
    const newData = await DB.prepare("SELECT * FROM confession WHERE id = ?").bind(id).first();
    await CONFESS_CACHE_KV.put(id,JSON.stringify(newData),{expirationTtl:86400});

    return new Response(JSON.stringify({success:true}),{headers:{"Content-Type":"application/json"}});
}

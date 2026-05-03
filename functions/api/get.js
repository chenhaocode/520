export async function onRequestGet(context) {
    const { DB, CONFESS_CACHE_KV } = context.env;
    const id = new URL(context.request.url).searchParams.get("id");
    if(!id) return new Response(JSON.stringify({error:"参数错误"}),{status:400});

    // 优先读取KV缓存
    let cache = await CONFESS_CACHE_KV.get(id);
    if(cache) return new Response(cache,{headers:{"Content-Type":"application/json"}});

    // 缓存失效，读取D1
    const data = await DB.prepare("SELECT * FROM confession WHERE id = ?").bind(id).first();
    if(!data) return new Response(JSON.stringify({error:"不存在"}),{status:404});

    // 重新写入缓存
    await CONFESS_CACHE_KV.put(id,JSON.stringify(data),{expirationTtl:86400});
    return new Response(JSON.stringify(data),{headers:{"Content-Type":"application/json"}});
}

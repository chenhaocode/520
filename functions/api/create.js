export async function onRequestPost(context) {
    const { DB, CONFESS_CACHE_KV } = context.env;
    const body = await context.request.json();
    const { from, to, content } = body;

    if(!from || !to || !content){
        return new Response(JSON.stringify({error:"参数不全"}),{
            headers:{"Content-Type":"application/json"},status:400
        })
    }

    // 生成6位唯一ID
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id;
    do{
        id = Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
        const exist = await DB.prepare("SELECT id FROM confession WHERE id = ?").bind(id).first();
    }while(exist);

    // D1写入数据
    await DB.prepare(`INSERT INTO confession (id,fromName,toName,content,status,reply,createTime) VALUES (?,?,?,?,?,?,?)`)
    .bind(id,from,to,content,"pending","",Date.now())
    .run();

    // KV缓存
    await CONFESS_CACHE_KV.put(id,JSON.stringify({
        id,from,to,content,status:"pending",reply:""
    }),{expirationTtl:86400});

    return new Response(JSON.stringify({id}),{
        headers:{"Content-Type":"application/json"}
    })
}

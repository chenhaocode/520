export async function onRequestPost(context) {
    const { DB, ADMIN_PASSWORD, CONFESS_CACHE_KV } = context.env;
    const {pwd,delId} = await context.request.json();

    // 权限校验
    if(pwd !== ADMIN_PASSWORD){
        return new Response(JSON.stringify({error:"管理员密码错误"}),{status:401,headers:{"Content-Type":"application/json"}})
    }

    // 删除操作
    if(delId){
        await DB.prepare("DELETE FROM confession WHERE id = ?").bind(delId).run();
        await CONFESS_CACHE_KV.delete(delId);
        return new Response(JSON.stringify({success:true}),{headers:{"Content-Type":"application/json"}});
    }

    // 查询全部列表
    const list = await DB.prepare("SELECT * FROM confession ORDER BY createTime DESC").all();
    return new Response(JSON.stringify({list:list.results}),{headers:{"Content-Type":"application/json"}});
}

export async function onRequestPost(context) {
    const { CONFESSIONS_KV, ADMIN_PASSWORD } = context.env;
    const body = await context.request.json();

    // 验证管理员密码
    if (body.password !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: '管理员密码错误' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 401
        });
    }

    // 生成随机6位ID
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id;
    do {
        id = '';
        for (let i = 0; i < 6; i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }
    } while (await CONFESSIONS_KV.get(id)); // 确保ID不重复

    // 保存数据
    const data = {
        id,
        from: body.from,
        to: body.to,
        content: body.content,
        createdAt: Date.now(),
        status: 'pending',
        message: '',
        respondedAt: null
    };

    await CONFESSIONS_KV.put(id, JSON.stringify(data));

    return new Response(JSON.stringify({ id }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

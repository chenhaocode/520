export async function onRequestPost(context) {
    const { CONFESSIONS_KV } = context.env;
    const id = context.params.id;
    const body = await context.request.json();

    const existing = await CONFESSIONS_KV.get(id);
    if (!existing) {
        return new Response(JSON.stringify({ error: 'Not found' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 404
        });
    }

    const data = JSON.parse(existing);
    data.status = body.status;
    data.message = body.message;
    data.respondedAt = Date.now();

    await CONFESSIONS_KV.put(id, JSON.stringify(data));

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
export async function onRequestGet(context) {
    const { CONFESSIONS_KV } = context.env;
    const id = context.params.id;

    const data = await CONFESSIONS_KV.get(id);
    if (!data) {
        return new Response(JSON.stringify({ error: 'Not found' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 404
        });
    }

    return new Response(data, {
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequest(context) {
    if (context.request.method !== "GET") {
      return new Response("Invalid request method", { status: 405 });
    }
    return new Response();
  }

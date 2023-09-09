import { Database } from "bun:sqlite"
import { Todos, type Todo } from "./todos"

const todosController = new Todos(
  new Database('todos.sqlite')
)

todosController.createTable()

const server = Bun.serve({
  port: process.env.PORT || 8080,
  // hostname: "localhost",
  fetch: handler
})

const RenderTodos = (todos: Todo[]) => `<ul>${todos.map(todo => `<li>${todo.text}</li>`).join('')}</ul>`

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)

  if (url.pathname === '' || url.pathname === '/')
    return new Response(Bun.file("index.html"))

  if (url.pathname === '/todos' && request.method === 'POST') {
    const { todo } = await request.json()
    if (!todo?.length) return new Response('Invalid input', { status: 500 })
    todosController.add(todo)
    const todos = todosController.list()
    return new Response(RenderTodos(todos), { headers: { "Content-Type": "text/html" } })
  }

  if (request.method === "GET" && url.pathname === "/todos") {
    const todos = todosController.list()
    return new Response(RenderTodos(todos), { headers: { "Content-Type": "text/html" } })
  }
  return new Response("NotFound", { status: 404 })
}

Bun.write(Bun.stdout, `Server is listening on http://${server.hostname}:${server.port}\n`)
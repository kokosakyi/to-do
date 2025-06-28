import { redirect, type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";



export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};


// Simple in-memory data store
let todos: Array<{ id: string, text: string, completed: boolean }> = [
  { id: "1", text: "Learn Remix", completed: false },
  { id: "2", text: "Build a to-do app", completed: false },
  { id: "3", text: "Deploy to production", completed: false },
];

export const loader = async () => {
  return ({ todos });
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "add") {
    const text = formData.get("text");
    if (typeof text === "string" && text.trim()) {
      const newTodo = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
      };
      todos.push(newTodo);
    }
  } else if (action === "toggle") {
    const id = formData.get("id");
    if (typeof id === "string") {
      const todo = todos.find((t) => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    }
  } else if (action === "delete") {
    const id = formData.get("id");
    if (typeof id === "string") {
      todos = todos.filter((t) => t.id !== id);
    }
  }

  return redirect("/");
}


export default function Index() {
  const { todos } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isAdding = navigation.formData?.get("_action") === "add";

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">To-Do App</h1>
          <p className="mt-2 text-gray-600">
            {completedCount} of {totalCount} tasks completed
          </p>
        </div>

        {/* Add new todo form */}
        <Form method="post" className="mb-6">
          <input type="hidden" name="_action" value="add" />
          <div className="flex gap-2">
            <input
              type="text"
              name="text"
              placeholder="Add a new task..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={isAdding}
              required
            />
            <button
              type="submit"
              disabled={isAdding}
              className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            >
              {isAdding ? "Adding..." : "Add"}
            </button>
          </div>
        </Form>

        {/* Todo list */}
        <div className="space-y-2">
          {todos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No tasks yet. Add one above!
            </p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
              >
                {/* Toggle completed */}
                <Form method="post" className="flex-shrink-0">
                  <input type="hidden" name="_action" value="toggle" />
                  <input type="hidden" name="id" value={todo.id} />
                  <button
                    type="submit"
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center ${todo.completed
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 hover:border-green-400"
                      }`}
                  >
                    {todo.completed && (
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </Form>

                {/* Todo text */}
                <span
                  className={`flex-1 ${todo.completed
                    ? "text-gray-500 line-through"
                    : "text-gray-800"
                    }`}
                >
                  {todo.text}
                </span>

                {/* Delete button */}
                <Form method="post" className="flex-shrink-0">
                  <input type="hidden" name="_action" value="delete" />
                  <input type="hidden" name="id" value={todo.id} />
                  <button
                    type="submit"
                    className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                    title="Delete task"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </Form>
              </div>
            ))
          )}
        </div>

        {/* Statistics */}
        {todos.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{todos.filter((t) => !t.completed).length} remaining</span>
              <span>{completedCount} completed</span>
            </div>
            {completedCount > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


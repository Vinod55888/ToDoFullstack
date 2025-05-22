"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, Check, X, RefreshCw, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  created_at: string
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodoTitle, setNewTodoTitle] = useState("")
  const [newTodoDescription, setNewTodoDescription] = useState("")
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryResult, setSummaryResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/todos")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTodos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching todos:", error)
      toast({
        title: "Error",
        description: "Failed to fetch todos",
        variant: "destructive",
      })
      setTodos([]) // Ensure todos is always an array even on error
    } finally {
      setIsLoading(false)
    }
  }

  const addTodo = async () => {
    if (!newTodoTitle.trim()) {
      toast({
        title: "Error",
        description: "Todo title cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTodoTitle,
          description: newTodoDescription,
        }),
      })

      if (response.ok) {
        setNewTodoTitle("")
        setNewTodoDescription("")
        fetchTodos()
        toast({
          title: "Success",
          description: "Todo added successfully",
        })
      } else {
        throw new Error("Failed to add todo")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add todo",
        variant: "destructive",
      })
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTodos()
        toast({
          title: "Success",
          description: "Todo deleted successfully",
        })
      } else {
        throw new Error("Failed to delete todo")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      })
    }
  }

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo)
  }

  const cancelEditing = () => {
    setEditingTodo(null)
  }

  const saveTodo = async () => {
    if (!editingTodo) return

    try {
      const response = await fetch(`/api/todos/${editingTodo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingTodo.title,
          description: editingTodo.description,
          completed: editingTodo.completed,
        }),
      })

      if (response.ok) {
        setEditingTodo(null)
        fetchTodos()
        toast({
          title: "Success",
          description: "Todo updated successfully",
        })
      } else {
        throw new Error("Failed to update todo")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      })
    }
  }

  const toggleTodoStatus = async (todo: Todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...todo,
          completed: !todo.completed,
        }),
      })

      if (response.ok) {
        fetchTodos()
      } else {
        throw new Error("Failed to update todo status")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update todo status",
        variant: "destructive",
      })
    }
  }

  const summarizeTodos = async () => {
    const pendingTodos = Array.isArray(todos) ? todos.filter((todo) => !todo.completed) : []

    if (pendingTodos.length === 0) {
      toast({
        title: "No pending todos",
        description: "There are no pending todos to summarize",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSummarizing(true)
      setSummaryResult(null)

      const response = await fetch("/api/summarize", {
        method: "POST",
      })

      const data = await response.json()

      setSummaryResult({
        success: response.ok,
        message: response.ok
          ? "Summary successfully sent to Slack!"
          : data.error || "Failed to generate and send summary",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Todo summary sent to Slack successfully",
        })
      } else {
        throw new Error(data.error || "Failed to generate and send summary")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSummarizing(false)
    }
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-center">Todo Summary Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Todo title"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                className="w-full"
              />
              <Textarea
                placeholder="Todo description (optional)"
                value={newTodoDescription}
                onChange={(e) => setNewTodoDescription(e.target.value)}
                className="w-full"
              />
              <Button onClick={addTodo} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Todo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Todos</h2>
        <Button
          onClick={summarizeTodos}
          disabled={isSummarizing || !Array.isArray(todos) || todos.filter((todo) => !todo.completed).length === 0}
          variant="default"
        >
          {isSummarizing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Summarizing...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Summarize & Send to Slack
            </>
          )}
        </Button>
      </div>

      {summaryResult && (
        <Alert
          className={`mb-4 ${summaryResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
        >
          <AlertDescription>{summaryResult.message}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : todos.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No todos yet. Add your first todo above!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {todos.map((todo) => (
            <Card key={todo.id} className={todo.completed ? "opacity-70" : ""}>
              <CardContent className="p-4">
                {editingTodo && editingTodo.id === todo.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editingTodo.title}
                      onChange={(e) =>
                        setEditingTodo({
                          ...editingTodo,
                          title: e.target.value,
                        })
                      }
                      className="w-full"
                    />
                    <Textarea
                      value={editingTodo.description}
                      onChange={(e) =>
                        setEditingTodo({
                          ...editingTodo,
                          description: e.target.value,
                        })
                      }
                      className="w-full"
                    />
                    <div className="flex space-x-2">
                      <Button onClick={saveTodo} size="sm" variant="default">
                        <Check className="mr-1 h-4 w-4" /> Save
                      </Button>
                      <Button onClick={cancelEditing} size="sm" variant="outline">
                        <X className="mr-1 h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${todo.completed ? "line-through" : ""}`}>{todo.title}</h3>
                        <Badge variant={todo.completed ? "outline" : "default"}>
                          {todo.completed ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                      {todo.description && (
                        <p className={`text-sm text-muted-foreground ${todo.completed ? "line-through" : ""}`}>
                          {todo.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(todo.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button onClick={() => toggleTodoStatus(todo)} size="icon" variant="ghost">
                        <Check className={`h-4 w-4 ${todo.completed ? "text-green-500" : ""}`} />
                      </Button>
                      <Button onClick={() => startEditing(todo)} size="icon" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => deleteTodo(todo.id)} size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Toaster />
    </main>
  )
}

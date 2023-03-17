import dateFormat from 'dateformat'
import update from 'immutability-helper'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Button, Checkbox, Divider, Grid, Header, Icon, Image, Input, Loader } from 'semantic-ui-react'
import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import { getIdToken } from '../auth/Auth'
import { Todo } from '../types/Todo'
import EditTodo from './EditTodo'

interface TodosProps {
}

export default function Todos(props: TodosProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentTodo, setCurrentTodo] = useState<Todo>();
  const [newTodoName, setNewTodoName] = useState<string>('');
  const [loadingTodos, setLoadingTodos] = useState<boolean>(true);

  useEffect(() => {
    fetchTodos();
  }, [props])

  const fetchTodos = async () => {
    try {
      const fetchedTodos = await getTodos(getIdToken())
      setTodos(fetchedTodos)
      setLoadingTodos(false)
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }
  const onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = calculateDueDate()
      const newTodo = await createTodo(getIdToken(), {
        name: newTodoName,
        dueDate
      })
      setTodos([...todos, newTodo])
      setNewTodoName('')
    } catch {
      alert('Todo creation failed')
    }
  }


  const onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(getIdToken(), todoId)
      setTodos(todos.filter(todo => todo.todoId !== todoId))
    } catch {
      alert('Todo deletion failed')
    }
  }

  const onTodoCheck = async (pos: number) => {
    try {
      const todo = todos[pos]
      await patchTodo(getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      setTodos(update(todos, {
        [pos]: { done: { $set: !todo.done } }
      }))
    } catch {
      alert('Todo deletion failed')
    }
  }

  const calculateDueDate = (): string => {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }

  const onEditFinished = (refresh = false) => {
    setCurrentTodo(undefined);
    if (refresh)
      fetchTodos();
  }

  return (
    <div>
      <Header as="h1">TODOs</Header>
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{ color: 'green', labelPosition: 'left', icon: 'add', content: 'Add', onClick: onTodoCreate, disabled: !newTodoName?.length }}
            fluid
            placeholder="Type here to create a new item.."
            onChange={event => setNewTodoName(event.target.value)}
            value={newTodoName}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>

      {loadingTodos
        ? <Grid.Row>
          <Loader indeterminate active inline="centered">
            Loading TODOs
          </Loader>
        </Grid.Row>
        : <Grid padded>
          {todos.map((todo, pos) => {
            return (
              <Grid.Row key={todo.todoId}>
                <Grid.Column width={1} verticalAlign="middle">
                  <Checkbox
                    onChange={() => onTodoCheck(pos)}
                    checked={todo.done}
                  />
                </Grid.Column>
                <Grid.Column width={10} verticalAlign="middle">
                  {todo.name}
                </Grid.Column>
                <Grid.Column width={3} floated="right">
                  {todo.dueDate}
                </Grid.Column>
                <Grid.Column width={1} floated="right">
                  <Button icon color="blue" onClick={() => setCurrentTodo(todo)}>
                    <Icon name="pencil" />
                  </Button>
                </Grid.Column>
                <Grid.Column width={1} floated="right">
                  <Button icon color="red" onClick={() => onTodoDelete(todo.todoId)}>
                    <Icon name="delete" />
                  </Button>
                </Grid.Column>
                {todo.attachmentUrl && (
                  <Image src={todo.attachmentUrl} size="small" wrapped />
                )}
                <Grid.Column width={16}>
                  <Divider />
                </Grid.Column>
              </Grid.Row>
            )
          })}
          <EditTodo
            isOpen={!!currentTodo}
            onClose={(refresh: boolean) => onEditFinished(refresh)}
            onSubmit={(refresh: boolean) => onEditFinished(refresh)}
            todo={currentTodo}
          />
        </Grid>
      }
    </div>
  )
}

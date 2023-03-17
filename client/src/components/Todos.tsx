import dateFormat from 'dateformat'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Button, Divider, Grid, Header, Icon, Image, Input, Loader } from 'semantic-ui-react'
import { createTodo, deleteTodo, getTodos } from '../api/todos-api'
import { getIdToken } from '../auth/Auth'
import { Todo } from '../types/Todo'
import EditTodo from './EditTodo'

interface TodoItemProps {
  todo: Todo,
  onEdit: any,
  onDelete: any
}

export default function Todos(props: any) {
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
          {todos.map(todo =>
            <TodoItem key={todo.todoId} todo={todo}
              onEdit={() => setCurrentTodo(todo)}
              onDelete={() => onTodoDelete(todo.todoId)}
            />
          )}
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

const TodoItem = ({ todo, onEdit, onDelete }: TodoItemProps) => (
  <Grid.Row >
    <Grid.Column width={5} verticalAlign="middle" floated="left">
      <div>
        <strong>Name:</strong> {todo.name}
      </div>
      <div>
        <strong>Birthday:</strong> {todo.dueDate}
      </div>
    </Grid.Column>
    <Grid.Column width={3} floated="left">
      {todo.attachmentUrl && (
        <Image src={todo.attachmentUrl} size="small" wrapped />
      )}
    </Grid.Column>
    <Grid.Column floated="right">
      <Button icon color="blue" onClick={onEdit} title="Edit">
        <Icon name="pencil" />
      </Button>
      <Button icon color="red" onClick={onDelete} title="Delete">
        <Icon name="delete" />
      </Button>
    </Grid.Column>
    <Grid.Column width={16}>
      <Divider />
    </Grid.Column>
  </Grid.Row>
)
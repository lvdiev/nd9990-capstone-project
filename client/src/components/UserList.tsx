import dateFormat from 'dateformat'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Button, Divider, Grid, Header, Icon, Image, Input, Loader } from 'semantic-ui-react'
import { createUser, deleteUser, getUsers } from '../api/user-api'
import { getIdToken } from '../auth/Auth'
import { User } from '../types/User'
import EditUser from './EditUser'

interface UserItemProps {
  user: User,
  onEdit: any,
  onDelete: any
}

export default function Users(props: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>();
  const [newUserName, setNewUserName] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);

  useEffect(() => {
    fetchUsers();
  }, [props])

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getUsers(getIdToken())
      setUsers(fetchedUsers)
      setLoadingUsers(false)
    } catch (e) {
      alert(`Failed to fetch users: ${(e as Error).message}`)
    }
  }
  const onUserCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newUser = await createUser(getIdToken(), {
        name: newUserName,
        joinDate: dateFormat(new Date(), 'yyyy-mm-dd') as string
      })
      setUsers([...users, newUser])
      setNewUserName('')
    } catch {
      alert('User creation failed')
    }
  }


  const onUserDelete = async (userId: string) => {
    try {
      await deleteUser(getIdToken(), userId)
      setUsers(users.filter(user => user.userId !== userId))
    } catch {
      alert('User deletion failed')
    }
  }

  const onEditFinished = (refresh = false) => {
    setCurrentUser(undefined);
    if (refresh)
      fetchUsers();
  }

  return (
    <div>
      <Header as="h1">USERS</Header>
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{ color: 'green', labelPosition: 'left', icon: 'add', content: 'Add', onClick: onUserCreate, disabled: !newUserName?.length }}
            fluid
            placeholder="Type here to create a new item.."
            onChange={event => setNewUserName(event.target.value)}
            value={newUserName}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>

      {loadingUsers
        ? <Grid.Row>
          <Loader indeterminate active inline="centered">
            Loading USERS
          </Loader>
        </Grid.Row>
        : <Grid padded>
          {users.map(user =>
            <UserItem key={user.userId} user={user}
              onEdit={() => setCurrentUser(user)}
              onDelete={() => onUserDelete(user.userId)}
            />
          )}
          <EditUser
            isOpen={!!currentUser}
            onClose={(refresh: boolean) => onEditFinished(refresh)}
            onSubmit={(refresh: boolean) => onEditFinished(refresh)}
            user={currentUser}
          />
        </Grid>
      }
    </div>
  )
}

const UserItem = ({ user, onEdit, onDelete }: UserItemProps) => (
  <Grid.Row >
    <Grid.Column width={3} floated="left">
      {user.avatarUrl && (
        <Image src={user.avatarUrl} size="small" wrapped circular />
      )}
    </Grid.Column>
    <Grid.Column width={5} verticalAlign="middle" floated="left">
      <div>
        <strong>Name:</strong> {user.name}
      </div>
      <div>
        <strong>Joined Date:</strong> {user.joinDate}
      </div>
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
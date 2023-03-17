import { Link } from 'react-router-dom'
import { Grid, Icon, Menu, Segment } from 'semantic-ui-react'
import { isAuthenticated, login, logout } from './auth/Auth'
import Todos from './components/Todos'

interface AppProps {
  history: any
}

export default function App(props: AppProps) {
  const iAuth = isAuthenticated();

  return (
    <div>
      <Segment style={{ padding: '8em 0em' }} vertical>
        <Grid container stackable verticalAlign="middle">
          <Grid.Row>
            <Grid.Column width={16}>
              <Menu pointing secondary>
                <Menu.Item name="home">
                  <Link to="/">
                    <Icon name='home' />Home
                  </Link>
                </Menu.Item>
                <Menu.Menu position="right">
                  {iAuth
                    ? <Menu.Item name="logout" onClick={logout}>
                      <Icon name='sign-out' />Log Out
                    </Menu.Item>
                    : <Menu.Item name="login" onClick={login}>
                      <Icon name='user' />Log In
                    </Menu.Item>
                  }
                </Menu.Menu>
              </Menu>
              {!iAuth
                ? <h2>Please login first!</h2>
                : <Todos {...props} />
              }
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </div>
  )
}

import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment, Icon } from 'semantic-ui-react'

import Auth from './auth/Auth'
import EditTodo from './components/EditTodo'
import NotFound from './components/NotFound'
import Todos from './components/Todos'

interface AppProps {
  auth: Auth
  history: any
}

export default function App(props: AppProps) {
  const { history, auth } = props;
  const { login, logout } = auth;
  const isAuthenticated = props.auth.isAuthenticated();

  return (
    <div>
      <Segment style={{ padding: '8em 0em' }} vertical>
        <Grid container stackable verticalAlign="middle">
          <Grid.Row>
            <Grid.Column width={16}>
              <Router history={history}>
                <Menu pointing secondary>
                  <Menu.Item name="home">
                    <Link to="/">
                      <Icon name='home' />Home
                    </Link>
                  </Menu.Item>
                  <Menu.Menu position="right">
                    {isAuthenticated
                      ? <Menu.Item name="logout" onClick={logout}>
                        <Icon name='sign-out' />Log Out
                      </Menu.Item>
                      : <Menu.Item name="login" onClick={login}>
                        <Icon name='user' />Log In
                      </Menu.Item>
                    }
                  </Menu.Menu>
                </Menu>
                {!isAuthenticated
                  ? <h2>Please login first!</h2>
                  : <Switch>
                    <Route exact path="/"
                      render={props => {
                        return <Todos {...props} auth={auth} />
                      }}
                    />

                    <Route exact path="/todos/:todoId/edit"
                      render={props => {
                        return <EditTodo {...props} auth={auth} />
                      }}
                    />
                    <Route component={NotFound} />
                  </Switch>
                }
              </Router>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </div>
  )
}

import createHistory from 'history/createBrowserHistory'
import { Route, Router } from 'react-router-dom'
import { Dimmer, Loader } from 'semantic-ui-react'
import App from './App'
import { handleAuthentication } from './auth/Auth'
const history = createHistory()

const authen = (props: any) => {
  const location = props.location
  if (/access_token|id_token|error/.test(location.hash)) {
    handleAuthentication(history)
  }
}

export const makeAuthRouting = () => {
  return (
    <Router history={history}>
      <div>
        <Route
          path="/callback"
          render={props => {

            authen(props);

            return (
              <Dimmer active>
                <Loader content="Loading" />
              </Dimmer>
            )
          }}
        />
        <Route
          render={props => {
            return <App {...props} />
          }}
        />
      </div>
    </Router>
  )
}

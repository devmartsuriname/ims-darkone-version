import AppProvidersWrapper from './components/wrapper/AppProvidersWrapper'
import configureFakeBackend from './helpers/fake-backend'
import AppRouter from './routes/router'
import SystemSetupChecker from './components/auth/SystemSetupChecker'
import 'choices.js/public/assets/styles/choices.min.css'
import './assets/scss/style.scss'

configureFakeBackend()

function App() {
  try {
    return (
      <>
        <AppProvidersWrapper>
          <SystemSetupChecker>
            <AppRouter />
          </SystemSetupChecker>
        </AppProvidersWrapper>
      </>
    )
  } catch (error) {
    console.error('App error:', error)
    return <div>Error loading app: {String(error)}</div>
  }
}

export default App

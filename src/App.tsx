import AppProvidersWrapper from './components/wrapper/AppProvidersWrapper'
import configureFakeBackend from './helpers/fake-backend'
import AppRouter from './routes/router'
import 'choices.js/public/assets/styles/choices.min.css'
import './assets/scss/style.scss'

configureFakeBackend()

function App() {
  try {
    return (
      <AppProvidersWrapper>
        <AppRouter />
      </AppProvidersWrapper>
    )
  } catch (error) {
    console.error('App error:', error)
    return <div>Error loading app: {String(error)}</div>
  }
}

export default App

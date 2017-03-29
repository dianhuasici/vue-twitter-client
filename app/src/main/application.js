import { app, BrowserWindow } from 'electron'
import AuthenticationWindow from './authentication-window'
import Store from '../renderer/libraries/store'

let winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:${require('../../../config').port}`
  : `file://${__dirname}/index.html`

let store = new Store({ configName: 'user-preferences', defaults: {} })

export default class Application {
  constructor () {
    this.accessToken = null
    this.accessTokenSecret = null
    this.consumerKey = process.env.TWITTER_CONSUMER_KEY
    this.consumerSecret = process.env.TWITTER_CONSUMER_SECRET
    this.mainWindow = undefined
  }

  createWindow () {
    this.mainWindow = new BrowserWindow({
      height: 800,
      width: 1200
    })

    this.mainWindow.loadURL(winURL)

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  openAuthenticationWindow () {
    let defaultUser = store.get('defaultUser')
    if (defaultUser && defaultUser.tokens.accessToken && defaultUser.tokens.accessTokenSecret && defaultUser.tokens.consumerKey && defaultUser.tokens.consumerSecret) {
      this.createWindow()
    } else {
      new AuthenticationWindow().on('authentication-succeeded', (res) => {
        store.set('defaultUser', {
          user: res.user,
          accessToken: res.accessToken,
          accessTokenSecret: res.accessTokenSecret,
          consumerKey: process.env.TWITTER_CONSUMER_KEY,
          consumerSecret: process.env.TWITTER_CONSUMER_SECRET
        })
        console.log(res.user)
        console.log(store.get('defaultUser'))
        this.createWindow()
      })
    }
  }

  onReady () {
    this.openAuthenticationWindow()
  }

  registerApplicationCallback () {
    app.on('ready', this.onReady.bind(this))

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createWindow()
      }
    })
  }

  run () {
    this.registerApplicationCallback()
  }
}

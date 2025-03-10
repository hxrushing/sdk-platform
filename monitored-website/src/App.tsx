import React from 'react'
import TestPage from './components/TestPage'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>埋点SDK测试网站</h1>
      </header>
      <main className="app-main">
        <TestPage />
      </main>
      <footer className="app-footer">
        <p>这是一个用于测试埋点SDK的示例网站</p>
      </footer>
    </div>
  )
}

export default App

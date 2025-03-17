import React from 'react'
import TestPage from './components/TestPage'
import './App.css'

// App 组件是应用的根组件，负责渲染整个应用的结构
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>埋点SDK测试网站</h1>
      </header>
      <main>
        {/* 渲染 TestPage 组件，展示测试页面内容 */}
        <TestPage />
      </main>
      <footer className="App-footer">
        <p>这是一个用于测试埋点SDK的示例网站</p>
      </footer>
    </div>
  )
}

export default App

import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function AppLayout() {
  const auth = useAuth()

  return (
    <div className="appShell">
      <header className="topBar">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div className="brandText">
            <div className="brandTitle">Библиотека научных статей</div>
            <div className="brandSubtitle">кафедры • PDF • теги • цитаты • ИИ</div>
          </div>
        </div>
        <nav className="nav">
          <NavLink to="/articles" className="navLink">
            Статьи
          </NavLink>
          <NavLink to="/upload" className="navLink">
            Загрузка PDF
          </NavLink>
          <div className="navSpacer" />
          {auth.state.status === 'authenticated' ? (
            <>
              <span className="navNote">{auth.state.user.email}</span>
              <button className="navButton" type="button" onClick={auth.logout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="navLink">
                Вход
              </NavLink>
              <NavLink to="/register" className="navLink">
                Регистрация
              </NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
      <footer className="footer">
        <span>Лабораторные работы Fullstack (ЛР3–ЛР7)</span>
      </footer>
    </div>
  )
}


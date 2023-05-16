import Image from 'next/image'
import Link from 'next/link'
import { Fragment, useState, useEffect, useCallback } from 'react'
import {
  BsHouseFill,
  BsPersonFill,
  BsPeopleFill,
  BsGearFill,
  BsQuestionCircleFill,
  BsBoxArrowRight,
  BsBoxArrowInRight,
  BsMoonFill,
  BsSunFill,
} from 'react-icons/bs'
import { useSession, signOut } from 'next-auth/react'

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

export const useLocalStorage = (key: string, initialValue: boolean) => {
  const initialize = (key: string) => {
    try {
      const item = localStorage.getItem(key)
      if (item && item !== 'undefined') {
        return JSON.parse(item)
      }

      localStorage.setItem(key, JSON.stringify(initialValue))
      return initialValue
    } catch {
      return initialValue
    }
  }

  const [state, setState] = useState(initialValue)

  useEffect(() => {
    setState(initialize(key))
  }, [])

  const setValue = useCallback(
    (value: () => any) => {
      try {
        const valueToStore = value instanceof Function ? value() : value
        setState(valueToStore)
        localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.log(error)
      }
    },
    [key, setState]
  )

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.log(e)
    }
  }, [key])

  return [state, setValue, remove]
}

function Header() {
  const [darkMode, setDarkMode] = useLocalStorage('vDarkMode', false)
  const { data: session } = useSession()
  useEffect(() => {
    if (darkMode) {
      window.document.documentElement.classList.add('dark')
    } else {
      window.document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="bg-white dark:bg-zinc-800 text-lg px-4">
      <header className="max-w-6xl mx-auto py-4 flex flex-row justify-between items-center">
        <Link href="/">
          <div className="flex items-center dark:hidden">
            <Image
              src="/img/logo/mattarli-light.svg"
              alt="Logo Dark"
              width={153}
              height={45}
            />
            <svg
              id="base"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="17"
              className="ml-2"
              viewBox="0 0 231.3 204.98"
            >
              <path d="M176.26,204.98c-27.52,0-36.69-29.11-41.47-50.65-19.54,23.13-48.65,50.65-81.35,50.65C18.34,204.98,0,174.67,0,142.77,0,108.87,11.96,77.76,31.9,50.25,49.85,24.73,76.17,0,109.67,0c41.07,0,47.06,43.07,48.25,74.97,13.16-21.14,23.53-43.87,31.11-67.4h37.09c-18.74,39.48-39.48,78.16-64.6,115.65,0,8.77,2.39,49.85,15.95,49.85,15.15,0,20.34-23.53,22.33-35.49h31.5c-7.18,26.32-21.14,67.4-55.03,67.4ZM125.62,54.24c-2.39-11.56-7.98-23.53-21.14-23.53-15.95,0-32.3,14.36-41.87,27.12-17.55,23.13-28.71,52.24-28.71,82.15,0,17.15,5.18,33.1,24.73,33.1,23.53,0,48.65-23.53,61.01-41.87,1.59-1.2,11.17-14.36,11.17-16.75,0-19.94-1.2-40.68-5.18-60.22Z" />
            </svg>
          </div>
          <div className="items-center hidden dark:flex">
            <Image
              src="/img/logo/mattarli-dark.svg"
              alt="Logo Light"
              width={153}
              height={45}
            />
            <svg
              id="base"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="17"
              className="ml-2"
              viewBox="0 0 231.3 204.98"
              fill="white"
            >
              <path d="M176.26,204.98c-27.52,0-36.69-29.11-41.47-50.65-19.54,23.13-48.65,50.65-81.35,50.65C18.34,204.98,0,174.67,0,142.77,0,108.87,11.96,77.76,31.9,50.25,49.85,24.73,76.17,0,109.67,0c41.07,0,47.06,43.07,48.25,74.97,13.16-21.14,23.53-43.87,31.11-67.4h37.09c-18.74,39.48-39.48,78.16-64.6,115.65,0,8.77,2.39,49.85,15.95,49.85,15.15,0,20.34-23.53,22.33-35.49h31.5c-7.18,26.32-21.14,67.4-55.03,67.4ZM125.62,54.24c-2.39-11.56-7.98-23.53-21.14-23.53-15.95,0-32.3,14.36-41.87,27.12-17.55,23.13-28.71,52.24-28.71,82.15,0,17.15,5.18,33.1,24.73,33.1,23.53,0,48.65-23.53,61.01-41.87,1.59-1.2,11.17-14.36,11.17-16.75,0-19.94-1.2-40.68-5.18-60.22Z" />
            </svg>
          </div>
        </Link>
        <nav>
          <ul className="list-none flex items-center gap-4">
            <li>
              <Link href="/" className="hover:opacity-70 duration-200">
                <BsHouseFill className="dark:fill-white" size={25} />
              </Link>
            </li>
            {session && (
              <li>
                <Link
                  href={`/${session.user?.id}`}
                  className="hover:opacity-70 duration-200"
                >
                  <BsPersonFill className="dark:fill-white" size={25} />
                </Link>
              </li>
            )}
            {session && (
              <li>
                <Link
                  href="/settings"
                  className="hover:opacity-70 duration-200"
                >
                  <BsGearFill className="dark:fill-white" size={23} />
                </Link>
              </li>
            )}
            <li>
              <button
                className="hover:opacity-70 duration-200 pt-1"
                onClick={() => {
                  setDarkMode(!darkMode)
                }}
              >
                {darkMode === true ? (
                  <BsSunFill className="dark:fill-white" size={20} />
                ) : (
                  <BsMoonFill size={20} />
                )}
              </button>
            </li>
            {session ? (
              <li>
                <button
                  className="mt-1 hover:opacity-70 duration-200"
                  onClick={() => signOut()}
                >
                  <BsBoxArrowRight className="dark:fill-white" size={25} />
                </button>
              </li>
            ) : (
              <li>
                <Link href="/signin" className="hover:opacity-70 duration-200">
                  <BsBoxArrowInRight className="dark:fill-white" size={25} />
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </header>
    </div>
  )
}

export default Header

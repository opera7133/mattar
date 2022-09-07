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
          <a>
            <div className="dark:hidden">
              <Image
                src="/img/logo/mattarli-light.svg"
                alt="Logo Dark"
                width={153}
                height={45}
              />
            </div>
            <div className="hidden dark:block">
              <Image
                src="/img/logo/mattarli-dark.svg"
                alt="Logo Light"
                width={153}
                height={45}
              />
            </div>
          </a>
        </Link>
        <nav>
          <ul className="list-none flex items-center gap-4">
            <li>
              <Link href="/">
                <a className="hover:opacity-70 duration-200">
                  <BsHouseFill className="dark:fill-white" size={25} />
                </a>
              </Link>
            </li>
            {session && (
              <li>
                <Link href={`/${session.user?.id}`}>
                  <a className="hover:opacity-70 duration-200">
                    <BsPersonFill className="dark:fill-white" size={25} />
                  </a>
                </Link>
              </li>
            )}
            {session && (
              <li>
                <Link href="/settings">
                  <a className="hover:opacity-70 duration-200">
                    <BsGearFill className="dark:fill-white" size={23} />
                  </a>
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
                <Link href="/signin">
                  <a className="hover:opacity-70 duration-200">
                    <BsBoxArrowInRight className="dark:fill-white" size={25} />
                  </a>
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

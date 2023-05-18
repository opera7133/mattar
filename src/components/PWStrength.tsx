import { passwordStrength } from 'check-password-strength'

export const PWStrength = ({ password }: { password: string }) => {
  function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
  }
  return (
    <div className="flex my-3">
      <div className="w-1/4 px-1">
        <div
          className={classNames(
            'h-2 rounded-xl transition-colors bg-gray-200',
            passwordStrength(password).value === 'Too weak' && 'bg-red-500',
            passwordStrength(password).value === 'Weak' && 'bg-orange-500',
            passwordStrength(password).value === 'Medium' && 'bg-yellow-400',
            passwordStrength(password).value === 'Strong' && 'bg-green-500'
          )}
        ></div>
      </div>
      <div className="w-1/4 px-1">
        <div
          className={classNames(
            'h-2 rounded-xl transition-colors bg-gray-200',
            passwordStrength(password).value === 'Weak' && 'bg-orange-500',
            passwordStrength(password).value === 'Medium' && 'bg-yellow-400',
            passwordStrength(password).value === 'Strong' && 'bg-green-500'
          )}
        ></div>
      </div>
      <div className="w-1/4 px-1">
        <div
          className={classNames(
            'h-2 rounded-xl transition-colors bg-gray-200',
            passwordStrength(password).value === 'Medium' && 'bg-yellow-400',
            passwordStrength(password).value === 'Strong' && 'bg-green-500'
          )}
        ></div>
      </div>
      <div className="w-1/4 px-1">
        <div
          className={classNames(
            'h-2 rounded-xl transition-colors bg-gray-200',
            passwordStrength(password).value === 'Strong' && 'bg-green-500'
          )}
        ></div>
      </div>
    </div>
  )
}

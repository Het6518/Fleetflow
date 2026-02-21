export default function InputField({ label, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-300">{label}</label>
      )}
      <input className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function SelectField({ label, error, children, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <select className={`input-field ${error ? 'border-red-500' : ''}`} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

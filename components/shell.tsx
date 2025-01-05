interface ShellProps {
  children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="container relative mx-auto min-h-screen w-full max-w-7xl px-6 py-16">
      {children}
    </div>
  )
}


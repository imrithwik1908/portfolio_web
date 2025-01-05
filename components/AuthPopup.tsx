import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface AuthPopupProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AuthPopup({ isOpen, onClose, onSuccess }: AuthPopupProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setAlert({ 
        type: 'success', 
        message: 'Magic link sent! Please check your email to complete authentication.' 
      })
      
      // Don't close immediately - let user see the success message
      setTimeout(() => {
        setEmail('')
        onClose()
      }, 3000)
    } catch (error) {
      console.error('Error authenticating:', error)
      setAlert({ 
        type: 'error', 
        message: 'Failed to send magic link. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Authenticate as C Sai Rithwik Reddy
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter your email to receive a secure magic link for authentication.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAuthenticate} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="imrithwik1908@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending magic link...' : 'Send Magic Link'}
          </Button>
        </form>
        <AnimatePresence>
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-md ${
                alert.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
              }`}
            >
              <div className="flex items-center">
                {alert.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2" />
                )}
                {alert.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}


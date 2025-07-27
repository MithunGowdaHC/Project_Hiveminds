"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

// Placeholder types for Clerk/Auth0 integration
interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
}

interface AuthContextType {
  user: User | null
  isSignedIn: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

// Create context for auth state
export const AuthContext = createContext<AuthContextType | null>(null)

// Placeholder hook that simulates Clerk/Auth0 behavior
export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem("excelerate_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate successful login
    const mockUser: User = {
      id: "user_123",
      email,
      firstName: email.split("@")[0],
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    }

    setUser(mockUser)
    localStorage.setItem("excelerate_user", JSON.stringify(mockUser))
    setIsLoading(false)
  }

  const signUp = async (email: string, password: string) => {
    setIsLoading(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate successful signup
    const mockUser: User = {
      id: "user_" + Date.now(),
      email,
      firstName: email.split("@")[0],
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    }

    setUser(mockUser)
    localStorage.setItem("excelerate_user", JSON.stringify(mockUser))
    setIsLoading(false)
  }

  const signOut = async () => {
    setIsLoading(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    setUser(null)
    localStorage.removeItem("excelerate_user")
    setIsLoading(false)
  }

  const signInWithGoogle = async () => {
    setIsLoading(true)
    // Simulate Google OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockUser: User = {
      id: "google_user_123",
      email: "user@gmail.com",
      firstName: "John",
      lastName: "Doe",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
    }

    setUser(mockUser)
    localStorage.setItem("excelerate_user", JSON.stringify(mockUser))
    setIsLoading(false)
  }

  return {
    user,
    isSignedIn: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  }
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider")
  }
  return context
}

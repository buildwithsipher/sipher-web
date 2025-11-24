// Waitlist API types

import { StartupStage } from './database'

export interface WaitlistRequest {
  email: string
  name: string
  startupName?: string
  startupStage?: StartupStage
  linkedinUrl?: string
  referralCode?: string
}

export interface WaitlistResponse {
  success: boolean
  position: number
  referralCode: string
}

export interface WaitlistError {
  error: string
}

export interface AdminApproveRequest {
  userId: string
}

export interface AdminApproveResponse {
  success: boolean
  message: string
}

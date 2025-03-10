import { create } from 'zustand'

interface GlobalState {
  userInfo: null | { name: string }
  trackingConfig: { projectId: string }
  setUserInfo: (info: any) => void
}

const useGlobalStore = create<GlobalState>(set => ({
  userInfo: null,
  trackingConfig: { projectId: 'default-project' },
  setUserInfo: (info) => set({ userInfo: info })
}))

export default useGlobalStore
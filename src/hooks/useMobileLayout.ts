import { useEffect, useState } from 'react'

const MOBILE_LAYOUT_QUERY = '(max-width: 1023px)'

export function useMobileLayout() {
  const getMatches = () =>
    typeof window !== 'undefined' && window.matchMedia(MOBILE_LAYOUT_QUERY).matches

  const [isMobileLayout, setIsMobileLayout] = useState(getMatches)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(MOBILE_LAYOUT_QUERY)
    const syncLayout = () => setIsMobileLayout(mediaQuery.matches)
    syncLayout()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncLayout)
      return () => mediaQuery.removeEventListener('change', syncLayout)
    }

    mediaQuery.addListener(syncLayout)
    return () => mediaQuery.removeListener(syncLayout)
  }, [])

  return isMobileLayout
}

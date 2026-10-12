import { createRoot } from 'react-dom/client'
import '@fontsource/cormorant-garamond/latin-400.css'
import '@fontsource/cormorant-garamond/latin-400-italic.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-600.css'
import '@fontsource/cormorant-garamond/latin-700.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import '@fontsource/caveat/latin-400.css'
import '@fontsource/caveat/latin-600.css'
import './index.css'
import App from './App'
import { primeAudio } from './audio/sound'

const container = document.getElementById('root')
if (!container) throw new Error('Missing #root element')

// Audio is only ever unlocked by a real gesture, and only ever plays if the
// visitor turns it on.
const unlock = () => primeAudio()
window.addEventListener('pointerdown', unlock, { once: true, passive: true })
window.addEventListener('keydown', unlock, { once: true })

createRoot(container).render(<App />)

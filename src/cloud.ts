import { doc } from 'firebase/firestore/lite'
import { useFirestore, useDocument } from 'vuefire'

const firestore = useFirestore()
const submissions = useDocument(doc(firestore, import.meta.env.VITE_FIRESTORE_COLLECTION, import.meta.env.VITE_FIRESTORE_DOCUMENT))

export { submissions }
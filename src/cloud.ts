import { collection } from 'firebase/firestore/lite'
import { useFirestore, useCollection } from 'vuefire'

const firestore = useFirestore()
const submissions = useCollection(collection(firestore, import.meta.env.VITE_FIRESTORE_COLLECTION))

export { submissions }
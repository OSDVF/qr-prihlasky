import { collection } from 'firebase/firestore'
import { computed, type App, type ComputedRef } from 'vue'
import { useFirestore, useCollection, type VueFirestoreQueryData } from 'vuefire'

export type SubmissionState = { name?: string, surname?: string, email: string, price?: string, paid?: boolean }

export default {
    install(app: App) {
        const firestore = useFirestore()
        const submissions = computed(() => useCollection<SubmissionState>(firestore ? collection(firestore, import.meta.env.VITE_FIRESTORE_COLLECTION ?? 'submissions') : null, {
            wait: true
        }).value)


        function searchSubmission(codeOrNameOrEmail: string, surnameOrEmailOnly?: string | true): SubmissionState | undefined {
            if (!submissions.value || !submissions.value.length) {
                throw 'Databáze ještě nebyla načtena'
            }
            const cLower = codeOrNameOrEmail.toLowerCase()

            for (const submission of submissions.value) {
                let nameMatches = 0

                if (surnameOrEmailOnly === true) {
                    if (submission.email.trim().toLowerCase() == cLower.trim()) {
                        return submission
                    }
                }
                else {
                    for (const c of cLower.split(' ')) {
                        if (submission.id.substring(7, 14).toLowerCase() === c) {
                            return submission
                        }

                        if (submission.name?.trim().toLowerCase().includes(c)) {
                            nameMatches++
                        }
                    }
                    if (surnameOrEmailOnly) {
                        for (const s of surnameOrEmailOnly.trim().toLowerCase().split(' ')) {
                            if (submission.surname?.trim().toLowerCase().includes(s)) {
                                nameMatches++
                            }
                        }
                    }
                }

                if (nameMatches >= 2) {
                    return submission
                }
            }
        }
        app.config.globalProperties.$searchSubmission = searchSubmission
        app.config.globalProperties.$submissions = submissions
        app.provide('searchSubmission', searchSubmission)
        app.provide('submissions', submissions)
    }
}

export type searchSubmission = (codeOrNameOrEmail: string, surnameOrEmailOnly?: string | true) => SubmissionState | undefined
export type submissions = ComputedRef<VueFirestoreQueryData<SubmissionState>>
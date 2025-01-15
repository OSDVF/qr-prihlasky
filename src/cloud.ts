import { collection, or, query, where } from 'firebase/firestore'
import { type App, type ComputedRef } from 'vue'
import { useFirestore, useCollection, type VueFirestoreQueryData } from 'vuefire'

export type SubmissionState = { name?: string, surname?: string, email?: string, price?: string, paid?: boolean }
export type Code<T> = { code: string} & T

export default {
    install(app: App) {
        const firestore = useFirestore()
        const submissions = useCollection<SubmissionState>(query(collection(firestore, import.meta.env.VITE_FIRESTORE_COLLECTION ?? 'submissions'), or(where("price", ">", ''), where("price", ">=", 0)) ), {
            wait: true
        })


        function searchSubmission(codeOrNameOrEmail: string, surnameOrEmailOnly?: string | true): Code<SubmissionState>[] {
            if (!submissions.value || !submissions.value.length) {
                throw 'Databáze ještě nebyla načtena'
            }
            const cLower = codeOrNameOrEmail.toLowerCase()
            const candidates = new Set<Code<SubmissionState>>()
            
            for (const submission of submissions.value) {
                function addCandidate() {
                    candidates.add({ code: submission.id.substring(7, 14), paid: submission.paid || parseFloat(submission.price ?? '1') == 0, ...submission })
                }
                let nameMatches = 0

                if (surnameOrEmailOnly === true) {
                    if (submission.email?.trim().toLowerCase() == cLower.trim()) {
                        addCandidate()
                        continue
                    }
                }
                else {
                    let codeMatch = false
                    for (const c of cLower.split(' ')) {
                        if (submission.id.substring(7, 14).toLowerCase() === c) {
                            addCandidate()
                            codeMatch = true
                            break
                        }

                        if (submission.name?.trim().toLowerCase().includes(c)) {
                            nameMatches++
                        }
                    }
                    if(codeMatch) continue

                    if (surnameOrEmailOnly) {
                        for (const s of surnameOrEmailOnly.trim().toLowerCase().split(' ')) {
                            if (submission.surname?.trim().toLowerCase().includes(s)) {
                                nameMatches++
                            }
                        }
                    }
                }

                if (nameMatches >= 2) {
                    addCandidate()
                    continue
                }
            }
            return Array.from(candidates)
        }
        app.config.globalProperties.$searchSubmission = searchSubmission
        app.config.globalProperties.$submissions = submissions
        app.provide('searchSubmission', searchSubmission)
        app.provide('submissions', submissions)
    }
}

export type searchSubmission = (codeOrNameOrEmail: string, surnameOrEmailOnly?: string | true) => Code<SubmissionState>[]
export type submissions = ComputedRef<VueFirestoreQueryData<SubmissionState>>